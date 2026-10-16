use crate::models::{ColumnMetadata, QueryResult};

#[macro_export]
macro_rules! decode_mysql_cell_to_json {
    ($row:expr, $idx:expr) => {{
        use sqlx::Row;
        use sqlx::ValueRef;
        let is_null = match $row.try_get_raw($idx) {
            Ok(ref val_ref) => val_ref.is_null(),
            Err(_) => false,
        };

        if is_null {
            serde_json::Value::Null
        } else {
            // Check String first
            if let Ok(val) = $row.try_get::<String, _>($idx) {
                serde_json::Value::String(val)
            // MySQL integer types - crucial for AUTO_INCREMENT / IDs
            } else if let Ok(val) = $row.try_get::<i32, _>($idx) {
                serde_json::json!(val)
            } else if let Ok(val) = $row.try_get::<u32, _>($idx) {
                serde_json::json!(val)
            } else if let Ok(val) = $row.try_get::<i64, _>($idx) {
                serde_json::json!(val)
            } else if let Ok(val) = $row.try_get::<u64, _>($idx) {
                serde_json::json!(val)
            } else if let Ok(val) = $row.try_get::<i16, _>($idx) {
                serde_json::json!(val)
            } else if let Ok(val) = $row.try_get::<u16, _>($idx) {
                serde_json::json!(val)
            } else if let Ok(val) = $row.try_get::<i8, _>($idx) {
                serde_json::json!(val)
            } else if let Ok(val) = $row.try_get::<u8, _>($idx) {
                serde_json::json!(val)
            // Floats
            } else if let Ok(val) = $row.try_get::<f64, _>($idx) {
                serde_json::json!(val)
            } else if let Ok(val) = $row.try_get::<f32, _>($idx) {
                serde_json::json!(val)
            // Boolean
            } else if let Ok(val) = $row.try_get::<bool, _>($idx) {
                serde_json::json!(val)
            // Date & Time
            } else if let Ok(val) = $row.try_get::<chrono::NaiveDateTime, _>($idx) {
                serde_json::Value::String(val.to_string())
            } else if let Ok(val) = $row.try_get::<chrono::DateTime<chrono::Utc>, _>($idx) {
                serde_json::Value::String(val.to_rfc3339())
            } else if let Ok(val) = $row.try_get::<chrono::NaiveDate, _>($idx) {
                serde_json::Value::String(val.to_string())
            } else if let Ok(val) = $row.try_get::<chrono::NaiveTime, _>($idx) {
                serde_json::Value::String(val.to_string())
            // UUID
            } else if let Ok(val) = $row.try_get::<uuid::Uuid, _>($idx) {
                serde_json::Value::String(val.to_string())
            // JSON
            } else if let Ok(val) = $row.try_get::<serde_json::Value, _>($idx) {
                val
            // Binary / raw bytes
            } else if let Ok(val) = $row.try_get::<Vec<u8>, _>($idx) {
                match String::from_utf8(val) {
                    Ok(s) => serde_json::Value::String(s),
                    Err(e) => {
                        let hex_str: String = e
                            .into_bytes()
                            .iter()
                            .map(|b| format!("{:02X}", b))
                            .collect();
                        serde_json::Value::String(format!("0x{}", hex_str))
                    }
                }
            } else {
                serde_json::Value::Null
            }
        }
    }};
}

#[macro_export]
macro_rules! decode_sqlite_cell_to_json {
    ($row:expr, $idx:expr) => {{
        use sqlx::Row;
        use sqlx::ValueRef;
        let is_null = match $row.try_get_raw($idx) {
            Ok(ref val_ref) => val_ref.is_null(),
            Err(_) => false,
        };

        if is_null {
            serde_json::Value::Null
        } else {
            if let Ok(val) = $row.try_get::<String, _>($idx) {
                serde_json::Value::String(val)
            } else if let Ok(val) = $row.try_get::<i64, _>($idx) {
                serde_json::json!(val)
            } else if let Ok(val) = $row.try_get::<i32, _>($idx) {
                serde_json::json!(val)
            } else if let Ok(val) = $row.try_get::<u32, _>($idx) {
                serde_json::json!(val)
            } else if let Ok(val) = $row.try_get::<u64, _>($idx) {
                serde_json::json!(val)
            } else if let Ok(val) = $row.try_get::<i16, _>($idx) {
                serde_json::json!(val)
            } else if let Ok(val) = $row.try_get::<u16, _>($idx) {
                serde_json::json!(val)
            } else if let Ok(val) = $row.try_get::<i8, _>($idx) {
                serde_json::json!(val)
            } else if let Ok(val) = $row.try_get::<u8, _>($idx) {
                serde_json::json!(val)
            } else if let Ok(val) = $row.try_get::<f64, _>($idx) {
                serde_json::json!(val)
            } else if let Ok(val) = $row.try_get::<f32, _>($idx) {
                serde_json::json!(val)
            } else if let Ok(val) = $row.try_get::<bool, _>($idx) {
                serde_json::json!(val)
            } else if let Ok(val) = $row.try_get::<chrono::NaiveDateTime, _>($idx) {
                serde_json::Value::String(val.to_string())
            } else if let Ok(val) = $row.try_get::<chrono::DateTime<chrono::Utc>, _>($idx) {
                serde_json::Value::String(val.to_rfc3339())
            } else if let Ok(val) = $row.try_get::<chrono::NaiveDate, _>($idx) {
                serde_json::Value::String(val.to_string())
            } else if let Ok(val) = $row.try_get::<chrono::NaiveTime, _>($idx) {
                serde_json::Value::String(val.to_string())
            } else if let Ok(val) = $row.try_get::<uuid::Uuid, _>($idx) {
                serde_json::Value::String(val.to_string())
            } else if let Ok(val) = $row.try_get::<serde_json::Value, _>($idx) {
                val
            } else if let Ok(val) = $row.try_get::<Vec<u8>, _>($idx) {
                match String::from_utf8(val) {
                    Ok(s) => serde_json::Value::String(s),
                    Err(e) => {
                        let hex_str: String = e
                            .into_bytes()
                            .iter()
                            .map(|b| format!("{:02X}", b))
                            .collect();
                        serde_json::Value::String(format!("0x{}", hex_str))
                    }
                }
            } else {
                serde_json::Value::Null
            }
        }
    }};
}

