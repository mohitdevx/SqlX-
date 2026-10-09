use crate::error::AppResult;
use crate::utils::fs_theme::{list_custom_themes, load_theme_file, ThemeMetadata};

#[tauri::command]
pub async fn get_available_themes() -> AppResult<Vec<ThemeMetadata>> {
    list_custom_themes()
}

#[tauri::command]
pub async fn load_custom_theme(file_path: String) -> AppResult<serde_json::Value> {
    load_theme_file(&file_path)
}
