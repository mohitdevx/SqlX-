use super::DatabaseAdapter;
use crate::error::{AppError, AppResult};
use crate::models::{
    ColumnSchema, ConnectionConfig, DatabaseTree, QueryResult, TableSchema,
};
use crate::utils::sql_parser::split_sql_statements;
use async_trait::async_trait;
use sqlx::sqlite::SqlitePoolOptions;
use sqlx::{Row, SqlitePool};
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
        sqlx::raw_sql("SELECT 1")
            .execute(&self.pool)
            .await
            .map_err(AppError::Database)?;
        Ok(())
    }

    async fn execute_query(&self, sql: &str) -> AppResult<QueryResult> {
        let statements = split_sql_statements(sql);
        if statements.is_empty() {
            return Ok(super::common::empty_query_result(0, 0));
        }

        let start = Instant::now();
        let mut last_result: Option<QueryResult> = None;
        let mut total_affected = 0u64;

        for stmt in &statements {
            let trimmed = stmt.trim();
            if trimmed.is_empty() {
                continue;
            }

            let rows = sqlx::raw_sql(trimmed)
                .fetch_all(&self.pool)
                .await
                .map_err(AppError::Database)?;

            let columns_meta = rows
                .first()
                .map(|r| super::common::extract_columns_metadata(r.columns()))
                .unwrap_or_default();

            let mut result_rows = Vec::with_capacity(rows.len());
            for row in rows.iter() {
                let mut row_data = Vec::with_capacity(row.columns().len());
                for (idx, _col) in row.columns().iter().enumerate() {
                    row_data.push(crate::decode_cell_to_json!(row, idx));
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
        Ok(super::common::finalize_query_result(
            last_result,
            statements.len(),
            total_affected,
            execution_time_ms,
        ))
    }

    async fn get_schema_tree(&self) -> AppResult<DatabaseTree> {
        let table_rows = sqlx::raw_sql(
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
        let rows = sqlx::raw_sql(&pragma_sql)
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
