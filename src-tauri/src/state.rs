use crate::drivers::DatabaseAdapter;
use crate::models::ConnectionConfig;
use parking_lot::RwLock;
use std::collections::HashMap;
use std::sync::Arc;

pub struct AppState {
    pub connections: RwLock<HashMap<String, ConnectionConfig>>,
    pub active_sessions: RwLock<HashMap<String, Arc<Box<dyn DatabaseAdapter>>>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            connections: RwLock::new(HashMap::new()),
            active_sessions: RwLock::new(HashMap::new()),
        }
    }
}
