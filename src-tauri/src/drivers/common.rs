use crate::models::{ColumnMetadata, QueryResult};

/// Helper macro to extract a column value from an `sqlx::Row` as a `serde_json::Value`.
/// Attempts extraction as String, then i64, then f64, then bool, falling back to Null.
#[macro_export]
macro_rules! decode_cell_to_json {
    ($row:expr, $idx:expr) => {{
        let text_val: Result<String, _> = $row.try_get($idx);
        match text_val {
            Ok(t) => serde_json::Value::String(t),
            Err(_) => {
                let int_val: Result<i64, _> = $row.try_get($idx);
                match int_val {
                    Ok(i) => serde_json::json!(i),
                    Err(_) => {
                        let float_val: Result<f64, _> = $row.try_get($idx);
                        match float_val {
                            Ok(f) => serde_json::json!(f),
                            Err(_) => {
                                let bool_val: Result<bool, _> = $row.try_get($idx);
                                match bool_val {
                                    Ok(b) => serde_json::json!(b),
                                    Err(_) => serde_json::Value::Null,
                                }
                            }
                        }
                    }
                }
            }
        }
    }};
}

/// Helper macro to extract a PostgreSQL column value, with native JSONB support first.
#[macro_export]
macro_rules! decode_pg_cell_to_json {
    ($row:expr, $idx:expr) => {{
        let val: Result<serde_json::Value, _> = $row.try_get($idx);
        match val {
            Ok(v) => v,
            Err(_) => $crate::decode_cell_to_json!($row, $idx),
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
