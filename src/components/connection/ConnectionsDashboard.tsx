import { useConnectionStore } from '@/stores/connectionStore';
import type { ConnectionConfig, DatabaseDriver } from '@/types/database';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Database,
  ExternalLink,
  Link,
  Pencil,
  Plus,
  Power,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';

interface ConnectionsDashboardProps {
  onOpenNewConnectionModal: () => void;
  onNavigateToEditor: () => void;
}

const DRIVER_LABELS: Record<DatabaseDriver, string> = {
  postgres: 'PostgreSQL',
  mysql: 'MySQL',
  sqlite: 'SQLite',
};

export const ConnectionsDashboard: React.FC<ConnectionsDashboardProps> = ({
  onOpenNewConnectionModal,
  onNavigateToEditor,
}) => {
  const {
    connections,
    activeConnectionId,
    connect,
    disconnect,
    updateConnection,
    removeConnection,
  } = useConnectionStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [driverFilter, setDriverFilter] = useState<'all' | DatabaseDriver>('all');
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [uriInput, setUriInput] = useState('');
  const [showUriInput, setShowUriInput] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [copiedUriId, setCopiedUriId] = useState<string | null>(null);

  const filteredConnections = useMemo(() => {
    return connections.filter((c) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        c.name.toLowerCase().includes(term) ||
        c.host?.toLowerCase().includes(term) ||
        c.database?.toLowerCase().includes(term) ||
        c.driver.toLowerCase().includes(term);
      const matchesDriver = driverFilter === 'all' || c.driver === driverFilter;
      return matchesSearch && matchesDriver;
    });
  }, [connections, searchTerm, driverFilter]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleConnect = async (config: ConnectionConfig) => {
    setConnectingId(config.id);
    try {
      const success = await connect(config);
      if (success) {
        onNavigateToEditor();
      }
    } finally {
      setConnectingId(null);
    }
  };

  const handleStartRename = (conn: ConnectionConfig, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conn.id);
    setEditingName(conn.name);
  };

  const handleSaveRename = (conn: ConnectionConfig) => {
    if (editingName.trim()) {
      updateConnection({ ...conn, name: editingName.trim() });
    }
    setEditingId(null);
  };

  const buildConnectionUri = (conn: ConnectionConfig) => {
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

  const handleCopyUri = (id: string, uri: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(uri);
    setCopiedUriId(id);
    setTimeout(() => setCopiedUriId(null), 1500);
  };

  const handleConnectUri = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uriInput.trim()) return;
    try {
      const url = new URL(uriInput);
      let driver: DatabaseDriver = 'postgres';
      if (url.protocol.startsWith('mysql')) driver = 'mysql';
      if (url.protocol.startsWith('sqlite')) driver = 'sqlite';

      const config: ConnectionConfig = {
        id: `uri-${Date.now()}`,
        name: `${DRIVER_LABELS[driver]} (${url.hostname || 'local'})`,
        driver,
        host: url.hostname || 'localhost',
        port: url.port ? Number.parseInt(url.port, 10) : driver === 'mysql' ? 3306 : 5432,
        database: url.pathname.replace(/^\//, '') || 'postgres',
        username: url.username || 'postgres',
        password: url.password || '',
        ssl: url.searchParams.get('sslmode') === 'require',
        color: '#3b82f6',
        environment: 'development',
      };

      setConnectingId('uri');
      const success = await connect(config);
      if (success) {
        setUriInput('');
        setShowUriInput(false);
        onNavigateToEditor();
      }
    } catch {
      alert('Invalid connection URI. Example: postgres://user:password@localhost:5432/database');
    } finally {
      setConnectingId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-bg-base text-tx-primary font-sans select-none custom-scrollbar p-6 md:p-10">
      <div className="max-w-4xl w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-medium tracking-tight text-tx-primary">Connections</h1>
            <p className="text-xs text-tx-muted mt-1">
              {connections.length === 0
                ? 'No database connections configured'
                : `${connections.length} configured ${connections.length === 1 ? 'connection' : 'connections'}${
                    activeConnectionId ? ' · 1 active' : ''
                  }`}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowUriInput(!showUriInput)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1.5 cursor-pointer ${
                showUriInput
                  ? 'bg-bg-elevated text-tx-primary'
                  : 'text-tx-secondary hover:text-tx-primary hover:bg-bg-surface'
              }`}
              title="Connect via connection URI string"
            >
              <Link className="w-3.5 h-3.5" />
              <span>URI</span>
            </button>

            <button
              onClick={onOpenNewConnectionModal}
              className="px-3.5 py-1.5 rounded-lg bg-accent-primary hover:bg-accent-primary-hover active:scale-[0.98] text-accent-text text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Connection</span>
            </button>
          </div>
        </div>

        {/* Quick URI Bar (Collapsible) */}
        {showUriInput && (
          <form
            onSubmit={handleConnectUri}
            className="p-3 rounded-xl bg-white/[0.04] flex items-center gap-2"
          >
            <input
              type="text"
              value={uriInput}
              onChange={(e) => setUriInput(e.target.value)}
              placeholder="postgres://user:password@localhost:5432/dbname"
              className="flex-1 bg-white/[0.04] focus:bg-white/[0.07] rounded-lg px-3 py-1.5 text-xs text-tx-primary placeholder-tx-muted/60 font-mono focus:outline-none transition-colors"
              autoFocus
            />
            <button
              type="submit"
              disabled={!uriInput.trim() || connectingId === 'uri'}
              className="px-3.5 py-1.5 rounded-lg bg-accent-primary hover:bg-accent-primary-hover disabled:opacity-50 text-accent-text text-xs font-medium cursor-pointer transition-colors"
            >
              {connectingId === 'uri' ? 'Connecting...' : 'Connect'}
            </button>
          </form>
        )}

        {/* Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Driver Filter Pills */}
          <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-white/[0.04] self-start">
            {(['all', 'postgres', 'mysql', 'sqlite'] as const).map((drv) => (
              <button
                key={drv}
                onClick={() => setDriverFilter(drv)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  driverFilter === drv
                    ? 'bg-white/[0.08] text-tx-primary shadow-xs'
                    : 'text-tx-muted hover:text-tx-secondary'
                }`}
              >
                {drv === 'all' ? 'All' : DRIVER_LABELS[drv]}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-tx-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter connections..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/[0.04] focus:bg-white/[0.07] text-xs text-tx-primary placeholder-tx-muted focus:outline-none transition-colors font-sans"
            />
          </div>
        </div>

        {/* Connections Accordion List */}
        <div className="space-y-2">
          {filteredConnections.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto text-tx-muted">
                <Database className="w-5 h-5 opacity-60" />
              </div>
              <div>
                <p className="text-xs font-medium text-tx-secondary">
                  {connections.length === 0
                    ? 'No connections added yet'
                    : 'No matching connections found'}
                </p>
                <p className="text-[11px] text-tx-muted mt-0.5">
                  {connections.length === 0
                    ? 'Add your first database to start querying.'
                    : 'Try clearing your search or filter.'}
                </p>
              </div>
            </div>
          ) : (
            filteredConnections.map((conn) => {
              const isActive = conn.id === activeConnectionId;
              const isExpanded = !!expandedIds[conn.id];
              const isConnecting = connectingId === conn.id;
              const isEditing = editingId === conn.id;
              const capsuleColor = conn.color || '#3b82f6';
              const uri = buildConnectionUri(conn);
              const isCopiedUri = copiedUriId === conn.id;

              return (
                <div
                  key={conn.id}
                  className={`rounded-xl transition-all overflow-hidden ${
                    isActive ? 'bg-white/[0.07] shadow-xs' : 'bg-white/[0.04] hover:bg-white/[0.07]'
                  }`}
                >
                  {/* Connection Header / Main Toggle Row */}
                  <div
                    onClick={() => toggleExpand(conn.id)}
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
                                if (e.key === 'Enter') handleSaveRename(conn);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              autoFocus
                              className="bg-bg-base rounded px-2 py-0.5 text-xs text-tx-primary focus:outline-none font-sans"
                            />
                            <button
                              onClick={() => handleSaveRename(conn)}
                              className="p-1 text-accent-primary hover:text-accent-primary-hover cursor-pointer"
                              title="Save"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1 text-tx-muted hover:text-tx-primary cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 truncate">
                            <span className="text-xs font-medium text-tx-primary truncate">
                              {conn.name}
                            </span>
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
                              <span className="text-[10px] text-emerald-400 font-medium">
                                Active
                              </span>
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
                        onClick={(e) => handleStartRename(conn, e)}
                        className="p-1.5 text-tx-muted hover:text-tx-primary rounded-lg hover:bg-white/[0.08] transition-colors cursor-pointer"
                        title="Rename"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete connection "${conn.name}"?`)) {
                            removeConnection(conn.id);
                          }
                        }}
                        className="p-1.5 text-tx-muted hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete connection"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {isActive ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            disconnect();
                          }}
                          className="px-3 py-1 rounded-lg bg-white/[0.06] hover:bg-rose-500/15 text-tx-secondary hover:text-rose-400 text-xs font-medium transition-colors flex items-center space-x-1.5 cursor-pointer"
                          title="Disconnect"
                        >
                          <Power className="w-3 h-3" />
                          <span>Disconnect</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConnect(conn);
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
                        {/* Driver */}
                        <div className="space-y-0.5">
                          <div className="text-[10px] text-tx-muted uppercase font-mono">
                            Database Engine
                          </div>
                          <div className="text-tx-primary font-medium">
                            {DRIVER_LABELS[conn.driver]}
                          </div>
                        </div>

                        {/* Host / Port */}
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

                        {/* Database Name */}
                        {conn.driver !== 'sqlite' && (
                          <div className="space-y-0.5">
                            <div className="text-[10px] text-tx-muted uppercase font-mono">
                              Database Name
                            </div>
                            <div className="text-tx-primary font-mono text-[11px] truncate">
                              {conn.database || 'default'}
                            </div>
                          </div>
                        )}

                        {/* Username */}
                        {conn.driver !== 'sqlite' && (
                          <div className="space-y-0.5">
                            <div className="text-[10px] text-tx-muted uppercase font-mono">
                              User / Role
                            </div>
                            <div className="text-tx-primary font-mono text-[11px] truncate">
                              {conn.username || 'postgres'}
                            </div>
                          </div>
                        )}

                        {/* SSL Mode */}
                        <div className="space-y-0.5">
                          <div className="text-[10px] text-tx-muted uppercase font-mono">
                            SSL / TLS
                          </div>
                          <div className="text-tx-primary text-[11px]">
                            {conn.ssl ? 'Enabled' : 'Disabled'}
                          </div>
                        </div>

                        {/* Environment */}
                        <div className="space-y-0.5">
                          <div className="text-[10px] text-tx-muted uppercase font-mono">
                            Environment
                          </div>
                          <div className="text-tx-primary capitalize text-[11px]">
                            {conn.environment || 'development'}
                          </div>
                        </div>

                        {/* Status */}
                        <div className="space-y-0.5">
                          <div className="text-[10px] text-tx-muted uppercase font-mono">
                            Session Status
                          </div>
                          <div className="text-[11px] font-medium">
                            {isActive ? (
                              <span className="text-emerald-400">Connected & Ready</span>
                            ) : (
                              <span className="text-tx-muted">Idle</span>
                            )}
                          </div>
                        </div>

                        {/* Color Profile */}
                        <div className="space-y-0.5">
                          <div className="text-[10px] text-tx-muted uppercase font-mono">
                            Color Profile
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <span
                              style={{ backgroundColor: capsuleColor }}
                              className="w-3 h-3 rounded-full shrink-0"
                            />
                            <span className="font-mono text-[11px] text-tx-muted">
                              {capsuleColor}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Connection URI Row */}
                      <div className="p-2.5 rounded-lg bg-white/[0.04] flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <span className="text-[10px] font-mono text-tx-muted uppercase shrink-0">
                            URI:
                          </span>
                          <span className="font-mono text-[11px] text-tx-secondary truncate">
                            {uri}
                          </span>
                        </div>
                        <button
                          onClick={(e) => handleCopyUri(conn.id, uri, e)}
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
                      <div className="flex items-center justify-end space-x-2 pt-1">
                        {isActive && (
                          <button
                            onClick={onNavigateToEditor}
                            className="px-3 py-1 rounded-lg text-xs font-medium text-tx-secondary hover:text-tx-primary hover:bg-white/[0.08] transition-colors flex items-center space-x-1.5 cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Open Query Editor</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
