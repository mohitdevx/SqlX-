import React from 'react';
import { useConnectionStore } from '@/stores/connectionStore';
import { Database, Table, RefreshCw, Folder } from 'lucide-react';

export const SchemaTree: React.FC = () => {
  const { schemaTree, isLoading, refreshSchema, activeConnectionId } = useConnectionStore();

  return (
    <div className="w-64 h-full bg-bg-surface border-r border-border-subtle flex flex-col select-none">
      <div className="h-8 px-3 border-b border-border-subtle flex items-center justify-between text-xs font-semibold text-tx-secondary">
        <span>SCHEMA EXPLORER</span>
        <button
          onClick={refreshSchema}
          disabled={!activeConnectionId || isLoading}
          className="p-1 hover:bg-bg-overlay rounded text-tx-muted hover:text-tx-primary transition-colors disabled:opacity-40"
          title="Refresh Schema"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-2 text-xs font-mono space-y-1">
        {!activeConnectionId ? (
          <div className="p-3 text-tx-muted text-center">No active connection.</div>
        ) : !schemaTree ? (
          <div className="p-3 text-tx-muted text-center">Loading schema...</div>
        ) : (
          <div>
            <div className="flex items-center space-x-1.5 px-2 py-1 text-tx-primary font-bold">
              <Database className="w-3.5 h-3.5 text-accent-primary" />
              <span>Databases ({schemaTree.databases.length})</span>
            </div>

            <div className="ml-4 space-y-0.5 mt-1">
              <div className="flex items-center space-x-1.5 px-2 py-1 text-tx-secondary hover:text-tx-primary hover:bg-bg-overlay rounded cursor-pointer">
                <Folder className="w-3.5 h-3.5 text-tx-muted" />
                <span>Tables ({schemaTree.tables.length})</span>
              </div>

              <div className="ml-4 space-y-0.5">
                {schemaTree.tables.map((table, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-1.5 px-2 py-0.5 text-tx-secondary hover:text-tx-primary hover:bg-bg-overlay rounded cursor-pointer"
                  >
                    <Table className="w-3 h-3 text-tx-muted" />
                    <span className="truncate">{table.name}</span>
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
