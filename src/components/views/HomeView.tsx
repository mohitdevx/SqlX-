import { testConnection } from '@/services/tauriBridge';
import { useConnectionStore } from '@/stores/connectionStore';
import type { ConnectionConfig, DatabaseDriver } from '@/types/database';
import { Check, Eye, EyeOff, RefreshCw } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

const COLOR_SWATCHES = [
  { name: 'Blue', value: '#3b82f6', bg: 'bg-blue-500' },
  { name: 'Emerald', value: '#10b981', bg: 'bg-emerald-500' },
  { name: 'Amber', value: '#f59e0b', bg: 'bg-amber-500' },
  { name: 'Purple', value: '#8b5cf6', bg: 'bg-purple-500' },
  { name: 'Rose', value: '#f43f5e', bg: 'bg-rose-500' },
  { name: 'Cyan', value: '#06b6d4', bg: 'bg-cyan-500' },
  { name: 'Orange', value: '#f97316', bg: 'bg-orange-500' },
];

const DRIVERS: { id: DatabaseDriver; label: string; defaultPort: number }[] = [
  { id: 'postgres', label: 'PostgreSQL', defaultPort: 5432 },
  { id: 'mysql', label: 'MySQL', defaultPort: 3306 },
  { id: 'sqlite', label: 'SQLite', defaultPort: 0 },
];

interface HomeViewProps {
  onNavigate: (view: 'query' | 'connections' | 'history' | 'saved-queries' | 'extensions') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const { connect, addConnection, isLoading: isConnecting } = useConnectionStore();

  const [driver, setDriver] = useState<DatabaseDriver>('postgres');
  const [name, setName] = useState('Local Database');
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState<number>(5432);
  const [database, setDatabase] = useState('postgres');
  const [username, setUsername] = useState('postgres');
  const [password, setPassword] = useState('');
  const [filePath, setFilePath] = useState('app.sqlite');
  const [ssl, setSsl] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>('#3b82f6');
  const [environment, setEnvironment] = useState<'development' | 'staging' | 'production'>(
    'development'
  );
  const [showPassword, setShowPassword] = useState(false);

  const [testStatus, setTestStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({
    loading: false,
  });

  const handleDriverChange = (newDriver: DatabaseDriver) => {
    setDriver(newDriver);
    if (newDriver === 'postgres') {
      setPort(5432);
      if (!name || name.includes('MySQL') || name.includes('SQLite')) setName('PostgreSQL');
      if (!database) setDatabase('postgres');
    } else if (newDriver === 'mysql') {
      setPort(3306);
      if (!name || name.includes('PostgreSQL') || name.includes('SQLite')) setName('MySQL');
      if (!database) setDatabase('mysql');
      if (!username || username === 'postgres') setUsername('root');
    } else if (newDriver === 'sqlite') {
      if (!name || name.includes('PostgreSQL') || name.includes('MySQL')) setName('SQLite');
      if (!filePath) setFilePath('data.sqlite');
    }
    setTestStatus({ loading: false });
  };

  const getActiveConfig = (): ConnectionConfig => {
    const id = `conn-${Date.now()}`;
    if (driver === 'sqlite') {
      return {
        id,
        name: name.trim() || 'SQLite Database',
        driver: 'sqlite',
        filePath: filePath.trim() || 'data.sqlite',
        color: selectedColor,
        environment,
      };
    }
    return {
      id,
      name: name.trim() || `${driver.toUpperCase()} Database`,
      driver,
      host: host.trim() || 'localhost',
      port: Number(port) || (driver === 'postgres' ? 5432 : 3306),
      database: database.trim() || (driver === 'postgres' ? 'postgres' : 'mysql'),
      username: username.trim(),
      password,
      ssl,
      color: selectedColor,
      environment,
    };
  };

  const handleTest = async () => {
    const config = getActiveConfig();
    setTestStatus({ loading: true });

    try {
      const ok = await testConnection(config);
      if (ok) {
        setTestStatus({
          loading: false,
          success: true,
          message: 'Connection successful',
        });
      } else {
        setTestStatus({
          loading: false,
          success: false,
          message: 'Connection failed: verify host, port, and credentials',
        });
      }
    } catch (err: unknown) {
      setTestStatus({
        loading: false,
        success: false,
        message: String(err) || 'Connection error',
      });
    }
  };

  const handleConnect = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const config = getActiveConfig();
    const success = await connect(config);
    if (success) {
      onNavigate('query');
    } else {
      setTestStatus({
        loading: false,
        success: false,
        message: 'Could not connect. Please check connection parameters.',
      });
    }
  };

