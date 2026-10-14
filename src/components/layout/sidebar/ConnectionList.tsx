import type { ConnectionConfig } from '@/types/database';
import { Check, ChevronDown, ChevronRight, Database, Pencil, Power, X } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

export interface ConnectionListProps {
  connections: ConnectionConfig[];
  activeConnectionId: string | null;
  onConnect: (conn: ConnectionConfig) => void;
  onDisconnect: () => void;
  onUpdateConnection: (conn: ConnectionConfig) => void;
  onOpenNewConnectionModal: () => void;
}

export const ConnectionList: React.FC<ConnectionListProps> = ({
  connections,
  activeConnectionId,
  onConnect,
  onDisconnect,
  onUpdateConnection,
  onOpenNewConnectionModal,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingConnectionId, setEditingConnectionId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleStartRename = (conn: ConnectionConfig) => {
    setEditingConnectionId(conn.id);
    setEditingName(conn.name);
  };

  const handleSaveRename = (conn: ConnectionConfig) => {
    if (editingName.trim()) {
      onUpdateConnection({ ...conn, name: editingName.trim() });
    }
    setEditingConnectionId(null);
  };

  return (
    <div className="border-b border-border-subtle shrink-0">
      {/* Section Header */}
      <div className="px-3 py-2 flex items-center justify-between text-tx-muted">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-1.5 text-[10px] uppercase font-bold tracking-wider hover:text-tx-primary transition-colors cursor-pointer"
        >
          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          <span>Connections</span>
          {connections.length > 0 && (
            <span className="px-1 py-0.2 text-[9px] font-mono rounded bg-bg-base text-tx-muted border border-border-subtle ml-1">
              {connections.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={onOpenNewConnectionModal}
          className="text-[10px] text-tx-muted hover:text-tx-primary px-1.5 py-0.5 rounded hover:bg-bg-overlay transition-colors cursor-pointer font-mono"
          title="Add New Database Connection"
        >
          + Add
        </button>
      </div>

      {/* Configured Connections List */}
      {isExpanded && (
        <div className="px-2 pb-2 space-y-0.5 max-h-48 overflow-y-auto custom-scrollbar">
          {connections.length === 0 ? (
            <div className="px-3 py-4 text-center space-y-1.5">
              <Database className="w-5 h-5 mx-auto text-tx-muted/30" />
              <p className="text-[11px] text-tx-muted">No database configured</p>
              <button
                type="button"
                onClick={onOpenNewConnectionModal}
                className="text-[10px] text-accent-primary hover:underline font-medium cursor-pointer"
              >
                + Add Connection
              </button>
            </div>
          ) : (
            connections.map((conn) => {
              const isActive = conn.id === activeConnectionId;
              const isEditing = editingConnectionId === conn.id;

              if (isEditing) {
                return (
                  <div
                    key={conn.id}
                    className="px-2 py-1 rounded bg-bg-elevated flex items-center gap-1 my-0.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(conn);
                        if (e.key === 'Escape') setEditingConnectionId(null);
                      }}
                      autoFocus
                      className="flex-1 bg-bg-base border border-accent-primary rounded px-1.5 py-0.5 text-xs text-tx-primary font-sans focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveRename(conn)}
                      className="p-1 text-accent-primary hover:text-accent-primary-hover cursor-pointer"
                      title="Save (Enter)"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingConnectionId(null)}
                      className="p-1 text-tx-muted hover:text-tx-primary cursor-pointer"
                      title="Cancel (Esc)"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={conn.id}
                  onClick={() => {
                    if (!isActive) {
                      onConnect(conn);
                    }
                  }}
                  className={`group px-2 py-1.5 rounded-md flex items-center justify-between cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-bg-elevated text-tx-primary'
                      : 'text-tx-secondary hover:text-tx-primary hover:bg-bg-overlay/50'
                  }`}
                >
                  {/* Left: Thin Vertical Color Capsule + Connection Details */}
                  <div className="flex items-center space-x-2.5 min-w-0 flex-1 truncate pr-2">
                    <span
                      style={{
                        backgroundColor: conn.color || '#3b82f6',
                      }}
                      className="w-[3px] h-7 rounded-full shrink-0"
                      title={conn.name}
                    />
                    <div className="min-w-0 flex-1 truncate">
                      <div className="text-xs font-medium truncate leading-tight">{conn.name}</div>
                      <div className="text-[10px] text-tx-muted font-mono truncate leading-tight mt-0.5">
                        {conn.driver === 'sqlite'
                          ? conn.filePath || 'sqlite.db'
                          : `${conn.host || 'localhost'}:${conn.port || 5432}`}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="shrink-0 flex items-center space-x-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartRename(conn);
                      }}
                      className="p-1 text-tx-muted hover:text-tx-primary rounded hover:bg-bg-overlay cursor-pointer"
                      title="Rename Connection"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>

                    {isActive && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDisconnect();
                        }}
                        className="p-1 text-tx-muted hover:text-rose-400 rounded hover:bg-bg-overlay cursor-pointer"
                        title="Disconnect Database"
                      >
                        <Power className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
