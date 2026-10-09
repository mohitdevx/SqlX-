use crate::error::{AppError, AppResult};
use crate::models::{ColumnSchema, DatabaseTree};
use crate::state::AppState;
use tauri::State;

#[tauri::command]
pub async fn get_schema_tree(
    connection_id: String,
    state: State<'_, AppState>,
) -> AppResult<DatabaseTree> {
    let session = {
        let guard = state.active_sessions.read();
        guard
            .get(&connection_id)
            .cloned()
            .ok_or_else(|| AppError::ConnectionNotFound(connection_id))?
    };

    session.get_schema_tree().await
}

#[tauri::command]
pub async fn get_table_columns(
    connection_id: String,
    table_name: String,
    state: State<'_, AppState>,
) -> AppResult<Vec<ColumnSchema>> {
    let session = {
        let guard = state.active_sessions.read();
        guard
            .get(&connection_id)
            .cloned()
            .ok_or_else(|| AppError::ConnectionNotFound(connection_id))?
    };

    session.get_table_columns(&table_name).await
}
