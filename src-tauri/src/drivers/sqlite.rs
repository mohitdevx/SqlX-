use super::DatabaseAdapter;
use crate::error::{AppError, AppResult};
use crate::models::{ColumnMetadata, ColumnSchema, ConnectionConfig, DatabaseTree, QueryResult, TableSchema};
use crate::utils::sql_parser::split_sql_statements;
use async_trait::async_trait;
use sqlx::sqlite::SqlitePoolOptions;
use sqlx::{Column, Row, SqlitePool, TypeInfo};
use std::time::Instant;

pub struct SqliteAdapter {
    pool: SqlitePool,
}

impl SqliteAdapter {
    pub async fn connect(config: &ConnectionConfig) -> AppResult<Self> {
        let path = config.file_path.as_deref().unwrap_or("sqlite.db");
        let url = format!("sqlite:{}?mode=rwc", path);

        let pool = SqlitePoolOptions::new()
            .max_connections(5)
            .connect(&url)
            .await
            .map_err(AppError::Database)?;

        Ok(Self { pool })
    }
}

#[async_trait]
impl DatabaseAdapter for SqliteAdapter {
    async fn ping(&self) -> AppResult<()> {
        sqlx::query("SELECT 1")
            .execute(&self.pool)
            .await
            .map_err(AppError::Database)?;
        Ok(())
    }

    async fn execute_query(&self, sql: &str) -> AppResult<QueryResult> {
        let statements = split_sql_statements(sql);
        if statements.is_empty() {
            return Ok(QueryResult {
                columns: Vec::new(),
                rows: Vec::new(),
                rows_affected: 0,
                execution_time_ms: 0,
            });
        }

        let start = Instant::now();
        let mut last_result: Option<QueryResult> = None;
        let mut total_affected = 0u64;

        for stmt in &statements {
            let trimmed = stmt.trim();
            if trimmed.is_empty() {
                continue;
            }

            let rows = sqlx::query(trimmed)
                .fetch_all(&self.pool)
                .await
                .map_err(AppError::Database)?;

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

            let rows_count = rows.len() as u64;
            total_affected += rows_count;

            last_result = Some(QueryResult {
                columns: columns_meta,
                rows: result_rows,
                rows_affected: rows_count,
                execution_time_ms: 0,
            });
        }

        let execution_time_ms = start.elapsed().as_millis() as u64;

        if let Some(mut res) = last_result {
            res.execution_time_ms = execution_time_ms;
            if statements.len() > 1 && res.rows_affected == 0 {
                res.rows_affected = total_affected;
            }
            Ok(res)
        } else {
            Ok(QueryResult {
                columns: Vec::new(),
                rows: Vec::new(),
                rows_affected: total_affected,
                execution_time_ms,
            })
        }
    }

    async fn get_schema_tree(&self) -> AppResult<DatabaseTree> {
        let table_rows = sqlx::query(
            "SELECT name, type FROM sqlite_master WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%' ORDER BY name;"
        )
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::Database)?;

        let tables: Vec<TableSchema> = table_rows
            .iter()
            .map(|r| TableSchema {
                name: r.get::<String, _>("name"),
                schema_name: None,
                table_type: r.get::<String, _>("type").to_uppercase(),
                row_count_estimate: None,
            })
            .collect();

        Ok(DatabaseTree {
            databases: vec!["main".to_string()],
            tables,
        })
    }

    async fn get_table_columns(&self, table_name: &str) -> AppResult<Vec<ColumnSchema>> {
        let pragma_sql = format!("PRAGMA table_info({});", table_name);
        let rows = sqlx::query(&pragma_sql)
            .fetch_all(&self.pool)
            .await
            .map_err(AppError::Database)?;

        let cols = rows
            .iter()
            .map(|r| ColumnSchema {
                name: r.get::<String, _>("name"),
                data_type: r.get::<String, _>("type"),
                is_nullable: r.get::<i64, _>("notnull") == 0,
                is_primary_key: r.get::<i64, _>("pk") > 0,
                default_value: r.try_get::<String, _>("dflt_value").ok(),
            })
            .collect();

        Ok(cols)
    }

    async fn close(&self) -> AppResult<()> {
        self.pool.close().await;
        Ok(())
    }
}
