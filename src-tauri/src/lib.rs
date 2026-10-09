pub mod commands;
pub mod drivers;
pub mod error;
pub mod models;
pub mod state;
pub mod utils;

use state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .manage(AppState::new())
        .invoke_handler(tauri::generate_handler![
            commands::connection::test_connection,
            commands::connection::connect_database,
            commands::connection::disconnect_database,
            commands::query::execute_query,
            commands::schema::get_schema_tree,
            commands::schema::get_table_columns,
            commands::theme::get_available_themes,
            commands::theme::load_custom_theme,
        ])
        .run(tauri::generate_context!())
        .expect("error while running sqlx desktop application");
}
