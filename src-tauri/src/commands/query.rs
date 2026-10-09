use crate::error::{AppError, AppResult};
use crate::models::{QueryRequest, QueryResult};
use crate::state::AppState;
use tauri::State;

#[tauri::command]
pub async fn execute_query(
    request: QueryRequest,
    state: State<'_, AppState>,
) -> AppResult<QueryResult> {
    let session = {
        let guard = state.active_sessions.read();
        guard
            .get(&request.connection_id)
            .cloned()
            .ok_or_else(|| AppError::ConnectionNotFound(request.connection_id.clone()))?
    };

    session.execute_query(&request.sql).await
}
