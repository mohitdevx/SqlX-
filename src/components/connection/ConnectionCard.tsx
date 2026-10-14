import type { ConnectionConfig, DatabaseDriver } from '@/types/database';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  Pencil,
  Power,
  Trash2,
  X,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

const DRIVER_LABELS: Record<DatabaseDriver, string> = {
  postgres: 'PostgreSQL',
  mysql: 'MySQL',
  sqlite: 'SQLite',
};

export interface ConnectionCardProps {
  conn: ConnectionConfig;
  isActive: boolean;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onRename: (newName: string) => void;
  onDelete: () => void;
  onNavigateToEditor: () => void;
}

export const ConnectionCard: React.FC<ConnectionCardProps> = ({
  conn,
  isActive,
  isConnecting,
  onConnect,
  onDisconnect,
  onRename,
  onDelete,
  onNavigateToEditor,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(conn.name);
  const [isCopiedUri, setIsCopiedUri] = useState(false);

  const capsuleColor = conn.color || '#3b82f6';

  const buildConnectionUri = () => {
    if (conn.driver === 'sqlite') {
      return `sqlite://${conn.filePath || 'sqlite.db'}`;
    }
    const user = conn.username ? `${conn.username}` : '';
    const auth = user ? `${user}:****@` : '';
    const host = conn.host || 'localhost';
    const port = conn.port ? `:${conn.port}` : '';
    const db = conn.database ? `/${conn.database}` : '';
    const ssl = conn.ssl ? '?sslmode=require' : '';
    return `${conn.driver}://${auth}${host}${port}${db}${ssl}`;
  };

  const uri = buildConnectionUri();

  const handleCopyUri = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(uri);
    setIsCopiedUri(true);
    setTimeout(() => setIsCopiedUri(false), 1500);
  };

  const handleSaveRename = () => {
    if (editingName.trim()) {
      onRename(editingName.trim());
    }
    setIsEditing(false);
  };

  return (
    <div
      className={`rounded-xl transition-all overflow-hidden ${
        isActive ? 'bg-white/[0.07] shadow-xs' : 'bg-white/[0.04] hover:bg-white/[0.07]'
      }`}
    >
      {/* Connection Header / Main Toggle Row */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3.5 flex items-center justify-between gap-4 cursor-pointer"
      >
        {/* Left Side: Expand Chevron + Color Capsule + Basic Info */}
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="text-tx-muted p-0.5 hover:text-tx-primary transition-colors">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>

          {/* Vertical Color Capsule */}
          <span
            style={{ backgroundColor: capsuleColor }}
            className="w-[3px] h-8 rounded-full shrink-0"
          />

          <div className="min-w-0 flex-1">
            {isEditing ? (
              <div
                className="flex items-center gap-1.5 py-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveRename();
                    if (e.key === 'Escape') setIsEditing(false);
                  }}
                  autoFocus
                  className="bg-bg-base rounded px-2 py-0.5 text-xs text-tx-primary focus:outline-none font-sans"
                />
                <button
                  type="button"
                  onClick={handleSaveRename}
                  className="p-1 text-accent-primary hover:text-accent-primary-hover cursor-pointer"
                  title="Save"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="p-1 text-tx-muted hover:text-tx-primary cursor-pointer"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 truncate">
                <span className="text-xs font-medium text-tx-primary truncate">{conn.name}</span>
                {conn.environment && conn.environment !== 'development' && (
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-mono capitalize ${
                      conn.environment === 'production'
                        ? 'bg-rose-500/10 text-rose-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}
                  >
                    {conn.environment}
                  </span>
                )}
                {isActive && (
                  <span className="text-[10px] text-emerald-400 font-medium">Active</span>
                )}
              </div>
            )}

            <div className="flex items-center space-x-2 text-[11px] text-tx-muted font-mono mt-0.5 truncate">
              <span>{DRIVER_LABELS[conn.driver]}</span>
              <span className="opacity-30">·</span>
              <span className="truncate">
                {conn.driver === 'sqlite'
                  ? conn.filePath || 'sqlite.db'
                  : `${conn.host || 'localhost'}:${conn.port || 5432} / ${conn.database || 'default'}`}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Action Controls */}
        <div
          className="flex items-center space-x-1.5 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
              setEditingName(conn.name);
            }}
            className="p-1.5 text-tx-muted hover:text-tx-primary rounded-lg hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Rename"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 text-tx-muted hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Delete connection"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {isActive ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDisconnect();
              }}
              className="px-3 py-1 rounded-lg bg-white/[0.06] hover:bg-rose-500/15 text-tx-secondary hover:text-rose-400 text-xs font-medium transition-colors flex items-center space-x-1.5 cursor-pointer"
              title="Disconnect"
            >
              <Power className="w-3 h-3" />
              <span>Disconnect</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onConnect();
              }}
              disabled={isConnecting}
              className="px-3.5 py-1 rounded-lg bg-white/[0.06] hover:bg-accent-primary hover:text-accent-text text-tx-secondary text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Metadata & Details Panel */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-border-subtle/20 space-y-3.5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
            <div className="space-y-0.5">
              <div className="text-[10px] text-tx-muted uppercase font-mono">Database Engine</div>
              <div className="text-tx-primary font-medium">{DRIVER_LABELS[conn.driver]}</div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[10px] text-tx-muted uppercase font-mono">
                {conn.driver === 'sqlite' ? 'File Location' : 'Host & Port'}
              </div>
              <div className="text-tx-primary font-mono text-[11px] truncate">
                {conn.driver === 'sqlite'
                  ? conn.filePath || 'sqlite.db'
                  : `${conn.host || 'localhost'}:${conn.port || 5432}`}
              </div>
            </div>

            {conn.driver !== 'sqlite' && (
              <div className="space-y-0.5">
                <div className="text-[10px] text-tx-muted uppercase font-mono">Database Name</div>
                <div className="text-tx-primary font-mono text-[11px] truncate">
                  {conn.database || 'default'}
                </div>
              </div>
            )}

            {conn.driver !== 'sqlite' && (
              <div className="space-y-0.5">
                <div className="text-[10px] text-tx-muted uppercase font-mono">User / Role</div>
                <div className="text-tx-primary font-mono text-[11px] truncate">
                  {conn.username || 'postgres'}
                </div>
              </div>
            )}

            <div className="space-y-0.5">
              <div className="text-[10px] text-tx-muted uppercase font-mono">SSL / TLS</div>
              <div className="text-tx-primary text-[11px]">{conn.ssl ? 'Enabled' : 'Disabled'}</div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[10px] text-tx-muted uppercase font-mono">Environment</div>
              <div className="text-tx-primary capitalize text-[11px]">
                {conn.environment || 'development'}
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[10px] text-tx-muted uppercase font-mono">Session Status</div>
              <div className="text-[11px] font-medium">
                {isActive ? (
                  <span className="text-emerald-400">Connected & Ready</span>
                ) : (
                  <span className="text-tx-muted">Idle</span>
                )}
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[10px] text-tx-muted uppercase font-mono">Color Profile</div>
              <div className="flex items-center space-x-1.5">
                <span
                  style={{ backgroundColor: capsuleColor }}
                  className="w-3 h-3 rounded-full shrink-0"
                />
                <span className="font-mono text-[11px] text-tx-muted">{capsuleColor}</span>
              </div>
            </div>
          </div>

          {/* Connection URI Row */}
          <div className="p-2.5 rounded-lg bg-white/[0.04] flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <span className="text-[10px] font-mono text-tx-muted uppercase shrink-0">URI:</span>
              <span className="font-mono text-[11px] text-tx-secondary truncate">{uri}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyUri}
              className="px-2 py-0.5 rounded text-[10px] text-tx-muted hover:text-tx-primary hover:bg-white/[0.08] transition-colors flex items-center space-x-1 shrink-0 cursor-pointer"
              title="Copy Connection String"
            >
              {isCopiedUri ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy URI</span>
                </>
              )}
            </button>
          </div>

          {/* Footer Actions inside panel */}
          {isActive && (
            <div className="flex items-center justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={onNavigateToEditor}
                className="px-3 py-1 rounded-lg text-xs font-medium text-tx-secondary hover:text-tx-primary hover:bg-white/[0.08] transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Query Editor</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
