import { invoke } from '@tauri-apps/api/core';
import type { ConnectionConfig, DatabaseTree, ColumnSchema, QueryResult } from '@/types/database';

export async function testConnection(config: ConnectionConfig): Promise<boolean> {
  return await invoke<boolean>('test_connection', { config });
}

export async function connectDatabase(config: ConnectionConfig): Promise<string> {
  return await invoke<string>('connect_database', { config });
}

export async function disconnectDatabase(connectionId: string): Promise<void> {
  return await invoke<void>('disconnect_database', { connectionId });
}

export async function executeQuery(
  connectionId: string,
  sql: string,
  limit?: number,
  offset?: number
): Promise<QueryResult> {
  return await invoke<QueryResult>('execute_query', {
    request: {
      connectionId,
      sql,
      limit,
      offset,
    },
  });
}

export async function getSchemaTree(connectionId: string): Promise<DatabaseTree> {
  return await invoke<DatabaseTree>('get_schema_tree', { connectionId });
}

export async function getTableColumns(
  connectionId: string,
  tableName: string
): Promise<ColumnSchema[]> {
  return await invoke<ColumnSchema[]>('get_table_columns', {
    connectionId,
    tableName,
  });
}
