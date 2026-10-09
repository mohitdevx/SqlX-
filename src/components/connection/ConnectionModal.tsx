import { testConnection } from '@/services/tauriBridge';
import { useConnectionStore } from '@/stores/connectionStore';
import type { ConnectionConfig, DatabaseDriver } from '@/types/database';
import {
  AlertCircle,
  ArrowRight,
  Check,
  Database,
  Plus,
  Server,
  Shield,
  Trash2,
  X,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectionModal: React.FC<ConnectionModalProps> = ({ isOpen, onClose }) => {
  const { connections, activeConnectionId, addConnection, removeConnection, connect, isLoading } =
    useConnectionStore();

  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  const [driver, setDriver] = useState<DatabaseDriver>('postgres');
  const [name, setName] = useState('Local PostgreSQL');
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState<number>(5432);
  const [database, setDatabase] = useState('postgres');
  const [username, setUsername] = useState('postgres');
  const [password, setPassword] = useState('');
  const [filePath, setFilePath] = useState('');
  const [ssl, setSsl] = useState(false);
  const [environment, setEnvironment] = useState<'development' | 'staging' | 'production'>(
    'development'
  );

  const [testStatus, setTestStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({
    loading: false,
  });

  // Load active connection or first connection on open
  useEffect(() => {
    if (isOpen) {
      const targetId = activeConnectionId || (connections.length > 0 ? connections[0]?.id : null);
      if (targetId) {
        loadProfile(targetId);
      }
    }
  }, [isOpen, activeConnectionId, connections]);

  const loadProfile = (id: string) => {
    const profile = connections.find((c) => c.id === id);
    if (profile) {
      setSelectedProfileId(profile.id);
      setDriver(profile.driver);
      setName(profile.name);
      setHost(profile.host || 'localhost');
      setPort(profile.port || (profile.driver === 'postgres' ? 5432 : 3306));
      setDatabase(profile.database || '');
      setUsername(profile.username || '');
      setPassword(profile.password || '');
      setFilePath(profile.filePath || '');
      setSsl(profile.ssl || false);
      setEnvironment(profile.environment || 'development');
      setTestStatus({ loading: false });
    }
  };

  const handleNewProfile = () => {
    setSelectedProfileId(null);
    setDriver('postgres');
    setName('New PostgreSQL Connection');
    setHost('localhost');
    setPort(5432);
    setDatabase('postgres');
    setUsername('postgres');
    setPassword('');
    setFilePath('');
    setSsl(false);
    setEnvironment('development');
    setTestStatus({ loading: false });
  };

  if (!isOpen) return null;

  const handleDriverChange = (newDriver: DatabaseDriver) => {
    setDriver(newDriver);
    if (newDriver === 'postgres') {
      setPort(5432);
      if (!name || name.includes('Connection')) setName('PostgreSQL Connection');
      if (!database) setDatabase('postgres');
    } else if (newDriver === 'mysql') {
      setPort(3306);
      if (!name || name.includes('Connection')) setName('MySQL Connection');
      if (!database) setDatabase('mysql');
    } else if (newDriver === 'sqlite') {
      if (!name || name.includes('Connection')) setName('Local SQLite');
      setFilePath('dev.sqlite');
    }
  };

  const currentConfig: ConnectionConfig = {
    id: selectedProfileId || `conn-${Date.now()}`,
    name,
    driver,
    host: driver !== 'sqlite' ? host : undefined,
    port: driver !== 'sqlite' ? port : undefined,
    database: driver !== 'sqlite' ? database : undefined,
    username: driver !== 'sqlite' ? username : undefined,
    password: driver !== 'sqlite' ? password : undefined,
    filePath: driver === 'sqlite' ? filePath : undefined,
    ssl,
    environment,
  };

  const handleTest = async () => {
    setTestStatus({ loading: true });
    try {
      const ok = await testConnection(currentConfig);
      if (ok) {
        setTestStatus({
          loading: false,
          success: true,
          message: 'Connection verified successfully!',
        });
      } else {
        setTestStatus({ loading: false, success: false, message: 'Failed to connect.' });
      }
    } catch (err) {
      setTestStatus({ loading: false, success: false, message: String(err) });
    }
  };

  const handleSaveAndConnect = async () => {
    addConnection(currentConfig);
    const success = await connect(currentConfig);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-bg-surface border border-border-default rounded-xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden text-tx-primary font-sans">
        {/* Header */}
        <div className="h-12 px-5 border-b border-border-subtle flex items-center justify-between bg-bg-surface">
          <div className="flex items-center space-x-2.5">
            <Server className="w-4 h-4 text-white/80" strokeWidth={1.5} />
            <h2 className="font-bold text-xs tracking-tight text-white uppercase">
              Saved Database Profiles
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-bg-overlay rounded text-tx-muted hover:text-white transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Modal Main: Saved Profiles Sidebar + Form */}
        <div className="flex flex-1 overflow-hidden min-h-[380px]">
          {/* Saved Profiles Left List */}
          <div className="w-48 bg-bg-base border-r border-border-subtle flex flex-col p-2 space-y-1 select-none">
            <div className="flex items-center justify-between px-2 py-1 text-[10px] uppercase font-bold text-tx-muted">
              <span>Profiles ({connections.length})</span>
              <button
                onClick={handleNewProfile}
                className="p-0.5 hover:text-white text-tx-muted transition-colors rounded hover:bg-bg-overlay"
                title="Create New Profile"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-0.5">
              {connections.map((c) => {
                const isSelected = selectedProfileId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => loadProfile(c.id)}
                    className={`group flex items-center justify-between px-2 py-1.5 rounded cursor-pointer text-xs font-mono transition-colors ${
                      isSelected
                        ? 'bg-bg-elevated text-white border border-border-default font-semibold'
                        : 'text-tx-secondary hover:text-white hover:bg-bg-overlay'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 truncate flex-1">
                      <Database className="w-3 h-3 text-white/60 flex-shrink-0" strokeWidth={1.5} />
                      <span className="truncate text-[11px]">{c.name}</span>
                    </div>
                    {connections.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeConnection(c.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-status-error text-tx-muted transition-opacity"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Body */}
          <div className="flex-1 p-5 space-y-3.5 overflow-y-auto bg-bg-surface">
            {/* Driver Buttons */}
            <div>
              <span className="block text-[10px] font-semibold text-tx-muted uppercase tracking-wider mb-1.5">
                Engine
              </span>
              <div className="grid grid-cols-3 gap-1.5 bg-bg-base p-1 rounded-lg border border-border-subtle">
                {(['postgres', 'mysql', 'sqlite'] as DatabaseDriver[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleDriverChange(d)}
                    className={`py-1.5 px-2 text-xs font-semibold rounded transition-all flex items-center justify-center space-x-1.5 ${
                      driver === d
                        ? 'bg-bg-elevated text-white shadow-sm border border-border-default'
                        : 'text-tx-secondary hover:text-white hover:bg-bg-overlay'
                    }`}
                  >
                    <Database className="w-3 h-3 text-white/70" strokeWidth={1.5} />
                    <span className="uppercase text-[11px]">{d}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Name & Environment */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <span className="block text-[10px] font-medium text-tx-secondary mb-1">
                  Profile Name
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-bg-base border border-border-subtle rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-border-strong font-mono transition-colors"
                />
              </div>
              <div>
                <span className="block text-[10px] font-medium text-tx-secondary mb-1">
                  Environment Tag
                </span>
                <select
                  value={environment}
                  onChange={(e) =>
                    setEnvironment(e.target.value as 'development' | 'staging' | 'production')
                  }
                  className="w-full bg-bg-base border border-border-subtle rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-border-strong font-sans transition-colors"
                >
                  <option value="development">Development</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                </select>
              </div>
            </div>

            {driver === 'sqlite' ? (
              <div>
                <span className="block text-[10px] font-medium text-tx-secondary mb-1">
                  SQLite File Path
                </span>
                <input
                  type="text"
                  value={filePath}
                  onChange={(e) => setFilePath(e.target.value)}
                  placeholder="sqlx_dev.sqlite or /path/to/database.db"
                  className="w-full bg-bg-base border border-border-subtle rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-border-strong font-mono transition-colors"
                />
              </div>
            ) : (
              <>
                {/* Host & Port */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="col-span-2">
                    <span className="block text-[10px] font-medium text-tx-secondary mb-1">
                      Host
                    </span>
                    <input
                      type="text"
                      value={host}
                      onChange={(e) => setHost(e.target.value)}
                      className="w-full bg-bg-base border border-border-subtle rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-border-strong font-mono transition-colors"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] font-medium text-tx-secondary mb-1">
                      Port
                    </span>
                    <input
                      type="number"
                      value={port}
                      onChange={(e) => setPort(Number(e.target.value))}
                      className="w-full bg-bg-base border border-border-subtle rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-border-strong font-mono transition-colors"
                    />
                  </div>
                </div>

                {/* Database */}
                <div>
                  <span className="block text-[10px] font-medium text-tx-secondary mb-1">
                    Database Name
                  </span>
                  <input
                    type="text"
                    value={database}
                    onChange={(e) => setDatabase(e.target.value)}
                    className="w-full bg-bg-base border border-border-subtle rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-border-strong font-mono transition-colors"
                  />
                </div>

                {/* User & Password */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <span className="block text-[10px] font-medium text-tx-secondary mb-1">
                      User
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-bg-base border border-border-subtle rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-border-strong font-mono transition-colors"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] font-medium text-tx-secondary mb-1">
                      Password
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-bg-base border border-border-subtle rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-border-strong font-mono transition-colors"
                    />
                  </div>
                </div>

                {/* SSL */}
                <div className="flex items-center space-x-2 pt-0.5">
                  <input
                    type="checkbox"
                    id="ssl-check"
                    checked={ssl}
                    onChange={(e) => setSsl(e.target.checked)}
                    className="rounded border-border-subtle text-white focus:ring-0 cursor-pointer"
                  />
                  <label
                    htmlFor="ssl-check"
                    className="text-xs text-tx-secondary flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Shield className="w-3 h-3 text-white/70" strokeWidth={1.5} />
                    <span className="text-[11px]">Require SSL/TLS</span>
                  </label>
                </div>
              </>
            )}

            {/* Test Status Feedback */}
            {testStatus.message && (
              <div
                className={`p-2 rounded text-xs flex items-center space-x-2 font-mono ${
                  testStatus.success
                    ? 'bg-status-success/10 text-status-success border border-status-success/30'
                    : 'bg-status-error/10 text-status-error border border-status-error/30'
                }`}
              >
                {testStatus.success ? (
                  <Check
                    className="w-3.5 h-3.5 flex-shrink-0 text-status-success"
                    strokeWidth={1.5}
                  />
                ) : (
                  <AlertCircle
                    className="w-3.5 h-3.5 flex-shrink-0 text-status-error"
                    strokeWidth={1.5}
                  />
                )}
                <span className="truncate text-[11px]">{testStatus.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="h-12 px-5 border-t border-border-subtle bg-bg-surface flex items-center justify-between">
          <button
            type="button"
            onClick={handleTest}
            disabled={testStatus.loading}
            className="px-3 py-1 text-xs font-semibold rounded bg-bg-base border border-border-subtle text-tx-secondary hover:text-white hover:bg-bg-overlay transition-colors disabled:opacity-40"
          >
            {testStatus.loading ? 'Testing...' : 'Test Connection'}
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 text-xs font-medium rounded text-tx-muted hover:text-white hover:bg-bg-overlay transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAndConnect}
              disabled={isLoading}
              className="px-4 py-1 text-xs font-semibold rounded bg-white text-black hover:bg-white/90 active:bg-white/80 transition-all flex items-center space-x-1.5 shadow-sm disabled:opacity-40"
            >
              <span>{isLoading ? 'Connecting...' : 'Save & Connect'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-black" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
