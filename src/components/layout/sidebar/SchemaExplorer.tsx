import type { ColumnSchema, ConnectionConfig, DatabaseTree } from '@/types/database';
import {
  ChevronDown,
  ChevronRight,
  Database,
  Play,
  RefreshCw,
  Table as TableIcon,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

export interface SchemaExplorerProps {
  activeConn?: ConnectionConfig;
  activeConnectionId: string | null;
  schemaTree: DatabaseTree | null;
  tableColumns?: Record<string, ColumnSchema[]>;
  selectedTable?: string | null;
  isConnecting: boolean;
  onRefreshSchema: () => void;
  onFetchTableColumns?: (tableName: string) => Promise<ColumnSchema[]>;
  onSelectTable?: (tableName: string) => void;
  onQuickSelectRows: (tableName: string) => void;
  onQuickCountRows?: (tableName: string) => void;
  onInsertColumn?: (tableName: string, columnName: string) => void;
  onSwitchDatabase?: (databaseName: string) => Promise<boolean>;
}

export const SchemaExplorer: React.FC<SchemaExplorerProps> = ({
  activeConn,
  activeConnectionId,
  schemaTree,
  selectedTable,
  isConnecting,
  onRefreshSchema,
  onSelectTable,
  onQuickSelectRows,
  onSwitchDatabase,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedDbs, setExpandedDbs] = useState<Record<string, boolean>>({});
  const [isSwitchingDb, setIsSwitchingDb] = useState<string | null>(null);
  const [tableFilter, setTableFilter] = useState('');

  const toggleDbExpansion = (dbName: string) => {
    setExpandedDbs((prev) => {
      const current = prev[dbName] !== undefined ? prev[dbName] : true;
      return { ...prev, [dbName]: !current };
    });
  };

  const handleSwitchDatabase = async (dbName: string) => {
    if (!onSwitchDatabase || isSwitchingDb) return;
    setIsSwitchingDb(dbName);
    try {
      await onSwitchDatabase(dbName);
    } finally {
      setIsSwitchingDb(null);
    }
  };

  const databasesList =
    schemaTree?.databases && schemaTree.databases.length > 0
      ? schemaTree.databases
      : activeConn?.database
        ? [activeConn.database]
        : ['default'];

  const currentDatabaseName = activeConn?.database || (databasesList[0] ?? 'default');

  const allTables = schemaTree?.tables || [];
  const filteredTables = tableFilter.trim()
    ? allTables.filter((t) => t.name.toLowerCase().includes(tableFilter.toLowerCase()))
    : allTables;

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
          <span>Database Explorer</span>
        </button>

        {activeConn && (
          <button
            type="button"
            onClick={onRefreshSchema}
            disabled={isConnecting || Boolean(isSwitchingDb)}
            className="p-1 hover:text-tx-primary rounded hover:bg-bg-overlay transition-colors disabled:opacity-40 cursor-pointer"
            title="Refresh Schema Objects"
          >
            <RefreshCw
              className={`w-3 h-3 ${isConnecting || isSwitchingDb ? 'animate-spin' : ''}`}
            />
          </button>
        )}
      </div>

      {/* Database Tree Content */}
      {isExpanded && (
        <div className="flex-1 flex flex-col overflow-hidden px-2 pb-2">
          {!activeConnectionId ? (
            <div className="p-4 text-center text-tx-muted space-y-1.5 my-1">
              <Database className="w-6 h-6 mx-auto opacity-30" />
              <p className="text-xs font-medium text-tx-secondary">No Database Connected</p>
              <p className="text-[10px] text-tx-muted">
                Select or configure a database connection above.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-0.5">
              {/* Optional filter input if tables exist */}
              {allTables.length > 4 && (
                <div className="px-1 pb-1">
                  <input
                    type="text"
                    value={tableFilter}
                    onChange={(e) => setTableFilter(e.target.value)}
                    placeholder="Filter tables..."
                    className="w-full bg-bg-base border border-border-subtle focus:border-accent-primary rounded px-2 py-1 text-[11px] text-tx-primary placeholder:text-tx-muted/50 focus:outline-none font-mono transition-colors"
                  />
                </div>
              )}

              {/* Database Hierarchy Tree */}
              <div className="space-y-1">
                {databasesList.map((dbName) => {
                  const isCurrentDb = dbName.toLowerCase() === currentDatabaseName.toLowerCase();
                  const isDbExpanded =
                    expandedDbs[dbName] !== undefined ? expandedDbs[dbName] : isCurrentDb;
                  const isSwitchingThis = isSwitchingDb === dbName;

                  return (
                    <div key={dbName} className="space-y-0.5">
                      {/* Level 1: Database Node */}
                      <div
                        onClick={() => {
                          if (isCurrentDb) {
                            toggleDbExpansion(dbName);
                          } else if (!isSwitchingDb) {
                            handleSwitchDatabase(dbName);
                          }
                        }}
                        className={`group px-2 py-1.5 rounded-md flex items-center justify-between text-xs font-mono transition-colors cursor-pointer ${
                          isCurrentDb
                            ? 'bg-bg-elevated/80 text-tx-primary font-medium'
                            : 'text-tx-secondary hover:text-tx-primary hover:bg-bg-overlay/60'
                        }`}
                        title={
                          isCurrentDb
                            ? `Active Database: ${dbName}`
                            : `Click to switch to database: ${dbName}`
                        }
                      >
                        <div className="flex items-center space-x-1.5 truncate flex-1 min-w-0">
                          <span className="text-tx-muted group-hover:text-tx-primary p-0.5">
                            {isCurrentDb ? (
                              isDbExpanded ? (
                                <ChevronDown className="w-3 h-3" />
                              ) : (
                                <ChevronRight className="w-3 h-3" />
                              )
                            ) : (
                              <ChevronRight className="w-3 h-3 opacity-60" />
                            )}
                          </span>
                          <Database
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isCurrentDb
                                ? 'text-accent-primary'
                                : 'text-tx-muted group-hover:text-tx-secondary'
                            }`}
                          />
                          <span className="truncate text-xs font-semibold">{dbName}</span>
                        </div>

                        <div className="shrink-0 ml-1 flex items-center space-x-1">
                          {isSwitchingThis ? (
                            <RefreshCw className="w-2.5 h-2.5 animate-spin text-accent-primary" />
                          ) : isCurrentDb ? (
                            <span className="text-[9px] font-mono text-tx-muted px-1.5 py-0.2 rounded bg-bg-base border border-border-subtle">
                              {allTables.length} tables
                            </span>
                          ) : (
                            <span className="text-[9px] text-tx-muted opacity-0 group-hover:opacity-100 font-sans transition-opacity">
                              switch
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Level 2: Tables under Active Database (with vertical guideline |) */}
                      {isCurrentDb && isDbExpanded && (
                        <div className="ml-3 pl-2.5 border-l border-white/10 space-y-0.5 py-0.5">
                          {filteredTables.length === 0 ? (
                            <div className="py-2.5 text-center text-tx-muted text-[11px] italic">
                              {schemaTree
                                ? tableFilter
                                  ? 'No matching tables'
                                  : 'No tables found in this database'
                                : 'Loading tables...'}
                            </div>
                          ) : (
                            filteredTables.map((table) => {
                              const isSelected = selectedTable === table.name;

                              return (
                                <div
                                  key={table.name}
                                  onClick={() => onSelectTable?.(table.name)}
                                  className={`px-2 py-1.5 rounded-md flex items-center justify-between text-xs font-mono cursor-pointer transition-colors group ${
                                    isSelected
                                      ? 'bg-accent-primary/15 text-accent-primary font-medium'
                                      : 'text-tx-secondary hover:text-tx-primary hover:bg-bg-overlay/60'
                                  }`}
                                  title={`Table: ${table.name} (Click to inspect schema)`}
                                >
                                  <div className="flex items-center space-x-2 truncate flex-1 min-w-0">
                                    <TableIcon
                                      className={`w-3.5 h-3.5 shrink-0 ${
                                        isSelected
                                          ? 'text-accent-primary'
                                          : 'text-accent-primary/80 group-hover:text-accent-primary'
                                      }`}
                                    />
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
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
