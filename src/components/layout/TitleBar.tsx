import { useConnectionStore } from '@/stores/connectionStore';
import { useQueryStore } from '@/stores/queryStore';
import { Command, Database, Play, Plus, Settings } from 'lucide-react';
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
    <header className="h-10 bg-bg-surface border-b border-border-subtle flex items-center justify-between px-3 select-none">
      {/* Brand & Connection Badge */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-6 h-6 rounded bg-accent-primary text-accent-text font-bold text-xs">
            SX
          </div>
          <span className="font-semibold text-xs tracking-wider text-tx-primary">SQLX</span>
        </div>

        <div className="h-4 w-[1px] bg-border-subtle" />

        {/* Active Connection Selector */}
        <div className="flex items-center space-x-2">
          {currentConn ? (
            <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-bg-elevated border border-border-subtle text-xs font-mono">
              <span
                className={`w-2 h-2 rounded-full ${
                  currentConn.environment === 'production'
                    ? 'bg-status-error'
                    : currentConn.environment === 'staging'
                      ? 'bg-status-warning'
                      : 'bg-status-success'
                }`}
              />
              <span className="text-tx-primary font-medium">{currentConn.name}</span>
              <span className="text-[10px] text-tx-muted uppercase">({currentConn.driver})</span>
            </div>
          ) : (
            <button
              onClick={onOpenNewConnection}
              className="flex items-center space-x-1 px-2 py-0.5 rounded bg-bg-elevated hover:bg-bg-overlay border border-border-subtle text-xs text-tx-secondary hover:text-tx-primary transition-colors font-mono"
            >
              <Database className="w-3.5 h-3.5 text-accent-primary" />
              <span>Connect Database</span>
            </button>
          )}

          <button
            onClick={onOpenNewConnection}
            className="p-1 hover:bg-bg-overlay rounded text-tx-muted hover:text-tx-primary transition-colors"
            title="New Database Connection"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Query Control Actions */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => {
            if (activeConnectionId) {
              runActiveQuery(activeConnectionId);
            }
          }}
          disabled={!activeConnectionId || activeTab?.isRunning}
          className="flex items-center space-x-1.5 px-3 py-1 text-xs font-medium rounded bg-accent-primary text-accent-text hover:bg-accent-hover active:bg-accent-active disabled:opacity-40 transition-colors shadow-sm"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{activeTab?.isRunning ? 'Executing...' : 'Run Query (F5)'}</span>
        </button>

        <button
          onClick={onOpenCommandPalette}
          className="flex items-center space-x-1 px-2 py-1 rounded bg-bg-base border border-border-subtle text-tx-muted hover:text-tx-primary text-xs font-mono transition-colors"
          title="Command Palette (Ctrl+K)"
        >
          <Command className="w-3 h-3" />
          <span>Ctrl+K</span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 text-tx-secondary">
        <button
          onClick={onOpenThemeManager}
          className="p-1.5 hover:bg-bg-overlay rounded transition-colors text-tx-muted hover:text-tx-primary"
          title="Themes & Color Palette"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
