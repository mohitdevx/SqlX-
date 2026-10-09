pub mod mysql;
pub mod postgres;
pub mod sqlite;

use crate::error::AppResult;
use crate::models::{ColumnSchema, ConnectionConfig, DatabaseDriver, DatabaseTree, QueryResult, TableSchema};
use async_trait::async_trait;

#[async_trait]
pub trait DatabaseAdapter: Send + Sync {
    async fn ping(&self) -> AppResult<()>;
    async fn execute_query(&self, sql: &str) -> AppResult<QueryResult>;
    async fn get_schema_tree(&self) -> AppResult<DatabaseTree>;
    async fn get_table_columns(&self, table_name: &str) -> AppResult<Vec<ColumnSchema>>;
    async fn close(&self) -> AppResult<()>;
}

pub async fn create_adapter(config: &ConnectionConfig) -> AppResult<Box<dyn DatabaseAdapter>> {
    match config.driver {
        DatabaseDriver::Postgres => {
            let adapter = postgres::PostgresAdapter::connect(config).await?;
            Ok(Box::new(adapter))
        }
        DatabaseDriver::Mysql => {
            let adapter = mysql::MysqlAdapter::connect(config).await?;
            Ok(Box::new(adapter))
        }
        DatabaseDriver::Sqlite => {
            let adapter = sqlite::SqliteAdapter::connect(config).await?;
            Ok(Box::new(adapter))
        }
    }
}
