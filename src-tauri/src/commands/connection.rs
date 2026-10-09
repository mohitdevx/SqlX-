use crate::drivers::create_adapter;
use crate::error::AppResult;
use crate::models::ConnectionConfig;
use crate::state::AppState;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub async fn test_connection(config: ConnectionConfig) -> AppResult<bool> {
    let adapter = create_adapter(&config).await?;
    adapter.ping().await?;
    adapter.close().await?;
    Ok(true)
}

#[tauri::command]
pub async fn connect_database(
    config: ConnectionConfig,
    state: State<'_, AppState>,
) -> AppResult<String> {
    let adapter = create_adapter(&config).await?;
    adapter.ping().await?;

    let connection_id = config.id.clone();
    state
        .connections
        .write()
        .insert(connection_id.clone(), config);
    state
        .active_sessions
        .write()
        .insert(connection_id.clone(), Arc::new(adapter));

    Ok(connection_id)
}

#[tauri::command]
pub async fn disconnect_database(
    connection_id: String,
    state: State<'_, AppState>,
) -> AppResult<()> {
    let maybe_adapter = {
        let mut guard = state.active_sessions.write();
        guard.remove(&connection_id)
    };

    if let Some(adapter) = maybe_adapter {
        adapter.close().await?;
    }

    state.connections.write().remove(&connection_id);
    Ok(())
}
