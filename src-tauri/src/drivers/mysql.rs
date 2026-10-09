use super::DatabaseAdapter;
use crate::error::{AppError, AppResult};
use crate::models::{ColumnMetadata, ColumnSchema, ConnectionConfig, DatabaseTree, QueryResult, TableSchema};
use async_trait::async_trait;
use sqlx::mysql::MySqlPoolOptions;
use sqlx::{Column, MySqlPool, Row, TypeInfo};
use std::time::Instant;

pub struct MysqlAdapter {
    pool: MySqlPool,
}

impl MysqlAdapter {
    pub async fn connect(config: &ConnectionConfig) -> AppResult<Self> {
        let host = config.host.as_deref().unwrap_or("localhost");
        let port = config.port.unwrap_or(3306);
        let user = config.username.as_deref().unwrap_or("root");
        let password = config.password.as_deref().unwrap_or("");
        let database = config.database.as_deref().unwrap_or("");

        let url = format!("mysql://{}:{}@{}:{}/{}", user, password, host, port, database);

        let pool = MySqlPoolOptions::new()
            .max_connections(5)
            .acquire_timeout(std::time::Duration::from_secs(5))
            .connect(&url)
            .await
            .map_err(AppError::Database)?;

        Ok(Self { pool })
    }
}

#[async_trait]
impl DatabaseAdapter for MysqlAdapter {
    async fn ping(&self) -> AppResult<()> {
        sqlx::query("SELECT 1")
            .execute(&self.pool)
            .await
            .map_err(AppError::Database)?;
        Ok(())
    }

    async fn execute_query(&self, sql: &str) -> AppResult<QueryResult> {
        let start = Instant::now();
        let rows = sqlx::query(sql)
            .fetch_all(&self.pool)
            .await
            .map_err(AppError::Database)?;

        let execution_time_ms = start.elapsed().as_millis() as u64;
        let mut columns_meta = Vec::new();
        let mut result_rows = Vec::new();

        if let Some(first_row) = rows.first() {
            for col in first_row.columns() {
                columns_meta.push(ColumnMetadata {
                    name: col.name().to_string(),
                    data_type: col.type_info().name().to_string(),
                    nullable: true,
                });
            }
        }

        for row in rows.iter() {
            let mut row_data = Vec::new();
            for (idx, _col) in row.columns().iter().enumerate() {
                let text_val: Result<String, _> = row.try_get(idx);
                let json_val = match text_val {
                    Ok(t) => serde_json::Value::String(t),
                    Err(_) => {
                        let int_val: Result<i64, _> = row.try_get(idx);
                        match int_val {
                            Ok(i) => serde_json::json!(i),
                            Err(_) => {
                                let float_val: Result<f64, _> = row.try_get(idx);
                                match float_val {
                                    Ok(f) => serde_json::json!(f),
                                    Err(_) => {
                                        let bool_val: Result<bool, _> = row.try_get(idx);
                                        match bool_val {
                                            Ok(b) => serde_json::json!(b),
                                            Err(_) => serde_json::Value::Null,
                                        }
                                    }
                                }
                            }
                        }
                    }
                };
                row_data.push(json_val);
            }
            result_rows.push(row_data);
        }

        let rows_affected = rows.len() as u64;

        Ok(QueryResult {
            columns: columns_meta,
            rows: result_rows,
            rows_affected,
            execution_time_ms,
        })
    }

    async fn get_schema_tree(&self) -> AppResult<DatabaseTree> {
        let db_rows = sqlx::query("SHOW DATABASES;")
            .fetch_all(&self.pool)
            .await
            .map_err(AppError::Database)?;

        let databases: Vec<String> = db_rows.iter().filter_map(|r| r.try_get(0).ok()).collect();

        let table_rows = sqlx::query(
            "SELECT table_schema, table_name, table_type FROM information_schema.tables WHERE table_schema NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys') ORDER BY table_name;"
        )
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::Database)?;

        let tables: Vec<TableSchema> = table_rows
            .iter()
            .map(|r| TableSchema {
                name: r.get::<String, _>("table_name"),
                schema_name: Some(r.get::<String, _>("table_schema")),
                table_type: r.get::<String, _>("table_type"),
                row_count_estimate: None,
            })
            .collect();

        Ok(DatabaseTree { databases, tables })
    }

    async fn get_table_columns(&self, table_name: &str) -> AppResult<Vec<ColumnSchema>> {
        let query_str = "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = ? ORDER BY ordinal_position;";
        let rows = sqlx::query(query_str)
            .bind(table_name)
            .fetch_all(&self.pool)
            .await
            .map_err(AppError::Database)?;

        let cols = rows
            .iter()
            .map(|r| ColumnSchema {
                name: r.get::<String, _>("column_name"),
                data_type: r.get::<String, _>("data_type"),
                is_nullable: r.get::<String, _>("is_nullable") == "YES",
                is_primary_key: false,
                default_value: r.try_get::<String, _>("column_default").ok(),
            })
            .collect();

        Ok(cols)
    }

    async fn close(&self) -> AppResult<()> {
        self.pool.close().await;
        Ok(())
    }
}
