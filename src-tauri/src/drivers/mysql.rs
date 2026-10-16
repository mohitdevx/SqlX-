use super::DatabaseAdapter;
use crate::error::{AppError, AppResult};
use crate::models::{
    ColumnSchema, ConnectionConfig, DatabaseTree, QueryResult, TableSchema,
};
use crate::utils::sql_parser::split_sql_statements;
use async_trait::async_trait;
use sqlx::mysql::MySqlPoolOptions;
use sqlx::{MySqlPool, Row};
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

        let url = format!(
            "mysql://{}:{}@{}:{}/{}",
            user, password, host, port, database
        );

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
        sqlx::raw_sql("SELECT 1")
            .execute(&self.pool)
            .await
            .map_err(AppError::Database)?;
        Ok(())
    }

    async fn execute_query(
        &self,
        sql: &str,
        limit: Option<usize>,
        offset: Option<usize>,
    ) -> AppResult<QueryResult> {
        let statements = split_sql_statements(sql);
        if statements.is_empty() {
            return Ok(super::common::empty_query_result(0, 0));
        }

        let start = Instant::now();
        let mut last_result: Option<QueryResult> = None;
        let mut total_affected = 0u64;

        // Default safety limit of 1,000 rows if none provided, capped at maximum 50,000 for safety
        let max_fetch = limit.unwrap_or(1000).min(50_000);
        let skip_rows = offset.unwrap_or(0);

        for stmt in &statements {
            let trimmed = stmt.trim();
            if trimmed.is_empty() {
                continue;
            }

            use futures::StreamExt;
            let mut stream = sqlx::raw_sql(trimmed).fetch(&self.pool);

            let mut columns_meta = Vec::new();
            let mut result_rows = Vec::with_capacity(max_fetch.min(1000));
            let mut rows_count = 0u64;
            let mut has_more = false;
            let mut skipped = 0usize;

            while let Some(item) = stream.next().await {
                let row = item.map_err(AppError::Database)?;

                if columns_meta.is_empty() {
                    columns_meta = super::common::extract_columns_metadata(row.columns());
                }

                if skipped < skip_rows {
                    skipped += 1;
                    continue;
                }

                if result_rows.len() < max_fetch {
                    let mut row_data = Vec::with_capacity(row.columns().len());
                    for (idx, _col) in row.columns().iter().enumerate() {
                        row_data.push(crate::decode_mysql_cell_to_json!(row, idx));
                    }
                    result_rows.push(row_data);
                    rows_count += 1;
                } else {
                    has_more = true;
                    // Stop streaming immediately to avoid memory bloat and OOM
                    break;
                }
            }

            total_affected += rows_count;

            last_result = Some(QueryResult {
                columns: columns_meta,
                rows: result_rows,
                rows_affected: rows_count,
                execution_time_ms: 0,
                truncated: has_more,
                has_more,
            });
        }

        let execution_time_ms = start.elapsed().as_millis() as u64;
        Ok(super::common::finalize_query_result(
            last_result,
            statements.len(),
            total_affected,
            execution_time_ms,
        ))
    }

    async fn get_schema_tree(&self) -> AppResult<DatabaseTree> {
        let db_rows = sqlx::raw_sql("SHOW DATABASES;")
            .fetch_all(&self.pool)
            .await;

        let databases: Vec<String> = match db_rows {
            Ok(rows) => rows.iter().filter_map(|r| r.try_get(0).ok()).collect(),
            Err(_) => Vec::new(),
        };

        let table_rows = sqlx::raw_sql(
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
        let query_str = format!(
            "SELECT column_name, data_type, is_nullable, column_default, column_key FROM information_schema.columns WHERE table_name = '{}' ORDER BY ordinal_position;",
            table_name.replace('\'', "''")
        );
        let rows = sqlx::raw_sql(&query_str)
            .fetch_all(&self.pool)
            .await
            .map_err(AppError::Database)?;

        let cols = rows
            .iter()
            .map(|r| ColumnSchema {
                name: r.get::<String, _>("column_name"),
                data_type: r.get::<String, _>("data_type"),
                is_nullable: r.get::<String, _>("is_nullable") == "YES",
                is_primary_key: r
                    .try_get::<String, _>("column_key")
                    .map(|k| k == "PRI")
                    .unwrap_or(false),
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
