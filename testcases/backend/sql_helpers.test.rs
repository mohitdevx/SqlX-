#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::ColumnMetadata;

    fn sample_columns() -> Vec<ColumnMetadata> {
        vec![
            ColumnMetadata { name: "id".into(), data_type: "int".into(), nullable: false },
            ColumnMetadata { name: "name".into(), data_type: "varchar".into(), nullable: true },
        ]
    }

    #[test]
    fn test_build_strict_row_where_clause_primary_key() {
        let cols = sample_columns();
        let row = vec!["1".into(), "Alice".into()];
        let where_clause = build_strict_row_where_clause(&cols, &row, Some("id"), "mysql");
        assert_eq!(where_clause, "`id` = '1'");
    }

    #[test]
    fn test_generate_update_cell_sql() {
        let cols = sample_columns();
        let row = vec!["2".into(), "Bob".into()];
        let sql = generateUpdateCellSql(
            "users",
            "name",
            "Robert",
            &cols,
            &row,
            Some("id"),
            "mysql",
        );
        assert_eq!(sql, "UPDATE `users`\nSET `name` = 'Robert'\nWHERE `id` = '2' LIMIT 1;");
    }

    #[test]
    fn test_generate_delete_row_sql() {
        let cols = sample_columns();
        let row = vec!["3".into(), "Charlie".into()];
        let sql = generateDeleteRowSql("users", &cols, &row, Some("id"), "postgres");
        assert_eq!(sql, "DELETE FROM \"users\"\nWHERE \"id\" = '3';");
    }
}
