import { useConnectionStore } from '@/stores/connectionStore';
import { useQueryStore } from '@/stores/queryStore';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ConnectionList } from './sidebar/ConnectionList';
import { SchemaExplorer } from './sidebar/SchemaExplorer';
import { type NavView, SidebarNav } from './sidebar/SidebarNav';

export type { NavView };

export interface SidebarProps {
  activeView: NavView;
  setActiveView: (view: NavView) => void;
  onOpenNewConnectionModal: () => void;
  onTableSelected?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  onOpenNewConnectionModal,
  onTableSelected,
}) => {
  const {
    connections,
    activeConnectionId,
    connect,
    disconnect,
    updateConnection,
    schemaTree,
    refreshSchema,
    tableColumns,
    fetchTableColumns,
    switchDatabase,
    selectedTable,
    setSelectedTable,
    isLoading: isConnecting,
  } = useConnectionStore();

  const {
    createTab,
    runActiveQuery,
    updateSql,
    renameTab,
    tabs,
    history,
    savedQueries,
    activeTabId,
  } = useQueryStore();

  // Mouse-resizable sidebar width (min 180px, max 500px)
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const isDraggingRef = useRef(false);

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

  // Auto-sync connection with the database on launch or re-mount
  useEffect(() => {
    if (activeConnectionId && activeConn && !schemaTree && !isConnecting) {
      connect(activeConn);
    }
  }, [activeConnectionId, activeConn, schemaTree, isConnecting, connect]);

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
    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (activeTab) {
      updateSql(activeTab.id, sql);
      renameTab(activeTab.id, tableName);
    } else {
      createTab(sql, tableName);
    }
    setActiveView('query');
    if (activeConnectionId) {
      setTimeout(() => {
        runActiveQuery(activeConnectionId, sql);
      }, 50);
    }
  };

  const handleQuickCountTableRows = (tableName: string) => {
    const sql = `SELECT COUNT(*) AS total_rows FROM ${tableName};`;
    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (activeTab) {
      updateSql(activeTab.id, sql);
      renameTab(activeTab.id, `Count ${tableName}`);
    } else {
      createTab(sql, `Count ${tableName}`);
    }
    setActiveView('query');
    if (activeConnectionId) {
      setTimeout(() => {
        runActiveQuery(activeConnectionId, sql);
      }, 50);
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

  return (
    <aside
      style={{ width: `${sidebarWidth}px` }}
      className="relative bg-bg-surface border-r border-border-subtle flex flex-col justify-between select-none z-20 shrink-0 h-full font-sans transition-[width] duration-75"
    >
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Section 1: Navigation & Actions */}
        <SidebarNav
          activeView={activeView}
          setActiveView={setActiveView}
          onNewQuery={handleNewQueryClick}
          tabsCount={tabs.length}
          connectionsCount={realConnections.length}
          historyCount={history.length}
          savedQueriesCount={savedQueries.length}
        />

        {/* Section 2: Configured Connections */}
        <ConnectionList
          connections={realConnections}
          activeConnectionId={activeConnectionId}
          onConnect={connect}
          onDisconnect={disconnect}
          onUpdateConnection={updateConnection}
          onOpenNewConnectionModal={onOpenNewConnectionModal}
        />

        {/* Section 3: Schema & Database Objects */}
        <SchemaExplorer
          activeConn={activeConn}
          activeConnectionId={activeConnectionId}
          schemaTree={schemaTree}
          tableColumns={tableColumns}
          selectedTable={selectedTable}
          isConnecting={isConnecting}
          onRefreshSchema={refreshSchema}
          onFetchTableColumns={fetchTableColumns}
          onSelectTable={(tableName) => {
            setSelectedTable(tableName);
            onTableSelected?.();
          }}
          onQuickSelectRows={handleQuickSelectTableRows}
          onQuickCountRows={handleQuickCountTableRows}
          onInsertColumn={handleInsertColumn}
          onSwitchDatabase={switchDatabase}
        />
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
export default Sidebar;
