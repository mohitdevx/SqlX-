import { useConnectionStore } from '@/stores/connectionStore';
import { useQueryStore } from '@/stores/queryStore';
import {
  ChevronDown,
  ChevronRight,
  Columns,
  Database,
  Key,
  Layers,
  Play,
  RefreshCw,
  Search,
  Table,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

export const SchemaTree: React.FC = () => {
  const { schemaTree, isLoading, refreshSchema, activeConnectionId, connections } =
    useConnectionStore();
  const { createTab, runActiveQuery } = useQueryStore();
  const [filter, setFilter] = useState('');
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});

  const currentConn = connections.find((c) => c.id === activeConnectionId);

  const filteredTables =
    schemaTree?.tables.filter((t) => t.name.toLowerCase().includes(filter.toLowerCase())) || [];

  const toggleTable = (tableName: string) => {
    setExpandedTables((prev) => ({
      ...prev,
      [tableName]: !prev[tableName],
    }));
  };

  const handleQuickSelect = (tableName: string) => {
    const sql = `SELECT * FROM ${tableName} LIMIT 100;`;
    createTab(sql);
    if (activeConnectionId) {
      setTimeout(() => runActiveQuery(activeConnectionId), 50);
    }
  };

  return (
    <div className="w-72 h-full bg-bg-surface border-r border-border-subtle flex flex-col select-none font-sans text-xs">
      {/* Header Bar */}
      <div className="h-10 px-3 border-b border-border-subtle flex items-center justify-between bg-bg-surface">
        <div className="flex items-center space-x-2">
          <Database className="w-3.5 h-3.5 text-white/90" strokeWidth={1.5} />
          <span className="font-semibold text-white tracking-tight">Explorer</span>
          {schemaTree && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-bg-elevated text-tx-muted border border-border-subtle">
              {schemaTree.tables.length}
            </span>
          )}
        </div>
        <button
          onClick={refreshSchema}
          disabled={!activeConnectionId || isLoading}
          className="p-1 rounded text-tx-muted hover:text-white hover:bg-bg-overlay transition-colors disabled:opacity-40"
          title="Refresh Schema"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
            strokeWidth={1.5}
          />
        </button>
      </div>

      {/* Search Filter */}
      <div className="p-2 border-b border-border-subtle bg-bg-surface">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-tx-muted" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Filter tables..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-bg-base border border-border-subtle rounded-md pl-8 pr-2 py-1 text-xs text-white focus:outline-none focus:border-border-strong font-mono placeholder:text-tx-muted transition-colors"
          />
        </div>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-2 font-mono text-[12px] space-y-1">
        {!activeConnectionId ? (
          <div className="p-6 text-center text-tx-muted space-y-2">
            <p className="font-sans text-xs">No active database connected.</p>
          </div>
        ) : !schemaTree ? (
          <div className="p-6 text-center text-tx-muted font-sans text-xs">
            Loading schema objects...
          </div>
        ) : (
          <div className="space-y-0.5">
            {/* Database Node */}
            <div className="flex items-center space-x-2 px-2 py-1.5 text-white font-medium rounded bg-bg-overlay/60">
              <Database className="w-3.5 h-3.5 text-white/80 flex-shrink-0" strokeWidth={1.5} />
              <span className="truncate">{currentConn?.database || 'Database'}</span>
            </div>

            {/* Tables Group */}
            <div className="pt-1">
              <div className="flex items-center space-x-1.5 px-2 py-1 text-tx-muted text-[11px] font-sans font-semibold tracking-wider uppercase">
                <Layers className="w-3 h-3 text-tx-muted" strokeWidth={1.5} />
                <span>Tables ({filteredTables.length})</span>
              </div>

              <div className="space-y-0.5 pt-0.5">
                {filteredTables.map((table) => {
                  const isExpanded = !!expandedTables[table.name];
                  return (
                    <div key={table.name} className="space-y-0.5">
                      <div className="group flex items-center justify-between px-2 py-1 text-tx-secondary hover:text-white hover:bg-bg-overlay rounded-md cursor-pointer transition-colors">
                        <div
                          onClick={() => toggleTable(table.name)}
                          className="flex items-center space-x-1.5 truncate flex-1"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3 h-3 text-tx-muted" strokeWidth={1.5} />
                          ) : (
                            <ChevronRight className="w-3 h-3 text-tx-muted" strokeWidth={1.5} />
                          )}
                          <Table
                            className="w-3.5 h-3.5 text-white/70 group-hover:text-white flex-shrink-0"
                            strokeWidth={1.5}
                          />
                          <span className="truncate font-mono text-xs">{table.name}</span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickSelect(table.name);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-white text-tx-muted transition-all rounded hover:bg-bg-elevated"
                          title="Run SELECT * FROM table LIMIT 100"
                        >
                          <Play className="w-3 h-3 fill-current text-white/80" strokeWidth={1.5} />
                        </button>
                      </div>

                      {/* Expanded Columns Preview */}
                      {isExpanded && (
                        <div className="ml-5 pl-2 border-l border-border-subtle py-1 space-y-1 font-mono text-[11px]">
                          <div className="flex items-center justify-between pr-2 text-tx-muted hover:text-white">
                            <div className="flex items-center space-x-1.5">
                              <Key className="w-2.5 h-2.5 text-white/60" strokeWidth={1.5} />
                              <span>id</span>
                            </div>
                            <span className="text-[10px] text-tx-muted uppercase">SERIAL PK</span>
                          </div>
                          <div className="flex items-center justify-between pr-2 text-tx-muted hover:text-white">
                            <div className="flex items-center space-x-1.5">
                              <Columns className="w-2.5 h-2.5 text-white/60" strokeWidth={1.5} />
                              <span>created_at</span>
                            </div>
                            <span className="text-[10px] text-tx-muted uppercase">TIMESTAMP</span>
                          </div>
                          <div
                            onClick={() => handleQuickSelect(table.name)}
                            className="text-[10px] text-white/80 hover:text-white cursor-pointer pt-0.5 underline"
                          >
                            + Query columns
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
