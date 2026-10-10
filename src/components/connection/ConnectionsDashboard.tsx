import { useConnectionStore } from '@/stores/connectionStore';
import { useQueryStore } from '@/stores/queryStore';
import type { ConnectionConfig, DatabaseDriver } from '@/types/database';
import {
  Database,
  ExternalLink,
  FileCode2,
  Play,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  Zap,
} from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';

interface ConnectionsDashboardProps {
  onOpenNewConnectionModal: () => void;
  onNavigateToEditor: () => void;
}

export const ConnectionsDashboard: React.FC<ConnectionsDashboardProps> = ({
  onOpenNewConnectionModal,
  onNavigateToEditor,
}) => {
  const { connections, activeConnectionId, connect, disconnect, removeConnection, isLoading } =
    useConnectionStore();
  const { tabs } = useQueryStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [envFilter, setEnvFilter] = useState<'all' | 'development' | 'staging' | 'production'>(
    'all'
  );
  const [connectionString, setConnectionString] = useState('');
  const [quickConnectLoading, setQuickConnectLoading] = useState<string | null>(null);

  const filteredConnections = useMemo(() => {
    return connections.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.host?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.database?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.driver.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEnv = envFilter === 'all' || c.environment === envFilter;
      return matchesSearch && matchesEnv;
    });
  }, [connections, searchTerm, envFilter]);

  const stats = useMemo(() => {
    return {
      total: connections.length,
      active: activeConnectionId ? 1 : 0,
      savedQueries: tabs.length,
    };
  }, [connections, activeConnectionId, tabs]);

  const handleConnect = async (config: ConnectionConfig) => {
    setQuickConnectLoading(config.id);
    const success = await connect(config);
    setQuickConnectLoading(null);
    if (success) {
      onNavigateToEditor();
    }
  };

  const handleQuickConnectDriver = (driver: DatabaseDriver) => {
    const existing = connections.find((c) => c.driver === driver);
    if (existing) {
      handleConnect(existing);
    } else {
      onOpenNewConnectionModal();
    }
  };

  const handleParseAndConnectUri = async () => {
    if (!connectionString.trim()) return;
    try {
      const url = new URL(connectionString);
      let driver: DatabaseDriver = 'postgres';
      if (url.protocol.startsWith('mysql')) driver = 'mysql';
      if (url.protocol.startsWith('sqlite')) driver = 'sqlite';

      const config: ConnectionConfig = {
        id: `uri-${Date.now()}`,
        name: `${driver.toUpperCase()} URI (${url.hostname || 'local'})`,
        driver,
        host: url.hostname || 'localhost',
        port: url.port ? Number.parseInt(url.port, 10) : driver === 'mysql' ? 3306 : 5432,
        database: url.pathname.replace(/^\//, '') || 'postgres',
        username: url.username || 'postgres',
        password: url.password || '',
        ssl: url.searchParams.get('sslmode') === 'require',
        environment: 'development',
      };

      setQuickConnectLoading('uri');
      const success = await connect(config);
      setQuickConnectLoading(null);
      if (success) {
        setConnectionString('');
        onNavigateToEditor();
      }
    } catch {
      alert('Invalid database connection URI. Example: postgres://user:pass@localhost:5432/dbname');
    }
  };

  const getDriverBadge = (driver: DatabaseDriver) => {
    switch (driver) {
      case 'postgres':
        return {
          label: 'PostgreSQL',
          color: 'bg-blue-600/20 text-blue-400 border-blue-500/30',
          dot: 'bg-blue-400',
        };
      case 'mysql':
        return {
          label: 'MySQL',
          color: 'bg-amber-600/20 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-400',
        };
      case 'sqlite':
        return {
          label: 'SQLite',
          color: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400',
        };
    }
  };

  const getEnvBadge = (env?: string) => {
    switch (env) {
      case 'production':
        return {
          label: 'Production',
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          dot: 'bg-rose-400',
        };
      case 'staging':
        return {
          label: 'Staging',
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          dot: 'bg-amber-400',
        };
      default:
        return {
          label: 'Development',
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-400',
        };
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-bg-base text-tx-primary font-sans select-none p-6 md:p-8">
      <div className="max-w-6xl w-full mx-auto space-y-6">
        {/* Top Page Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">Connections</h1>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold">
                LumiSQL Hub
              </span>
            </div>
            <p className="text-xs text-tx-secondary mt-1">
              Manage all your active database connections, saved credentials, and environments.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={onOpenNewConnectionModal}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New connection</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Total Connections */}
          <div className="p-4 rounded-xl bg-bg-surface border border-border-subtle flex items-center space-x-4 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Database className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-white">{stats.total}</div>
              <div className="text-[11px] text-tx-muted font-medium">Configured connections</div>
            </div>
          </div>

          {/* Card 2: Active Sessions */}
          <div className="p-4 rounded-xl bg-bg-surface border border-border-subtle flex items-center space-x-4 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Zap className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-white">
                {stats.active > 0 ? '1' : '0'}
              </div>
              <div className="text-[11px] text-tx-muted font-medium">Active database sessions</div>
            </div>
          </div>

          {/* Card 3: Saved Queries */}
          <div className="p-4 rounded-xl bg-bg-surface border border-border-subtle flex items-center space-x-4 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <FileCode2 className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-white">
                {stats.savedQueries}
              </div>
              <div className="text-[11px] text-tx-muted font-medium">Open query buffers</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid: Connections List (Left 2/3) + Quick Connect Sidebar (Right 1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Connections List Table */}
          <div className="lg:col-span-2 rounded-xl bg-bg-surface border border-border-subtle overflow-hidden shadow-sm">
            {/* Header Toolbar */}
            <div className="p-4 border-b border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                  Your Connections
                </h2>
                <span className="text-[11px] font-mono text-tx-muted">
                  ({filteredConnections.length})
                </span>
              </div>

              {/* Search & Filters */}
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-3.5 h-3.5 text-tx-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search connections..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-bg-base border border-border-subtle text-xs text-white placeholder-tx-muted focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <select
                  value={envFilter}
                  onChange={(e) =>
                    setEnvFilter(e.target.value as 'all' | 'development' | 'staging' | 'production')
                  }
                  className="px-2.5 py-1.5 rounded-lg bg-bg-base border border-border-subtle text-xs text-tx-secondary focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                  <option value="all">All Environments</option>
                  <option value="production">Production</option>
                  <option value="staging">Staging</option>
                  <option value="development">Development</option>
                </select>
              </div>
            </div>

            {/* List Rows */}
            <div className="divide-y divide-border-subtle">
              {filteredConnections.length === 0 ? (
                <div className="p-12 text-center text-tx-muted">
                  <Database className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No database connections found matching your filter.</p>
                </div>
              ) : (
                filteredConnections.map((conn) => {
                  const isActive = conn.id === activeConnectionId;
                  const driverBadge = getDriverBadge(conn.driver);
                  const envBadge = getEnvBadge(conn.environment);
                  const isConnectingThis = quickConnectLoading === conn.id;

                  return (
                    <div
                      key={conn.id}
                      className={`p-4 flex items-center justify-between transition-colors ${
                        isActive ? 'bg-blue-500/5' : 'hover:bg-bg-overlay/50'
                      }`}
                    >
                      {/* Left: Driver Icon & Connection Name */}
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs border ${driverBadge.color}`}
                        >
                          {conn.driver === 'postgres' && 'PG'}
                          {conn.driver === 'mysql' && 'MY'}
                          {conn.driver === 'sqlite' && 'SQL'}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-xs text-white truncate">
                              {conn.name}
                            </span>
                            {isActive && (
                              <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                                <span>Connected</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-tx-muted truncate flex items-center space-x-2 mt-0.5">
                            <span>
                              {conn.driver === 'sqlite'
                                ? conn.filePath || 'sqlite.db'
                                : `${conn.host}:${conn.port} / ${conn.database}`}
                            </span>
                            {conn.ssl && (
                              <span className="inline-flex items-center space-x-0.5 text-[9px] text-tx-muted">
                                <Shield className="w-2.5 h-2.5 text-blue-400" />
                                <span>SSL</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Environment Tag & Connect Button */}
                      <div className="flex items-center space-x-3 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium border flex items-center space-x-1 ${envBadge.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${envBadge.dot}`} />
                          <span>{envBadge.label}</span>
                        </span>

                        {isActive ? (
                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={onNavigateToEditor}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all flex items-center space-x-1 cursor-pointer shadow-sm"
                            >
                              <span>Open Query</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => disconnect()}
                              className="p-1.5 rounded-lg text-tx-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Disconnect"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleConnect(conn)}
                            disabled={isLoading || isConnectingThis}
                            className="px-3 py-1.5 rounded-lg bg-bg-base hover:bg-bg-elevated border border-border-subtle hover:border-border-default text-xs font-semibold text-white transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-40"
                          >
                            <Play className="w-3 h-3 fill-white text-white" />
                            <span>{isConnectingThis ? 'Connecting...' : 'Connect'}</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (confirm(`Remove connection "${conn.name}"?`)) {
                              removeConnection(conn.id);
                            }
                          }}
                          className="p-1.5 text-tx-muted hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                          title="Delete Connection"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Quick Connect Templates & Connection String URI */}
          <div className="space-y-4">
            {/* Quick Connect Templates */}
            <div className="p-4 rounded-xl bg-bg-surface border border-border-subtle space-y-3 shadow-sm">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Quick Connect
              </h2>
              <p className="text-[11px] text-tx-muted">
                Instantly connect using standardized development templates:
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => handleQuickConnectDriver('postgres')}
                  className="w-full p-2.5 rounded-lg bg-bg-base hover:bg-bg-overlay border border-border-subtle hover:border-border-default flex items-center justify-between text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold font-mono">
                      PG
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">
                        PostgreSQL
                      </div>
                      <div className="text-[10px] text-tx-muted">localhost:5432</div>
                    </div>
                  </div>
                  <Play className="w-3 h-3 text-tx-muted group-hover:text-blue-400 fill-current" />
                </button>

                <button
                  onClick={() => handleQuickConnectDriver('mysql')}
                  className="w-full p-2.5 rounded-lg bg-bg-base hover:bg-bg-overlay border border-border-subtle hover:border-border-default flex items-center justify-between text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-bold font-mono">
                      MY
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-amber-400 transition-colors">
                        MySQL
                      </div>
                      <div className="text-[10px] text-tx-muted">localhost:3306</div>
                    </div>
                  </div>
                  <Play className="w-3 h-3 text-tx-muted group-hover:text-amber-400 fill-current" />
                </button>

                <button
                  onClick={() => handleQuickConnectDriver('sqlite')}
                  className="w-full p-2.5 rounded-lg bg-bg-base hover:bg-bg-overlay border border-border-subtle hover:border-border-default flex items-center justify-between text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-bold font-mono">
                      SQL
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
                        SQLite
                      </div>
                      <div className="text-[10px] text-tx-muted">sqlx_dev.sqlite</div>
                    </div>
                  </div>
                  <Play className="w-3 h-3 text-tx-muted group-hover:text-emerald-400 fill-current" />
                </button>
              </div>
            </div>

            {/* Connection String URI Box */}
            <div className="p-4 rounded-xl bg-bg-surface border border-border-subtle space-y-3 shadow-sm">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Connection String
              </h2>
              <p className="text-[11px] text-tx-muted">
                Connect directly via database connection URI:
              </p>

              <div className="space-y-2">
                <input
                  type="text"
                  value={connectionString}
                  onChange={(e) => setConnectionString(e.target.value)}
                  placeholder="postgresql://user:pass@host:5432/db"
                  className="w-full px-3 py-2 rounded-lg bg-bg-base border border-border-subtle text-xs font-mono text-white placeholder-tx-muted focus:outline-none focus:border-blue-500 transition-colors"
                />

                <button
                  onClick={handleParseAndConnectUri}
                  disabled={!connectionString.trim() || quickConnectLoading === 'uri'}
                  className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  {quickConnectLoading === 'uri' ? 'Connecting...' : 'Connect from URI'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
