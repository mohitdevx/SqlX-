import { useConnectionStore } from '@/stores/connectionStore';
import { useQueryStore } from '@/stores/queryStore';
import {
  Bookmark,
  Boxes,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Database,
  Hash,
  Home,
  KeyRound,
  Play,
  Plus,
  RefreshCw,
  Table as TableIcon,
  Terminal,
  Type,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type NavView =
  | 'query'
  | 'home'
  | 'connections'
  | 'history'
  | 'saved-queries'
  | 'extensions'
  | 'theme';

interface SidebarProps {
  activeView: NavView;
  setActiveView: (view: NavView) => void;
  onOpenNewConnectionModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  onOpenNewConnectionModal,
}) => {
  const {
    connections,
    activeConnectionId,
    connect,
    disconnect,
    schemaTree,
    refreshSchema,
    tableColumns,
    fetchTableColumns,
    isLoading: isConnecting,
  } = useConnectionStore();

  const {
    createTab,
    runActiveQuery,
    updateSql,
    tabs,
    history,
    savedQueries,
    activeTabId,
  } = useQueryStore();

  // Mouse-resizable sidebar width (min 180px, max 500px)
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const isDraggingRef = useRef(false);

  // Collapsible section states
  const [connectionsExpanded, setConnectionsExpanded] = useState(true);
  const [databaseExpanded, setDatabaseExpanded] = useState(true);
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});
  const [loadingColumnsFor, setLoadingColumnsFor] = useState<Record<string, boolean>>({});

  // Filter out any legacy dummy connections
  const realConnections = useMemo(() => {
    return connections.filter(
      (c) =>
        !c.id.startsWith('conn-local-') &&
        c.name !== 'Local PostgreSQL' &&
        c.name !== 'Local MySQL' &&
        c.name !== 'Local SQLite'
    );
  }, [connections]);

  const activeConn = useMemo(
    () => realConnections.find((c) => c.id === activeConnectionId),
    [realConnections, activeConnectionId]
  );

  // Auto-fetch schema if connected and schemaTree is null
  useEffect(() => {
    if (activeConnectionId && !schemaTree) {
      refreshSchema();
    }
  }, [activeConnectionId, schemaTree, refreshSchema]);

  // Sidebar drag-to-resize handlers
  const handleMouseDownResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const newWidth = Math.min(Math.max(e.clientX, 180), 500);
      setSidebarWidth(newWidth);
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

  const handleNewQueryClick = () => {
    createTab('', `Query ${tabs.length + 1}`);
    setActiveView('query');
  };

  const handleQuickSelectTableRows = (tableName: string) => {
    const sql = `SELECT * FROM ${tableName} LIMIT 100;`;
    createTab(sql, tableName);
    setActiveView('query');
    if (activeConnectionId) {
      setTimeout(() => {
        runActiveQuery(activeConnectionId, sql);
      }, 50);
    }
  };

  const handleQuickCountTableRows = (tableName: string) => {
    const sql = `SELECT COUNT(*) AS total_rows FROM ${tableName};`;
    createTab(sql, `Count ${tableName}`);
    setActiveView('query');
    if (activeConnectionId) {
      setTimeout(() => {
        runActiveQuery(activeConnectionId, sql);
      }, 50);
    }
  };

  const toggleTableExpansion = async (tableName: string) => {
    const nextState = !expandedTables[tableName];
    setExpandedTables((prev) => ({
      ...prev,
      [tableName]: nextState,
    }));

    if (nextState && !tableColumns[tableName]) {
      setLoadingColumnsFor((prev) => ({ ...prev, [tableName]: true }));
      try {
        await fetchTableColumns(tableName);
      } finally {
        setLoadingColumnsFor((prev) => ({ ...prev, [tableName]: false }));
      }
    }
  };

  const handleInsertColumn = (tableName: string, columnName: string) => {
    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (activeTab) {
      const append = `SELECT ${columnName} FROM ${tableName} LIMIT 50;\n`;
      updateSql(activeTab.id, activeTab.sql ? `${activeTab.sql}\n${append}` : append);
      setActiveView('query');
    } else {
      createTab(`SELECT ${columnName} FROM ${tableName} LIMIT 50;\n`, tableName);
      setActiveView('query');
    }
  };

  const getColumnIcon = (dataType: string, isPrimaryKey: boolean) => {
    if (isPrimaryKey) {
      return <KeyRound className="w-2.5 h-2.5 text-amber-400 shrink-0" />;
    }
    const dt = dataType.toLowerCase();
    if (dt.includes('int') || dt.includes('numeric') || dt.includes('float') || dt.includes('decimal')) {
      return <Hash className="w-2.5 h-2.5 text-blue-400/80 shrink-0" />;
    }
    if (dt.includes('date') || dt.includes('time')) {
      return <Calendar className="w-2.5 h-2.5 text-purple-400/80 shrink-0" />;
    }
    return <Type className="w-2.5 h-2.5 text-tx-muted/60 shrink-0" />;
  };

  const tablesList = schemaTree?.tables || [];

  return (
    <aside
      style={{ width: `${sidebarWidth}px` }}
      className="relative bg-bg-surface border-r border-border-subtle flex flex-col justify-between select-none z-20 shrink-0 h-full font-sans transition-[width] duration-75"
    >
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ============================================================
            SECTION 1: Action Button (New Query) & Navigation Options
           ============================================================ */}
        <div className="p-3 pb-2 border-b border-border-subtle shrink-0 space-y-2.5">
          {/* "+ New Query" CTA Button */}
          <button
            onClick={handleNewQueryClick}
            className="w-full py-2 px-3 rounded-lg bg-accent-primary hover:bg-accent-primary-hover active:scale-[0.98] text-accent-text text-xs font-semibold shadow-md shadow-accent-primary/20 transition-all flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center space-x-2">
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Query</span>
            </div>
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/20 text-accent-text/80">
              Ctrl+T
            </kbd>
          </button>

          {/* Navigation Options with Logos */}
          <div className="space-y-0.5">
            {/* Home */}
            <button
              onClick={() => setActiveView('home')}
              className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs font-medium transition-colors cursor-pointer ${
                activeView === 'home'
                  ? 'bg-accent-primary/15 text-accent-primary font-semibold'
                  : 'text-tx-secondary hover:text-tx-primary hover:bg-bg-overlay'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </div>
            </button>

            {/* SQL Editor Tab View */}
            <button
              onClick={() => setActiveView('query')}
              className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs font-medium transition-colors cursor-pointer ${
                activeView === 'query'
                  ? 'bg-accent-primary/15 text-accent-primary font-semibold'
                  : 'text-tx-secondary hover:text-tx-primary hover:bg-bg-overlay'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>SQL Editor</span>
              </div>
              <span className="px-1.5 py-0.2 rounded bg-bg-base text-tx-muted font-mono text-[10px]">
                {tabs.length}
              </span>
            </button>

            {/* Connections */}
            <button
              onClick={() => setActiveView('connections')}
              className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs font-medium transition-colors cursor-pointer ${
                activeView === 'connections'
                  ? 'bg-accent-primary/15 text-accent-primary font-semibold'
                  : 'text-tx-secondary hover:text-tx-primary hover:bg-bg-overlay'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Database className="w-3.5 h-3.5" />
                <span>Connections</span>
              </div>
              <span className="px-1.5 py-0.2 rounded bg-bg-base text-tx-muted font-mono text-[10px]">
                {realConnections.length}
              </span>
            </button>

            {/* History */}
            <button
              onClick={() => setActiveView('history')}
              className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs font-medium transition-colors cursor-pointer ${
                activeView === 'history'
                  ? 'bg-accent-primary/15 text-accent-primary font-semibold'
                  : 'text-tx-secondary hover:text-tx-primary hover:bg-bg-overlay'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Clock className="w-3.5 h-3.5" />
                <span>History</span>
              </div>
              {history.length > 0 && (
                <span className="px-1.5 py-0.2 rounded bg-bg-base text-tx-muted font-mono text-[10px]">
                  {history.length}
                </span>
              )}
            </button>

            {/* Saved Queries */}
            <button
              onClick={() => setActiveView('saved-queries')}
              className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs font-medium transition-colors cursor-pointer ${
                activeView === 'saved-queries'
                  ? 'bg-accent-primary/15 text-accent-primary font-semibold'
                  : 'text-tx-secondary hover:text-tx-primary hover:bg-bg-overlay'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Bookmark className="w-3.5 h-3.5" />
                <span>Saved Queries</span>
              </div>
              {savedQueries.length > 0 && (
                <span className="px-1.5 py-0.2 rounded bg-bg-base text-tx-muted font-mono text-[10px]">
                  {savedQueries.length}
                </span>
              )}
            </button>

            {/* Extensions */}
            <button
              onClick={() => setActiveView('extensions')}
              className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs font-medium transition-colors cursor-pointer ${
                activeView === 'extensions'
                  ? 'bg-accent-primary/15 text-accent-primary font-semibold'
                  : 'text-tx-secondary hover:text-tx-primary hover:bg-bg-overlay'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Boxes className="w-3.5 h-3.5" />
                <span>Extensions</span>
              </div>
              <span className="px-1.5 py-0.2 rounded bg-accent-primary/10 text-accent-primary font-mono text-[9px] font-semibold border border-accent-primary/20">
                New
              </span>
            </button>
          </div>
        </div>

        {/* ============================================================
            SECTION 2: Connections Section (Clean, Real Connected DBs)
           ============================================================ */}
        <div className="border-b border-border-subtle shrink-0">
          {/* Section Header */}
          <div className="px-3 py-2 flex items-center justify-between text-tx-muted">
            <button
              onClick={() => setConnectionsExpanded(!connectionsExpanded)}
              className="flex items-center space-x-1.5 text-[10px] uppercase font-bold tracking-wider hover:text-tx-primary transition-colors cursor-pointer"
            >
              {connectionsExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
              <span>Connections</span>
              {realConnections.length > 0 && (
                <span className="px-1 py-0.2 text-[9px] font-mono rounded bg-bg-base text-tx-muted border border-border-subtle ml-1">
                  {realConnections.length}
                </span>
              )}
            </button>

            <button
              onClick={onOpenNewConnectionModal}
              className="text-[10px] text-tx-muted hover:text-tx-primary px-1.5 py-0.5 rounded hover:bg-bg-overlay transition-colors cursor-pointer font-mono"
              title="Add New Database Connection"
            >
              + Add
            </button>
          </div>

          {/* Configured Connections List - Text-based, No Icons, No Glow */}
          {connectionsExpanded && (
            <div className="px-2 pb-2 space-y-1 max-h-44 overflow-y-auto custom-scrollbar">
              {realConnections.length === 0 ? (
                <div className="px-3 py-2.5 text-center text-tx-muted text-[11px]">
                  No connections added yet.
                </div>
              ) : (
                realConnections.map((conn) => {
                  const isActive = conn.id === activeConnectionId;

                  return (
                    <div
                      key={conn.id}
                      onClick={() => {
                        if (!isActive) {
                          connect(conn);
                        }
                      }}
                      className={`px-2.5 py-1.5 rounded-md flex items-center justify-between cursor-pointer transition-all ${
                        isActive
                          ? 'bg-bg-elevated border-l-2 border-accent-primary text-tx-primary'
                          : 'text-tx-secondary hover:text-tx-primary hover:bg-bg-overlay/50'
                      }`}
                    >
                      {/* Connection Details */}
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium truncate">{conn.name}</span>
                          <span className="text-[9px] uppercase font-mono text-tx-muted/70 tracking-wider">
                            {conn.driver}
                          </span>
                        </div>
                        <div className="text-[10px] text-tx-muted font-mono truncate">
                          {conn.driver === 'sqlite'
                            ? conn.filePath || 'sqlite.db'
                            : `${conn.host || 'localhost'}:${conn.port || 5432}`}
                        </div>
                      </div>

                      {/* State / Actions */}
                      <div className="shrink-0 flex items-center space-x-1.5 text-[10px] font-mono">
                        {isActive ? (
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[9px] text-accent-primary font-medium">
                              Active
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                disconnect();
                              }}
                              className="text-[9px] text-tx-muted hover:text-rose-400 transition-colors px-1 py-0.5 rounded hover:bg-bg-overlay cursor-pointer"
                              title="Disconnect"
                            >
                              Disconnect
                            </button>
                          </div>
                        ) : (
                          <span className="text-[9px] text-tx-muted/40">Connect</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* ============================================================
            SECTION 3: Database Section (Hierarchical DB Icon & Tables, No Borders)
           ============================================================ */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {/* Section Header */}
          <div className="px-3 py-2 flex items-center justify-between text-tx-muted shrink-0">
            <button
              onClick={() => setDatabaseExpanded(!databaseExpanded)}
              className="flex items-center space-x-1.5 text-[10px] uppercase font-bold tracking-wider hover:text-tx-primary transition-colors cursor-pointer"
            >
              {databaseExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
              <span>Database</span>
            </button>

            {activeConn && (
              <button
                onClick={refreshSchema}
                disabled={isConnecting}
                className="p-1 hover:text-tx-primary rounded hover:bg-bg-overlay transition-colors disabled:opacity-40 cursor-pointer"
                title="Refresh Schema Objects"
              >
                <RefreshCw className={`w-3 h-3 ${isConnecting ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>

          {/* Database Tree Content */}
          {databaseExpanded && (
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

                  {/* Nested Tables Tree under DB */}
                  <div className="ml-2 pl-1 space-y-0.5 pt-1">
                    {tablesList.length === 0 ? (
                      <div className="py-3 text-center text-tx-muted text-[11px] italic">
                        {schemaTree ? 'No tables found' : 'Loading schema objects...'}
                      </div>
                    ) : (
                      tablesList.map((table) => {
                        const isExpanded = Boolean(expandedTables[table.name]);
                        const cols = tableColumns[table.name] || [];
                        const isLoadingCols = Boolean(loadingColumnsFor[table.name]);

                        return (
                          <div key={table.name} className="space-y-0.5">
                            {/* Table Item Row */}
                            <div
                              onClick={() => toggleTableExpansion(table.name)}
                              className="px-2 py-1 rounded-md hover:bg-bg-overlay/60 text-tx-secondary hover:text-tx-primary flex items-center justify-between text-xs font-mono cursor-pointer transition-colors group"
                            >
                              <div className="flex items-center space-x-1.5 truncate flex-1 min-w-0">
                                <span className="text-tx-muted group-hover:text-tx-primary p-0.5">
                                  {isExpanded ? (
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

                                {/* Quick "Run / View Rows" button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickSelectTableRows(table.name);
                                  }}
                                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-accent-primary hover:text-accent-text text-tx-muted transition-all cursor-pointer"
                                  title="View Rows (SELECT * LIMIT 100)"
                                >
                                  <Play className="w-2.5 h-2.5 fill-current" />
                                </button>
                              </div>
                            </div>

                            {/* Expanded Table Columns */}
                            {isExpanded && (
                              <div className="ml-4 pl-1.5 py-1 space-y-1 font-mono text-[10px]">
                                {/* Quick actions row for table */}
                                <div className="flex items-center space-x-1 pb-1 pt-0.5">
                                  <button
                                    onClick={() => handleQuickSelectTableRows(table.name)}
                                    className="px-1.5 py-0.5 rounded bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary text-[9px] font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
                                  >
                                    <Play className="w-2 h-2 fill-current" />
                                    <span>Rows</span>
                                  </button>
                                  <button
                                    onClick={() => handleQuickCountTableRows(table.name)}
                                    className="px-1.5 py-0.5 rounded bg-bg-base hover:bg-bg-elevated text-tx-muted hover:text-tx-primary border border-border-subtle text-[9px] transition-colors cursor-pointer"
                                  >
                                    Count
                                  </button>
                                </div>

                                {/* Columns List */}
                                {isLoadingCols ? (
                                  <div className="text-[10px] text-tx-muted py-0.5 italic flex items-center space-x-1">
                                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                    <span>Loading columns...</span>
                                  </div>
                                ) : cols.length === 0 ? (
                                  <div className="text-[10px] text-tx-muted py-0.5 italic">
                                    No columns found
                                  </div>
                                ) : (
                                  <div className="space-y-0.5">
                                    {cols.map((col) => (
                                      <div
                                        key={col.name}
                                        onClick={() => handleInsertColumn(table.name, col.name)}
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
      </div>

      {/* Mouse Drag Handle to resize sidebar width */}
      <div
        onMouseDown={handleMouseDownResize}
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-accent-primary transition-colors z-30"
        title="Drag to resize sidebar width"
      />
    </aside>
  );
};
