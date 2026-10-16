import type { ColumnMetadata } from '@/types/database';

export function detectTableFromSql(sql?: string): string | null {
  if (!sql) return null;
  // Match FROM [schema.]table or UPDATE [schema.]table or DELETE FROM [schema.]table
  const match = sql.match(/\b(?:from|update|into)\s+[`"']?([a-zA-Z0-9_]+)[`"']?/i);
  return match ? match[1] : null;
}

export function quoteIdent(name: string, driver?: string): string {
  if (driver === 'mysql') return `\`${name}\``;
  return `"${name}"`;
}

export function formatSqlValue(val: unknown): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  const str = String(val).replace(/'/g, "''");
  return `'${str}'`;
}

/**
 * Builds a strict WHERE clause targeting ONLY the specific row.
 * Guarantees that whole-table statements (like WHERE 1 = 1) are NEVER generated.
 */
export function buildStrictRowWhereClause(
  columns: ColumnMetadata[],
  row: (string | number | boolean | null | object)[],
  primaryKeyCol?: string,
  driver?: string
): string {
  if (primaryKeyCol) {
    const pkIdx = columns.findIndex((c) => c.name === primaryKeyCol);
    if (pkIdx >= 0 && row[pkIdx] !== null && row[pkIdx] !== undefined) {
      return `${quoteIdent(primaryKeyCol, driver)} = ${formatSqlValue(row[pkIdx])}`;
    }
  }

  const idIdx = columns.findIndex((c) => c.name.toLowerCase() === 'id');
  if (idIdx >= 0 && row[idIdx] !== null && row[idIdx] !== undefined) {
    return `${quoteIdent(columns[idIdx].name, driver)} = ${formatSqlValue(row[idIdx])}`;
  }

  const whereParts: string[] = [];
  columns.forEach((col, idx) => {
    const val = row[idx];
    if (val !== null && val !== undefined) {
      whereParts.push(`${quoteIdent(col.name, driver)} = ${formatSqlValue(val)}`);
    } else {
      whereParts.push(`${quoteIdent(col.name, driver)} IS NULL`);
    }
  });

  if (whereParts.length === 0) {
    // If every column is somehow empty, match by all columns IS NULL
    return columns.map((c) => `${quoteIdent(c.name, driver)} IS NULL`).join(' AND ');
  }

  return whereParts.join(' AND ');
}

/**
 * Updates a SINGLE specific cell/column value in that specific row.
 */
export function generateUpdateCellSql(
  tableName: string,
  colName: string,
  newValue: unknown,
  columns: ColumnMetadata[],
  row: (string | number | boolean | null | object)[],
  primaryKeyCol?: string,
  driver?: string
): string {
  const table = quoteIdent(tableName, driver);
  const col = quoteIdent(colName, driver);
  const where = buildStrictRowWhereClause(columns, row, primaryKeyCol, driver);
  const limitClause = driver === 'postgres' ? '' : ' LIMIT 1';
  return `UPDATE ${table}\nSET ${col} = ${formatSqlValue(newValue)}\nWHERE ${where}${limitClause};`;
}

/**
 * Clears/Deletes a SINGLE specific cell/column value in that specific row (sets to NULL).
 */
export function generateClearCellSql(
  tableName: string,
  colName: string,
  columns: ColumnMetadata[],
  row: (string | number | boolean | null | object)[],
  primaryKeyCol?: string,
  driver?: string
): string {
  const table = quoteIdent(tableName, driver);
  const col = quoteIdent(colName, driver);
  const where = buildStrictRowWhereClause(columns, row, primaryKeyCol, driver);
  const limitClause = driver === 'postgres' ? '' : ' LIMIT 1';
  return `UPDATE ${table}\nSET ${col} = NULL\nWHERE ${where}${limitClause};`;
}

/**
 * Updates columns for ONLY that specific row.
 */
export function generateUpdateRowSql(
  tableName: string,
  columns: ColumnMetadata[],
  originalRow: (string | number | boolean | null | object)[],
  updatedValues: Record<string, string>,
  primaryKeyCol?: string,
  driver?: string
): string {
  const table = quoteIdent(tableName, driver);
  const setClauses: string[] = [];

  columns.forEach((col, idx) => {
    const newVal = updatedValues[col.name];
    const origVal = originalRow[idx];
    if (newVal !== undefined && newVal !== String(origVal ?? '')) {
      const qCol = quoteIdent(col.name, driver);
      setClauses.push(`${qCol} = ${formatSqlValue(newVal)}`);
    }
  });

  if (setClauses.length === 0 && columns.length > 0) {
    const firstCol = columns[0];
    setClauses.push(
      `${quoteIdent(firstCol.name, driver)} = ${formatSqlValue(
        updatedValues[firstCol.name] ?? originalRow[0]
      )}`
    );
  }

  const where = buildStrictRowWhereClause(columns, originalRow, primaryKeyCol, driver);
  const limitClause = driver === 'postgres' ? '' : ' LIMIT 1';

  return `UPDATE ${table}\nSET ${setClauses.join(',\n    ')}\nWHERE ${where}${limitClause};`;
}

/**
 * Deletes ONLY that specific row.
 */
export function generateDeleteRowSql(
  tableName: string,
  columns: ColumnMetadata[],
  row: (string | number | boolean | null | object)[],
  primaryKeyCol?: string,
  driver?: string
): string {
  const table = quoteIdent(tableName, driver);
  const where = buildStrictRowWhereClause(columns, row, primaryKeyCol, driver);
  const limitClause = driver === 'postgres' ? '' : ' LIMIT 1';

  return `DELETE FROM ${table}\nWHERE ${where}${limitClause};`;
}
