export type DatabaseDriver = 'postgres' | 'mysql' | 'sqlite';

export interface ConnectionConfig {
  id: string;
  name: string;
  driver: DatabaseDriver;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  filePath?: string;
  ssl?: boolean;
  environment?: 'production' | 'staging' | 'development';
}

export interface ColumnMetadata {
  name: string;
  dataType: string;
  nullable: boolean;
}

export interface QueryResult {
  columns: ColumnMetadata[];
  rows: (string | number | boolean | null | object)[][];
  rowsAffected: number;
  executionTimeMs: number;
}

export interface TableSchema {
  name: string;
  schemaName?: string;
  tableType: string;
  rowCountEstimate?: number;
}

export interface ColumnSchema {
  name: string;
  dataType: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
  defaultValue?: string;
}

export interface DatabaseTree {
  databases: string[];
  tables: TableSchema[];
}