#[macro_export]
macro_rules! decode_pg_cell_to_json {
    ($row:expr, $idx:expr) => {{
        use sqlx::Row;
        use sqlx::ValueRef;
        let is_null = match $row.try_get_raw($idx) {
            Ok(ref val_ref) => val_ref.is_null(),
            Err(_) => false,
        };

        if is_null {
            serde_json::Value::Null
        } else {
            // Native JSONB first for Postgres
            if let Ok(val) = $row.try_get::<serde_json::Value, _>($idx) {
                val
            } else if let Ok(val) = $row.try_get::<String, _>($idx) {
                serde_json::Value::String(val)
            } else if let Ok(val) = $row.try_get::<i64, _>($idx) {
                serde_json::json!(val)
            } else if let Ok(val) = $row.try_get::<i32, _>($idx) {
                serde_json::json!(val)
            } else if let Ok(val) = $row.try_get::<i16, _>($idx) {
                serde_json::json!(val)
            } else if let Ok(val) = $row.try_get::<f64, _>($idx) {
                serde_json::json!(val)
            } else if let Ok(val) = $row.try_get::<f32, _>($idx) {
                serde_json::json!(val)
            } else if let Ok(val) = $row.try_get::<bool, _>($idx) {
                serde_json::json!(val)
            } else if let Ok(val) = $row.try_get::<chrono::NaiveDateTime, _>($idx) {
                serde_json::Value::String(val.to_string())
            } else if let Ok(val) = $row.try_get::<chrono::DateTime<chrono::Utc>, _>($idx) {
                serde_json::Value::String(val.to_rfc3339())
            } else if let Ok(val) = $row.try_get::<chrono::NaiveDate, _>($idx) {
                serde_json::Value::String(val.to_string())
            } else if let Ok(val) = $row.try_get::<chrono::NaiveTime, _>($idx) {
                serde_json::Value::String(val.to_string())
            } else if let Ok(val) = $row.try_get::<uuid::Uuid, _>($idx) {
                serde_json::Value::String(val.to_string())
            } else if let Ok(val) = $row.try_get::<Vec<u8>, _>($idx) {
                match String::from_utf8(val) {
                    Ok(s) => serde_json::Value::String(s),
                    Err(e) => {
                        let hex_str: String = e
                            .into_bytes()
                            .iter()
                            .map(|b| format!("{:02X}", b))
                            .collect();
                        serde_json::Value::String(format!("0x{}", hex_str))
                    }
                }
            } else {
                serde_json::Value::Null
            }
        }
    }};
}

/// Creates an empty QueryResult with default zero counts.
pub fn empty_query_result(execution_time_ms: u64, rows_affected: u64) -> QueryResult {
    QueryResult {
        columns: Vec::new(),
        rows: Vec::new(),
        rows_affected,
        execution_time_ms,
        truncated: false,
        has_more: false,
    }
}

/// Finalizes a QueryResult with execution time and accurate rows_affected calculation.
pub fn finalize_query_result(
    last_result: Option<QueryResult>,
    statements_count: usize,
    total_affected: u64,
    execution_time_ms: u64,
) -> QueryResult {
    if let Some(mut res) = last_result {
        res.execution_time_ms = execution_time_ms;
        if statements_count > 1 && res.rows_affected == 0 {
            res.rows_affected = total_affected;
        }
        res
    } else {
        empty_query_result(execution_time_ms, total_affected)
    }
}

/// Helper to convert sqlx column metadata
pub fn extract_columns_metadata<C: sqlx::Column>(columns: &[C]) -> Vec<ColumnMetadata> {
    use sqlx::TypeInfo;
    columns
        .iter()
        .map(|col| ColumnMetadata {
            name: col.name().to_string(),
            data_type: col.type_info().name().to_string(),
            nullable: true,
        })
        .collect()
}
