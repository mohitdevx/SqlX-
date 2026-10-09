import { testConnection } from '@/services/tauriBridge';
import { useConnectionStore } from '@/stores/connectionStore';
import type { ConnectionConfig, DatabaseDriver } from '@/types/database';
import { AlertCircle, ArrowRight, Check, Database, Server, Shield, X } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectionModal: React.FC<ConnectionModalProps> = ({ isOpen, onClose }) => {
  const { addConnection, connect, isLoading } = useConnectionStore();

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

  if (!isOpen) return null;

  const handleDriverChange = (newDriver: DatabaseDriver) => {
    setDriver(newDriver);
    if (newDriver === 'postgres') {
      setPort(5432);
      setName('PostgreSQL Database');
      if (!database) setDatabase('postgres');
    } else if (newDriver === 'mysql') {
      setPort(3306);
      setName('MySQL Database');
      if (!database) setDatabase('mysql');
    } else if (newDriver === 'sqlite') {
      setName('Local SQLite File');
      setFilePath('dev.sqlite');
    }
  };

  const currentConfig: ConnectionConfig = {
    id: `conn-${Date.now()}`,
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
        setTestStatus({
          loading: false,
          success: false,
          message: 'Failed to establish connection.',
        });
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
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div className="bg-bg-surface border border-border-default rounded-xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden text-tx-primary font-sans">
        {/* Header */}
        <div className="h-14 px-5 border-b border-border-subtle flex items-center justify-between bg-bg-surface">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-bg-elevated border border-border-default flex items-center justify-center text-white">
              <Server className="w-4 h-4 text-white/80" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-tight text-white">Connect Database</h2>
              <p className="text-[11px] text-tx-muted">Add a new database connection profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-bg-overlay rounded-md text-tx-muted hover:text-white transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Driver Segmented Buttons */}
          <div>
            <span className="block text-[11px] font-semibold text-tx-muted uppercase tracking-wider mb-2">
              Database Engine
            </span>
            <div className="grid grid-cols-3 gap-2 bg-bg-base p-1 rounded-lg border border-border-subtle">
              {(['postgres', 'mysql', 'sqlite'] as DatabaseDriver[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDriverChange(d)}
                  className={`py-2 px-3 text-xs font-semibold rounded-md transition-all flex items-center justify-center space-x-1.5 ${
                    driver === d
                      ? 'bg-bg-elevated text-white shadow-sm border border-border-default'
                      : 'text-tx-secondary hover:text-white hover:bg-bg-overlay'
                  }`}
                >
                  <Database className="w-3.5 h-3.5 text-white/80" strokeWidth={1.5} />
                  <span className="uppercase">{d}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Name & Environment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="block text-[11px] font-medium text-tx-secondary mb-1">
                Profile Name
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-bg-base border border-border-subtle rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-border-strong font-mono transition-colors"
              />
            </div>
            <div>
              <span className="block text-[11px] font-medium text-tx-secondary mb-1">
                Environment Tag
              </span>
              <select
                value={environment}
                onChange={(e) =>
                  setEnvironment(e.target.value as 'development' | 'staging' | 'production')
                }
                className="w-full bg-bg-base border border-border-subtle rounded-md px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-border-strong font-sans transition-colors"
              >
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </select>
            </div>
          </div>

          {driver === 'sqlite' ? (
            <div>
              <span className="block text-[11px] font-medium text-tx-secondary mb-1">
                SQLite File Path
              </span>
              <input
                type="text"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                placeholder="dev.sqlite or /path/to/database.db"
                className="w-full bg-bg-base border border-border-subtle rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-border-strong font-mono transition-colors"
              />
            </div>
          ) : (
            <>
              {/* Host & Port */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <span className="block text-[11px] font-medium text-tx-secondary mb-1">Host</span>
                  <input
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    className="w-full bg-bg-base border border-border-subtle rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-border-strong font-mono transition-colors"
                  />
                </div>
                <div>
                  <span className="block text-[11px] font-medium text-tx-secondary mb-1">Port</span>
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(Number(e.target.value))}
                    className="w-full bg-bg-base border border-border-subtle rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-border-strong font-mono transition-colors"
                  />
                </div>
              </div>

              {/* Database */}
              <div>
                <span className="block text-[11px] font-medium text-tx-secondary mb-1">
                  Database Name
                </span>
                <input
                  type="text"
                  value={database}
                  onChange={(e) => setDatabase(e.target.value)}
                  className="w-full bg-bg-base border border-border-subtle rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-border-strong font-mono transition-colors"
                />
              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-[11px] font-medium text-tx-secondary mb-1">User</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-bg-base border border-border-subtle rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-border-strong font-mono transition-colors"
                  />
                </div>
                <div>
                  <span className="block text-[11px] font-medium text-tx-secondary mb-1">
                    Password
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-bg-base border border-border-subtle rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-border-strong font-mono transition-colors"
                  />
                </div>
              </div>

              {/* SSL */}
              <div className="flex items-center space-x-2 pt-1">
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
                  <Shield className="w-3.5 h-3.5 text-white/80" strokeWidth={1.5} />
                  <span>Enforce SSL / TLS Encryption</span>
                </label>
              </div>
            </>
          )}

          {/* Test Status Banner */}
          {testStatus.message && (
            <div
              className={`p-3 rounded-md text-xs flex items-center space-x-2 font-mono ${
                testStatus.success
                  ? 'bg-status-success/10 text-status-success border border-status-success/30'
                  : 'bg-status-error/10 text-status-error border border-status-error/30'
              }`}
            >
              {testStatus.success ? (
                <Check className="w-4 h-4 flex-shrink-0 text-status-success" strokeWidth={1.5} />
              ) : (
                <AlertCircle
                  className="w-4 h-4 flex-shrink-0 text-status-error"
                  strokeWidth={1.5}
                />
              )}
              <span className="truncate">{testStatus.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-14 px-5 border-t border-border-subtle bg-bg-surface flex items-center justify-between">
          <button
            type="button"
            onClick={handleTest}
            disabled={testStatus.loading}
            className="px-3 py-1.5 text-xs font-semibold rounded-md bg-bg-base border border-border-subtle text-tx-secondary hover:text-white hover:bg-bg-overlay transition-colors disabled:opacity-40"
          >
            {testStatus.loading ? 'Testing...' : 'Test Connection'}
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium rounded-md text-tx-muted hover:text-white hover:bg-bg-overlay transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAndConnect}
              disabled={isLoading}
              className="px-4 py-1.5 text-xs font-semibold rounded-md bg-white text-black hover:bg-white/90 active:bg-white/80 transition-all flex items-center space-x-1.5 shadow-sm disabled:opacity-40"
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