  const handleSave = () => {
    const config = getActiveConfig();
    addConnection(config);
    setTestStatus({
      loading: false,
      success: true,
      message: 'Saved to connections list',
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-bg-base text-tx-primary font-sans select-none px-8 py-10 md:px-16 custom-scrollbar">
      <div className="max-w-2xl w-full mx-auto space-y-8">
        {/* Page Header */}
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight text-tx-primary">New Connection</h1>
          <p className="text-xs text-tx-muted">
            Configure your database credentials to connect and explore.
          </p>
        </div>

        {/* Engine Tabs (Classy, borderless segmented switch) */}
        <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-bg-surface w-fit">
          {DRIVERS.map((d) => {
            const isSelected = driver === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => handleDriverChange(d.id)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-bg-elevated text-tx-primary shadow-xs'
                    : 'text-tx-muted hover:text-tx-secondary'
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>

        {/* Clean, Frameless Form Sections */}
        <div className="space-y-6">
          {/* General Fields */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-tx-muted uppercase tracking-wider block">
                Connection Name
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Production Database"
                  className="flex-1 px-3 py-1.5 text-xs rounded-md bg-bg-surface border border-border-subtle focus:border-accent-primary text-tx-primary placeholder:text-tx-muted/60 focus:outline-none transition-colors"
                />

                {/* Inline Color Dots (Clean, non-interfering) */}
                <div className="flex items-center gap-2 shrink-0">
                  {COLOR_SWATCHES.map((c) => {
                    const isSelected = selectedColor === c.value;
                    return (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setSelectedColor(c.value)}
                        className={`w-5 h-5 rounded-full ${c.bg} flex items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'opacity-100 shadow-sm'
                            : 'opacity-40 hover:opacity-80 hover:scale-105'
                        }`}
                        title={c.name}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white stroke-[2.5]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Environment Toggle */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-tx-muted uppercase tracking-wider block">
                Environment
              </label>
              <div className="flex items-center space-x-1">
                {(['development', 'staging', 'production'] as const).map((env) => (
                  <button
                    key={env}
                    type="button"
                    onClick={() => setEnvironment(env)}
                    className={`px-3 py-1 text-[11px] font-mono capitalize rounded-md transition-colors cursor-pointer ${
                      environment === env
                        ? 'bg-bg-elevated text-tx-primary font-medium'
                        : 'text-tx-muted hover:text-tx-secondary'
                    }`}
                  >
                    {env}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-border-subtle/50 my-2" />

          {/* Database Parameters */}
          {driver === 'sqlite' ? (
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-tx-muted uppercase tracking-wider block">
                File Path
              </label>
              <input
                type="text"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                placeholder="path/to/database.sqlite"
                className="w-full px-3 py-1.5 text-xs font-mono rounded-md bg-bg-surface border border-border-subtle focus:border-accent-primary text-tx-primary placeholder:text-tx-muted/60 focus:outline-none transition-colors"
              />
              <span className="text-[11px] text-tx-muted">
                File will be created automatically if it does not exist.
              </span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[11px] font-medium text-tx-muted uppercase tracking-wider block">
                    Host
                  </label>
                  <input
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder="localhost or host IP"
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-md bg-bg-surface border border-border-subtle focus:border-accent-primary text-tx-primary placeholder:text-tx-muted/60 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-tx-muted uppercase tracking-wider block">
                    Port
                  </label>
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-md bg-bg-surface border border-border-subtle focus:border-accent-primary text-tx-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-tx-muted uppercase tracking-wider block">
                    Database
                  </label>
                  <input
                    type="text"
                    value={database}
                    onChange={(e) => setDatabase(e.target.value)}
                    placeholder={driver === 'postgres' ? 'postgres' : 'mysql'}
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-md bg-bg-surface border border-border-subtle focus:border-accent-primary text-tx-primary placeholder:text-tx-muted/60 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-tx-muted uppercase tracking-wider block">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={driver === 'postgres' ? 'postgres' : 'root'}
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-md bg-bg-surface border border-border-subtle focus:border-accent-primary text-tx-primary placeholder:text-tx-muted/60 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-tx-muted uppercase tracking-wider block">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-3 pr-8 py-1.5 text-xs font-mono rounded-md bg-bg-surface border border-border-subtle focus:border-accent-primary text-tx-primary placeholder:text-tx-muted/60 focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-tx-muted hover:text-tx-primary cursor-pointer p-0.5"
                    >
                      {showPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* SSL Switch */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-tx-secondary">Enable SSL / TLS encryption</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ssl}
                    onChange={(e) => setSsl(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-bg-elevated peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-accent-primary" />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Minimal Feedback Line */}
        {testStatus.message && (
          <div
            className={`text-xs flex items-center space-x-2 font-mono ${
              testStatus.success ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            <span>{testStatus.success ? '✓' : '✗'}</span>
            <span>{testStatus.message}</span>
          </div>
        )}

        {/* Clean Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border-subtle/50">
          <button
            type="button"
            onClick={handleTest}
            disabled={testStatus.loading || isConnecting}
            className="px-3.5 py-1.5 rounded-md text-xs font-medium text-tx-secondary hover:text-tx-primary hover:bg-bg-surface transition-colors flex items-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {testStatus.loading && <RefreshCw className="w-3 h-3 animate-spin" />}
            <span>Test Connection</span>
          </button>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={handleSave}
              className="px-3.5 py-1.5 rounded-md text-xs font-medium text-tx-secondary hover:text-tx-primary hover:bg-bg-surface transition-colors cursor-pointer"
            >
              Save Profile
            </button>

            <button
              type="button"
              onClick={handleConnect}
              disabled={isConnecting}
              className="px-4 py-1.5 rounded-md bg-accent-primary hover:bg-accent-primary-hover text-accent-text text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <span>Connect</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
