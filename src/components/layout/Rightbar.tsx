import { useConnectionStore } from '@/stores/connectionStore';
import { useQueryStore } from '@/stores/queryStore';
import type { ColumnSchema } from '@/types/database';
import {
  Calendar,
  Check,
  Copy,
  Database,
  Hash,
  KeyRound,
  RefreshCw,
  Search,
  Table as TableIcon,
  Type,
  X,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface RightbarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQueryTab?: (sql: string, title?: string) => void;
}

export const Rightbar: React.FC<RightbarProps> = ({ isOpen, onClose, onOpenQueryTab }) => {
  const {
    schemaTree,
    tableColumns,
    fetchTableColumns,
    selectedTable,
    setSelectedTable,
    activeConnectionId,
    connections,
  } = useConnectionStore();

  const { tabs, activeTabId, updateSql, createTab } = useQueryStore();

  // Search & Filter state
  const [filterQuery, setFilterQuery] = useState('');
  const [copiedColumn, setCopiedColumn] = useState<string | null>(null);
  const [isLoadingCols, setIsLoadingCols] = useState(false);

  // Drag-to-resize state (min 280px, max 600px)
  const [rightbarWidth, setRightbarWidth] = useState(360);
  const isDraggingRef = useRef(false);

  // Active Connection Config
  const activeConn = useMemo(
    () => connections.find((c) => c.id === activeConnectionId),
    [connections, activeConnectionId]
  );

  // All available tables in schema
  const allTables = useMemo(() => {
    return schemaTree?.tables || [];
  }, [schemaTree]);

  // Active table metadata
  const currentTable = useMemo(() => {
    if (selectedTable) {
      const found = allTables.find((t) => t.name === selectedTable);
      if (found) return found;
    }
    return allTables[0] || null;
  }, [allTables, selectedTable]);

  // Load columns when current table changes
  useEffect(() => {
    if (currentTable?.name) {
      if (!tableColumns[currentTable.name]) {
        setIsLoadingCols(true);
        fetchTableColumns(currentTable.name).finally(() => {
          setIsLoadingCols(false);
        });
      }
    }
  }, [currentTable?.name, tableColumns, fetchTableColumns]);

  // Drag-to-resize mouse handlers (resize from left edge)
  const handleMouseDownResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const newWidth = Math.min(Math.max(window.innerWidth - e.clientX, 280), 600);
      setRightbarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Columns for current active table
  const columns: ColumnSchema[] = useMemo(() => {
    if (!currentTable) return [];
    return tableColumns[currentTable.name] || [];
  }, [currentTable, tableColumns]);

  // Filtered columns based on search
  const filteredColumns = useMemo(() => {
    if (!filterQuery.trim()) return columns;
    const q = filterQuery.toLowerCase();
    return columns.filter(
      (col) => col.name.toLowerCase().includes(q) || col.dataType.toLowerCase().includes(q)
    );
  }, [columns, filterQuery]);

  // Copy column name to clipboard
  const handleCopyColumn = (colName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(colName);
    setCopiedColumn(colName);
    setTimeout(() => {
      setCopiedColumn(null);
    }, 1500);
  };

  // Insert column into query editor
  const handleInsertColumnQuery = (colName: string) => {
    if (!currentTable) return;
    const activeTabObj = tabs.find((t) => t.id === activeTabId);
    if (activeTabObj) {
      const append = `SELECT ${colName} FROM ${currentTable.name} LIMIT 50;\n`;
      updateSql(activeTabObj.id, activeTabObj.sql ? `${activeTabObj.sql}\n${append}` : append);
    } else if (onOpenQueryTab) {
      onOpenQueryTab(`SELECT ${colName} FROM ${currentTable.name} LIMIT 50;\n`, currentTable.name);
    } else {
      createTab(`SELECT ${colName} FROM ${currentTable.name} LIMIT 50;\n`, currentTable.name);
    }
  };

  // Semantic column type icon
  const getDataTypeIcon = (type: string, isPrimaryKey: boolean) => {
    if (isPrimaryKey) {
      return <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    }
    const t = type.toLowerCase();
    if (
      t.includes('int') ||
      t.includes('serial') ||
      t.includes('numeric') ||
      t.includes('float') ||
      t.includes('decimal')
    ) {
      return <Hash className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
    }
    if (t.includes('date') || t.includes('time')) {
      return <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
    }
    return <Type className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
  };

  if (!isOpen) {
    return null;
  }

  const pkCount = columns.filter((c) => c.isPrimaryKey).length;

  return (
    <aside
      style={{ width: `${rightbarWidth}px` }}
      className="relative bg-bg-surface border-l border-border-subtle flex flex-col justify-between select-none z-20 shrink-0 h-full font-sans transition-[width] duration-75"
    >
      {/* Drag handle to resize width from left */}
      <div
        onMouseDown={handleMouseDownResize}
        className="absolute top-0 left-0 w-1 h-full cursor-col-resize hover:bg-accent-primary transition-colors z-30"
        title="Drag to resize inspector width"
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Header */}
        <div className="h-12 px-3 border-b border-border-subtle flex items-center justify-between shrink-0 bg-bg-elevated/40">
          <div className="flex items-center space-x-2 min-w-0">
            <TableIcon className="w-4 h-4 text-accent-primary shrink-0" />
            <div className="truncate min-w-0 flex items-baseline gap-1">
              {activeConn?.database && (
                <span className="text-[10px] font-mono text-tx-muted truncate max-w-[90px]">
                  {activeConn.database} /
                </span>
              )}
              <h3 className="text-xs font-semibold text-tx-primary truncate font-mono">
                {currentTable ? currentTable.name : 'Table Schema'}
              </h3>
            </div>
            {currentTable && columns.length > 0 && (
              <span className="text-[10px] font-mono text-tx-muted px-1.5 py-0.2 rounded bg-bg-base border border-border-subtle shrink-0">
                {columns.length} cols
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-tx-muted hover:text-tx-primary rounded hover:bg-bg-overlay transition-colors cursor-pointer"
            title="Close Inspector (Ctrl+I)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Table Switcher Dropdown (if more than 1 table exists) */}
        {allTables.length > 1 && (
          <div className="px-3 py-2 border-b border-border-subtle bg-bg-base/30">
            <select
              value={currentTable?.name || ''}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="w-full px-2 py-1 rounded bg-bg-surface border border-border-subtle text-xs text-tx-primary focus:outline-none focus:border-accent-primary font-mono cursor-pointer transition-colors"
            >
              {allTables.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name}
                  {t.rowCountEstimate !== undefined && t.rowCountEstimate !== null
                    ? ` (~${t.rowCountEstimate} rows)`
                    : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sleek Searchbar */}
        <div className="px-3 py-2 border-b border-border-subtle bg-bg-surface/50">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-tx-muted absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search columns or types..."
              className="w-full bg-bg-base border border-border-subtle focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/20 rounded-md pl-8 pr-7 py-1.5 text-xs text-tx-primary placeholder:text-tx-muted/50 font-mono transition-all outline-none"
            />
            {filterQuery && (
              <button
                type="button"
                onClick={() => setFilterQuery('')}
                className="absolute right-2 p-0.5 text-tx-muted hover:text-tx-primary rounded hover:bg-bg-overlay transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Schema Content: Container Grid Like Table */}
        <div className="p-3 flex-1 flex flex-col min-h-0 overflow-hidden">
          {!activeConnectionId ? (
            <div className="p-8 text-center text-tx-muted space-y-1.5 my-auto">
              <Database className="w-6 h-6 mx-auto opacity-30" />
              <p className="text-xs font-medium text-tx-secondary">No Connection Active</p>
              <p className="text-[10px] text-tx-muted">
                Connect to a database to inspect its schema.
              </p>
            </div>
          ) : !currentTable ? (
            <div className="p-8 text-center text-tx-muted space-y-1 my-auto">
              <TableIcon className="w-6 h-6 mx-auto opacity-30" />
              <p className="text-xs">No table selected</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 rounded-lg border border-border-subtle bg-bg-base/40 overflow-hidden shadow-sm">
              {/* Grid Table Header */}
              <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-bg-elevated/70 border-b border-border-subtle text-[10px] font-mono font-semibold uppercase tracking-wider text-tx-muted select-none shrink-0">
                <div className="col-span-5 flex items-center space-x-1">
                  <span>Column</span>
                </div>
                <div className="col-span-3">
                  <span>Type</span>
                </div>
                <div className="col-span-3">
                  <span>Key / Null</span>
                </div>
                <div className="col-span-1 text-right">
                  <span className="sr-only">Actions</span>
                </div>
              </div>

              {/* Grid Table Body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-border-subtle/30">
                {isLoadingCols ? (
                  <div className="p-8 text-center text-tx-muted space-y-2">
                    <RefreshCw className="w-5 h-5 mx-auto animate-spin text-accent-primary" />
                    <p className="text-xs">Loading columns for {currentTable.name}...</p>
                  </div>
                ) : filteredColumns.length === 0 ? (
                  <div className="p-8 text-center text-tx-muted space-y-1">
                    <p className="text-xs italic">
                      {filterQuery
                        ? `No columns matching "${filterQuery}"`
                        : 'No columns found for this table.'}
                    </p>
                  </div>
                ) : (
                  filteredColumns.map((col) => {
                    const isCopied = copiedColumn === col.name;

                    return (
                      <div
                        key={col.name}
                        onClick={() => handleInsertColumnQuery(col.name)}
                        className="grid grid-cols-12 gap-2 px-3 py-2 items-center text-xs font-mono hover:bg-bg-overlay/50 transition-colors group cursor-pointer"
                        title={`Click to insert "${col.name}" into query`}
                      >
                        {/* Column Name */}
                        <div className="col-span-5 flex items-center space-x-2 min-w-0">
                          {getDataTypeIcon(col.dataType, col.isPrimaryKey)}
                          <span
                            className={`font-mono text-xs truncate ${
                              col.isPrimaryKey
                                ? 'text-amber-400 font-semibold'
                                : 'text-tx-primary group-hover:text-accent-primary'
                            }`}
                          >
                            {col.name}
                          </span>
                        </div>

                        {/* Data Type (Clean unbordered text) */}
                        <div className="col-span-3 truncate min-w-0">
                          <span
                            className="text-tx-secondary text-[11px] font-mono truncate block"
                            title={col.dataType}
                          >
                            {col.dataType}
                          </span>
                        </div>

                        {/* Key / Nullability */}
                        <div className="col-span-3 flex items-center space-x-1 shrink-0">
                          {col.isPrimaryKey && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono text-[9px] font-bold shrink-0">
                              PK
                            </span>
                          )}
                          {!col.isNullable && !col.isPrimaryKey && (
                            <span className="px-1.5 py-0.2 rounded bg-bg-surface border border-border-subtle text-tx-muted font-mono text-[9px] shrink-0">
                              NOT NULL
                            </span>
                          )}
                          {col.isNullable && (
                            <span className="text-[9px] font-mono text-tx-muted/50 shrink-0">
                              NULL
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="col-span-1 flex items-center justify-end space-x-1">
                          <button
                            type="button"
                            onClick={(e) => handleCopyColumn(col.name, e)}
                            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-bg-elevated text-tx-muted hover:text-tx-primary transition-all cursor-pointer"
                            title="Copy column name"
                          >
                            {isCopied ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Grid Table Footer Summary */}
              {currentTable && columns.length > 0 && (
                <div className="px-3 py-2 border-t border-border-subtle bg-bg-elevated/40 flex items-center justify-between text-[11px] font-mono text-tx-muted shrink-0">
                  <div className="flex items-center space-x-2">
                    <span>{columns.length} columns</span>
                    {pkCount > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-amber-400 font-semibold">{pkCount} PK</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
export default Rightbar;
