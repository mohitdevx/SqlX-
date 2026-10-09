import { useConnectionStore } from '@/stores/connectionStore';
import { useQueryStore } from '@/stores/queryStore';
import { ChevronDown, Command, Database, Play, Settings } from 'lucide-react';
import type React from 'react';

interface TitleBarProps {
  onOpenNewConnection: () => void;
  onOpenCommandPalette: () => void;
  onOpenThemeManager: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  onOpenNewConnection,
  onOpenCommandPalette,
  onOpenThemeManager,
}) => {
  const { runActiveQuery, tabs, activeTabId } = useQueryStore();
  const { activeConnectionId, connections } = useConnectionStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const currentConn = connections.find((c) => c.id === activeConnectionId);

  return (
    <header className="h-11 bg-bg-surface border-b border-border-subtle flex items-center justify-between px-3.5 select-none z-20">
      {/* Left: Brand + Connection Status Pill */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-accent-primary text-accent-text font-black text-xs shadow-sm">
            S
          </div>
          <span className="font-bold text-xs tracking-tight text-tx-primary">SqlX</span>
        </div>

        <div className="h-4 w-[1px] bg-border-subtle" />

        {/* Connection Switcher Pill */}
        {currentConn ? (
          <button
            onClick={onOpenNewConnection}
            className="flex items-center space-x-2 px-2.5 py-1 rounded-md bg-bg-overlay hover:bg-bg-elevated border border-border-subtle hover:border-border-default text-xs transition-all group"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                currentConn.environment === 'production'
                  ? 'bg-status-error ring-2 ring-status-error/20'
                  : currentConn.environment === 'staging'
                    ? 'bg-status-warning ring-2 ring-status-warning/20'
                    : 'bg-status-success ring-2 ring-status-success/20'
              }`}
            />
            <span className="text-tx-primary font-medium tracking-tight group-hover:text-white">
              {currentConn.name}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-bg-base text-tx-muted uppercase">
              {currentConn.driver}
            </span>
            <ChevronDown className="w-3 h-3 text-tx-muted group-hover:text-tx-secondary" />
          </button>
        ) : (
          <button
            onClick={onOpenNewConnection}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-accent-primary/10 hover:bg-accent-primary/20 border border-accent-primary/30 text-accent-primary text-xs font-medium transition-all"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Connect Database</span>
          </button>
        )}
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="flex items-center">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-bg-base hover:bg-bg-overlay border border-border-subtle hover:border-border-default text-xs text-tx-muted hover:text-tx-primary transition-all w-64 justify-between"
        >
          <div className="flex items-center space-x-2">
            <Command className="w-3.5 h-3.5 text-tx-muted" />
            <span className="font-mono text-[11px]">Quick Search / Actions...</span>
          </div>
          <kbd className="text-[10px] font-mono bg-bg-surface px-1.5 py-0.5 rounded border border-border-subtle text-tx-secondary">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right: Primary Run Query & Settings */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => {
            if (activeConnectionId) {
              runActiveQuery(activeConnectionId);
            }
          }}
          disabled={!activeConnectionId || activeTab?.isRunning}
          className="flex items-center space-x-2 px-3 py-1 rounded-md bg-accent-primary hover:bg-accent-hover active:bg-accent-active text-accent-text text-xs font-semibold shadow-sm transition-all disabled:opacity-40 disabled:pointer-events-none"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{activeTab?.isRunning ? 'Running...' : 'Execute'}</span>
          <kbd className="text-[10px] font-mono bg-black/20 px-1.5 py-0.5 rounded text-white/80">
            F5
          </kbd>
        </button>

        <div className="h-4 w-[1px] bg-border-subtle mx-1" />

        <button
          onClick={onOpenThemeManager}
          className="p-1.5 rounded-md text-tx-secondary hover:text-tx-primary hover:bg-bg-overlay transition-colors"
          title="Theme & Appearance"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
