use crate::error::{AppError, AppResult};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThemeMetadata {
    pub id: String,
    pub name: String,
    pub file_path: String,
    pub is_custom: bool,
}

pub fn get_themes_dir() -> AppResult<PathBuf> {
    let mut config_dir = dirs::config_dir().ok_or_else(|| {
        AppError::Generic("Could not determine user config directory".to_string())
    })?;
    config_dir.push("sqlx");
    config_dir.push("themes");
    
    if !config_dir.exists() {
        fs::create_dir_all(&config_dir)?;
    }
    
    Ok(config_dir)
}

pub fn list_custom_themes() -> AppResult<Vec<ThemeMetadata>> {
    let themes_dir = get_themes_dir()?;
    let mut themes = Vec::new();

    if let Ok(entries) = fs::read_dir(themes_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().and_then(|e| e.to_str()) == Some("json") {
                let file_name = path.file_stem().and_then(|s| s.to_str()).unwrap_or("unknown");
                if let Ok(content) = fs::read_to_string(&path) {
                    if let Ok(val) = serde_json::from_str::<serde_json::Value>(&content) {
                        let name = val["name"].as_str().unwrap_or(file_name).to_string();
                        themes.push(ThemeMetadata {
                            id: file_name.to_string(),
                            name,
                            file_path: path.to_string_lossy().to_string(),
                            is_custom: true,
                        });
                    }
                }
            }
        }
    }

    Ok(themes)
}

pub fn load_theme_file(file_path: &str) -> AppResult<serde_json::Value> {
    let content = fs::read_to_string(file_path)?;
    let val: serde_json::Value = serde_json::from_str(&content)?;
    Ok(val)
}
