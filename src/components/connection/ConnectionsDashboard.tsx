import { useConnectionStore } from '@/stores/connectionStore';
import type { ConnectionConfig, DatabaseDriver } from '@/types/database';
import { Database, Link, Plus, Search } from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';
import { ConnectionCard } from './ConnectionCard';

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
  const [uriInput, setUriInput] = useState('');
  const [showUriInput, setShowUriInput] = useState(false);

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
              type="button"
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
              type="button"
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
                type="button"
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

        {/* Connections List */}
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
            filteredConnections.map((conn) => (
              <ConnectionCard
                key={conn.id}
                conn={conn}
                isActive={conn.id === activeConnectionId}
                isConnecting={connectingId === conn.id}
                onConnect={() => handleConnect(conn)}
                onDisconnect={disconnect}
                onRename={(newName) => updateConnection({ ...conn, name: newName })}
                onDelete={() => {
                  if (confirm(`Delete connection "${conn.name}"?`)) {
                    removeConnection(conn.id);
                  }
                }}
                onNavigateToEditor={onNavigateToEditor}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default ConnectionsDashboard;
