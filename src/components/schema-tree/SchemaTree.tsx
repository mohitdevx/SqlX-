import { useConnectionStore } from '@/stores/connectionStore';
import { useQueryStore } from '@/stores/queryStore';
import { Database, Folder, PlayCircle, RefreshCw, Search, Table } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

export const SchemaTree: React.FC = () => {
  const { schemaTree, isLoading, refreshSchema, activeConnectionId, connections } =
    useConnectionStore();
  const { createTab, runActiveQuery } = useQueryStore();
  const [filter, setFilter] = useState('');

  const currentConn = connections.find((c) => c.id === activeConnectionId);

  const filteredTables =
    schemaTree?.tables.filter((t) => t.name.toLowerCase().includes(filter.toLowerCase())) || [];

  const handleQuickSelect = (tableName: string) => {
    const sql = `SELECT * FROM ${tableName} LIMIT 100;`;
    createTab(sql);
    if (activeConnectionId) {
      setTimeout(() => runActiveQuery(activeConnectionId), 50);
    }
  };

  return (
    <div className="w-64 h-full bg-bg-surface border-r border-border-subtle flex flex-col select-none font-sans">
      {/* Header */}
      <div className="h-9 px-3 border-b border-border-subtle flex items-center justify-between text-xs font-semibold text-tx-secondary">
        <div className="flex items-center space-x-1.5">
          <Database className="w-3.5 h-3.5 text-accent-primary" />
          <span className="truncate">SCHEMA EXPLORER</span>
        </div>
        <button
          onClick={refreshSchema}
          disabled={!activeConnectionId || isLoading}
          className="p-1 hover:bg-bg-overlay rounded text-tx-muted hover:text-tx-primary transition-colors disabled:opacity-40"
          title="Refresh Schema"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Input */}
      <div className="p-2 border-b border-border-subtle">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-tx-muted" />
          <input
            type="text"
            placeholder="Filter tables..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-bg-base border border-border-subtle rounded pl-7 pr-2 py-1 text-xs text-tx-primary focus:outline-none focus:border-accent-primary font-mono placeholder:text-tx-muted"
          />
        </div>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-2 text-xs font-mono space-y-2">
        {!activeConnectionId ? (
          <div className="p-4 text-tx-muted text-center text-xs">
            Connect to a database to inspect schemas and tables.
          </div>
        ) : !schemaTree ? (
          <div className="p-4 text-tx-muted text-center text-xs">Loading schema...</div>
        ) : (
          <div className="space-y-1">
            {/* Database Node */}
            <div className="flex items-center space-x-1.5 px-2 py-1 text-tx-primary font-bold bg-bg-elevated rounded">
              <Database className="w-3.5 h-3.5 text-accent-primary" />
              <span className="truncate">{currentConn?.database || 'default'}</span>
            </div>

            {/* Tables Container */}
            <div className="ml-2 space-y-0.5 pt-1">
              <div className="flex items-center space-x-1.5 px-2 py-1 text-tx-muted text-[11px] font-semibold uppercase">
                <Folder className="w-3 h-3" />
                <span>Tables ({filteredTables.length})</span>
              </div>

              <div className="space-y-0.5 ml-2">
                {filteredTables.map((table, idx) => (
                  <div
                    key={idx}
                    className="group flex items-center justify-between px-2 py-1 text-tx-secondary hover:text-tx-primary hover:bg-bg-overlay rounded cursor-pointer transition-colors"
                  >
                    <div
                      onClick={() => handleQuickSelect(table.name)}
                      className="flex items-center space-x-1.5 truncate flex-1"
                      title={table.name}
                    >
                      <Table className="w-3 h-3 text-tx-muted group-hover:text-accent-primary flex-shrink-0" />
                      <span className="truncate">{table.name}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickSelect(table.name);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-accent-primary text-tx-muted transition-opacity"
                      title="Run SELECT * FROM table LIMIT 100"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
