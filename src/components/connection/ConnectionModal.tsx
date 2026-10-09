import { testConnection } from '@/services/tauriBridge';
import { useConnectionStore } from '@/stores/connectionStore';
import type { ConnectionConfig, DatabaseDriver } from '@/types/database';
import { AlertCircle, Check, Database, Server, Shield, X } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectionModal: React.FC<ConnectionModalProps> = ({ isOpen, onClose }) => {
  const { addConnection, connect, isLoading } = useConnectionStore();

  const [driver, setDriver] = useState<DatabaseDriver>('postgres');
  const [name, setName] = useState('Local Postgres');
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
      setName('PostgreSQL Connection');
      if (!database) setDatabase('postgres');
    } else if (newDriver === 'mysql') {
      setPort(3306);
      setName('MySQL Connection');
      if (!database) setDatabase('mysql');
    } else if (newDriver === 'sqlite') {
      setName('SQLite Database');
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
        setTestStatus({ loading: false, success: true, message: 'Connection successful!' });
      } else {
        setTestStatus({ loading: false, success: false, message: 'Connection failed.' });
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
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-bg-surface border border-border-default rounded-lg w-full max-w-lg shadow-2xl flex flex-col overflow-hidden text-tx-primary font-sans">
        {/* Header */}
        <div className="h-12 px-4 border-b border-border-subtle flex items-center justify-between bg-bg-surface">
          <div className="flex items-center space-x-2">
            <Server className="w-4 h-4 text-accent-primary" />
            <span className="font-semibold text-sm">New Database Connection</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-bg-overlay rounded text-tx-muted hover:text-tx-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Driver Selector */}
          <div>
            <label className="block text-xs font-semibold text-tx-secondary mb-1.5">
              DATABASE ENGINE
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['postgres', 'mysql', 'sqlite'] as DatabaseDriver[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDriverChange(d)}
                  className={`py-2 px-3 text-xs font-medium rounded border transition-colors flex items-center justify-center space-x-1.5 ${
                    driver === d
                      ? 'bg-accent-primary text-accent-text border-accent-primary'
                      : 'bg-bg-base text-tx-secondary border-border-subtle hover:bg-bg-overlay hover:text-tx-primary'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span className="uppercase">{d}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Connection Name & Environment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-tx-secondary mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-bg-base border border-border-subtle rounded px-2.5 py-1.5 text-xs text-tx-primary focus:outline-none focus:border-accent-primary font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-tx-secondary mb-1">
                Environment
              </label>
              <select
                value={environment}
                onChange={(e) =>
                  setEnvironment(e.target.value as 'development' | 'staging' | 'production')
                }
                className="w-full bg-bg-base border border-border-subtle rounded px-2 py-1.5 text-xs text-tx-primary focus:outline-none focus:border-accent-primary"
              >
                <option value="development">Development (Green)</option>
                <option value="staging">Staging (Orange)</option>
                <option value="production">Production (Red ⚠️)</option>
              </select>
            </div>
          </div>

          {driver === 'sqlite' ? (
            <div>
              <label className="block text-xs font-semibold text-tx-secondary mb-1">
                SQLite File Path
              </label>
              <input
                type="text"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                placeholder="/path/to/database.db"
                className="w-full bg-bg-base border border-border-subtle rounded px-2.5 py-1.5 text-xs text-tx-primary focus:outline-none focus:border-accent-primary font-mono"
              />
            </div>
          ) : (
            <>
              {/* Host & Port */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-tx-secondary mb-1">
                    Host / Server Address
                  </label>
                  <input
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    className="w-full bg-bg-base border border-border-subtle rounded px-2.5 py-1.5 text-xs text-tx-primary focus:outline-none focus:border-accent-primary font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-tx-secondary mb-1">Port</label>
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(Number(e.target.value))}
                    className="w-full bg-bg-base border border-border-subtle rounded px-2.5 py-1.5 text-xs text-tx-primary focus:outline-none focus:border-accent-primary font-mono"
                  />
                </div>
              </div>

              {/* Database Name */}
              <div>
                <label className="block text-xs font-semibold text-tx-secondary mb-1">
                  Database
                </label>
                <input
                  type="text"
                  value={database}
                  onChange={(e) => setDatabase(e.target.value)}
                  className="w-full bg-bg-base border border-border-subtle rounded px-2.5 py-1.5 text-xs text-tx-primary focus:outline-none focus:border-accent-primary font-mono"
                />
              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-tx-secondary mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-bg-base border border-border-subtle rounded px-2.5 py-1.5 text-xs text-tx-primary focus:outline-none focus:border-accent-primary font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-tx-secondary mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-bg-base border border-border-subtle rounded px-2.5 py-1.5 text-xs text-tx-primary focus:outline-none focus:border-accent-primary font-mono"
                  />
                </div>
              </div>

              {/* SSL Checkbox */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="ssl-toggle"
                  checked={ssl}
                  onChange={(e) => setSsl(e.target.checked)}
                  className="rounded border-border-subtle text-accent-primary focus:ring-0"
                />
                <label
                  htmlFor="ssl-toggle"
                  className="text-xs text-tx-secondary flex items-center space-x-1 cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-tx-muted" />
                  <span>Require SSL/TLS encrypted connection</span>
                </label>
              </div>
            </>
          )}

          {/* Test Status Alert */}
          {testStatus.message && (
            <div
              className={`p-2.5 rounded text-xs flex items-center space-x-2 font-mono ${
                testStatus.success
                  ? 'bg-status-success/10 text-status-success border border-status-success/30'
                  : 'bg-status-error/10 text-status-error border border-status-error/30'
              }`}
            >
              {testStatus.success ? (
                <Check className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span className="truncate">{testStatus.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-12 px-4 border-t border-border-subtle bg-bg-surface flex items-center justify-between">
          <button
            type="button"
            onClick={handleTest}
            disabled={testStatus.loading}
            className="px-3 py-1.5 text-xs font-medium rounded bg-bg-elevated border border-border-default text-tx-primary hover:bg-bg-overlay active:bg-bg-base disabled:opacity-40 transition-colors"
          >
            {testStatus.loading ? 'Testing...' : 'Test Connection'}
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium rounded text-tx-secondary hover:text-tx-primary hover:bg-bg-overlay transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAndConnect}
              disabled={isLoading}
              className="px-4 py-1.5 text-xs font-medium rounded bg-accent-primary text-accent-text hover:bg-accent-hover active:bg-accent-active disabled:opacity-40 transition-colors"
            >
              {isLoading ? 'Connecting...' : 'Connect & Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
