import type { ColumnSchema, ConnectionConfig, DatabaseTree } from '@/types/database';
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Database,
  Hash,
  KeyRound,
  Play,
  RefreshCw,
  Table as TableIcon,
  Type,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

export interface SchemaExplorerProps {
  activeConn?: ConnectionConfig;
  activeConnectionId: string | null;
  schemaTree: DatabaseTree | null;
  tableColumns: Record<string, ColumnSchema[]>;
  isConnecting: boolean;
  onRefreshSchema: () => void;
  onFetchTableColumns: (tableName: string) => Promise<ColumnSchema[]>;
  onQuickSelectRows: (tableName: string) => void;
  onQuickCountRows: (tableName: string) => void;
  onInsertColumn: (tableName: string, columnName: string) => void;
}

export const SchemaExplorer: React.FC<SchemaExplorerProps> = ({
  activeConn,
  activeConnectionId,
  schemaTree,
  tableColumns,
  isConnecting,
  onRefreshSchema,
  onFetchTableColumns,
  onQuickSelectRows,
  onQuickCountRows,
  onInsertColumn,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});
  const [loadingColumnsFor, setLoadingColumnsFor] = useState<Record<string, boolean>>({});

  const toggleTableExpansion = async (tableName: string) => {
    const nextState = !expandedTables[tableName];
    setExpandedTables((prev) => ({
      ...prev,
      [tableName]: nextState,
    }));

    if (nextState && !tableColumns[tableName]) {
      setLoadingColumnsFor((prev) => ({ ...prev, [tableName]: true }));
      try {
        await onFetchTableColumns(tableName);
      } finally {
        setLoadingColumnsFor((prev) => ({ ...prev, [tableName]: false }));
      }
    }
  };

  const getColumnIcon = (dataType: string, isPrimaryKey: boolean) => {
    if (isPrimaryKey) {
      return <KeyRound className="w-2.5 h-2.5 text-amber-400 shrink-0" />;
    }
    const dt = dataType.toLowerCase();
    if (
      dt.includes('int') ||
      dt.includes('numeric') ||
      dt.includes('float') ||
      dt.includes('decimal')
    ) {
      return <Hash className="w-2.5 h-2.5 text-blue-400/80 shrink-0" />;
    }
    if (dt.includes('date') || dt.includes('time')) {
      return <Calendar className="w-2.5 h-2.5 text-purple-400/80 shrink-0" />;
    }
    return <Type className="w-2.5 h-2.5 text-tx-muted/60 shrink-0" />;
  };

  const tablesList = schemaTree?.tables || [];

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      {/* Section Header */}
      <div className="px-3 py-2 flex items-center justify-between text-tx-muted shrink-0">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-1.5 text-[10px] uppercase font-bold tracking-wider hover:text-tx-primary transition-colors cursor-pointer"
        >
          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          <span>Database</span>
        </button>

        {activeConn && (
          <button
            type="button"
            onClick={onRefreshSchema}
            disabled={isConnecting}
            className="p-1 hover:text-tx-primary rounded hover:bg-bg-overlay transition-colors disabled:opacity-40 cursor-pointer"
            title="Refresh Schema Objects"
          >
            <RefreshCw className={`w-3 h-3 ${isConnecting ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* Database Tree Content */}
      {isExpanded && (
        <div className="flex-1 flex flex-col overflow-hidden px-2 pb-2">
          {!activeConnectionId ? (
            <div className="p-4 text-center text-tx-muted space-y-1.5 my-1">
              <Database className="w-6 h-6 mx-auto opacity-30" />
              <p className="text-xs font-medium text-tx-secondary">No Database Selected</p>
              <p className="text-[10px] text-tx-muted">
                Connect a database above to view tables, rows, and columns.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-0.5">
              {/* Database Node with Icon */}
              <div className="flex items-center space-x-2 px-2 py-1.5 rounded-md bg-bg-elevated/60 text-tx-primary font-medium text-xs">
                <Database className="w-3.5 h-3.5 text-accent-primary shrink-0" />
                <span className="truncate flex-1 font-mono">
                  {activeConn?.database || activeConn?.name || 'database'}
                </span>
                <span className="text-[9px] font-mono text-tx-muted px-1.5 py-0.2 rounded bg-bg-base">
                  {tablesList.length} tables
                </span>
              </div>

              {/* Nested Tables Tree */}
              <div className="ml-3.5 pl-2 border-l border-white/10 space-y-0.5 mt-0.5">
                {tablesList.length === 0 ? (
                  <div className="py-3 text-center text-tx-muted text-[11px] italic">
                    {schemaTree ? 'No tables found' : 'Loading schema objects...'}
                  </div>
                ) : (
                  tablesList.map((table) => {
                    const isTableExpanded = Boolean(expandedTables[table.name]);
                    const cols = tableColumns[table.name] || [];
                    const isLoadingCols = Boolean(loadingColumnsFor[table.name]);

                    return (
                      <div key={table.name} className="relative space-y-0.5">
                        {/* Table Item Row */}
                        <div
                          onClick={() => toggleTableExpansion(table.name)}
                          className="px-1.5 py-1 rounded-md hover:bg-bg-overlay/60 text-tx-secondary hover:text-tx-primary flex items-center justify-between text-xs font-mono cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center space-x-1.5 truncate flex-1 min-w-0">
                            <span className="text-tx-muted group-hover:text-tx-primary p-0.5">
                              {isTableExpanded ? (
                                <ChevronDown className="w-3 h-3" />
                              ) : (
                                <ChevronRight className="w-3 h-3" />
                              )}
                            </span>
                            <TableIcon className="w-3.5 h-3.5 text-accent-primary/80 group-hover:text-accent-primary shrink-0" />
                            <span className="truncate text-[11px]">{table.name}</span>
                          </div>

                          <div className="flex items-center space-x-1 shrink-0 ml-1">
                            {table.rowCountEstimate !== undefined &&
                              table.rowCountEstimate !== null && (
                                <span className="text-[9px] text-tx-muted font-mono opacity-60 group-hover:opacity-100">
                                  ~{table.rowCountEstimate}
                                </span>
                              )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onQuickSelectRows(table.name);
                              }}
                              className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-accent-primary hover:text-accent-text text-tx-muted transition-all cursor-pointer"
                              title="View Rows (SELECT * LIMIT 100)"
                            >
                              <Play className="w-2.5 h-2.5 fill-current" />
                            </button>
                          </div>
                        </div>

                        {/* Expanded Table Columns & Rows */}
                        {isTableExpanded && (
                          <div className="ml-3 pl-2.5 border-l border-white/10 py-0.5 space-y-0.5 font-mono text-[10px]">
                            {/* Quick actions row */}
                            <div className="flex items-center space-x-1.5 pb-1 pt-0.5 px-1">
                              <button
                                type="button"
                                onClick={() => onQuickSelectRows(table.name)}
                                className="px-1.5 py-0.5 rounded bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary text-[9px] font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
                              >
                                <Play className="w-2 h-2 fill-current" />
                                <span>Rows</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => onQuickCountRows(table.name)}
                                className="px-1.5 py-0.5 rounded bg-bg-base hover:bg-bg-elevated text-tx-muted hover:text-tx-primary border border-border-subtle text-[9px] transition-colors cursor-pointer"
                              >
                                Count
                              </button>
                            </div>

                            {/* Columns List */}
                            {isLoadingCols ? (
                              <div className="text-[10px] text-tx-muted py-0.5 italic flex items-center space-x-1 px-1">
                                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                <span>Loading columns...</span>
                              </div>
                            ) : cols.length === 0 ? (
                              <div className="text-[10px] text-tx-muted py-0.5 italic px-1">
                                No columns found
                              </div>
                            ) : (
                              <div className="space-y-0.5">
                                {cols.map((col) => (
                                  <div
                                    key={col.name}
                                    onClick={() => onInsertColumn(table.name, col.name)}
                                    className="flex items-center justify-between text-tx-muted hover:text-tx-primary py-0.5 px-1 rounded hover:bg-bg-overlay/50 cursor-pointer group/col transition-colors"
                                    title={`Click to query ${col.name} (${col.dataType})`}
                                  >
                                    <div className="flex items-center space-x-1.5 truncate">
                                      {getColumnIcon(col.dataType, col.isPrimaryKey)}
                                      <span className="truncate group-hover/col:text-accent-primary">
                                        {col.name}
                                      </span>
                                    </div>

                                    <div className="flex items-center space-x-1 shrink-0 ml-1">
                                      <span className="text-[9px] text-tx-muted/60">
                                        {col.dataType}
                                      </span>
                                      {col.isPrimaryKey && (
                                        <span className="text-[8px] font-bold text-amber-400 px-0.5 rounded bg-amber-400/10">
                                          PK
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
