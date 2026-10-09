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
      {/* Left: Brand + Connection Status */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white/10 text-white font-black text-xs border border-white/15">
            SX
          </div>
          <span className="font-bold text-xs tracking-tight text-white">SqlX</span>
        </div>

        <div className="h-4 w-[1px] bg-border-subtle" />

        {/* Connection Switcher */}
        {currentConn ? (
          <button
            onClick={onOpenNewConnection}
            className="flex items-center space-x-2 px-2.5 py-1 rounded-md bg-bg-overlay hover:bg-bg-elevated border border-border-subtle hover:border-border-default text-xs transition-all text-white/90"
          >
            <Database className="w-3.5 h-3.5 text-white/80" strokeWidth={1.5} />
            <span className="font-medium tracking-tight text-white">{currentConn.name}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-bg-base text-tx-muted uppercase border border-border-subtle">
              {currentConn.driver}
            </span>
            <ChevronDown className="w-3 h-3 text-tx-muted" strokeWidth={1.5} />
          </button>
        ) : (
          <button
            onClick={onOpenNewConnection}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition-all"
          >
            <Database className="w-3.5 h-3.5 text-white/80" strokeWidth={1.5} />
            <span>Connect Database</span>
          </button>
        )}
      </div>

      {/* Center: Search / Palette */}
      <div className="flex items-center">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center space-x-2 px-3 py-1 rounded-md bg-bg-base hover:bg-bg-overlay border border-border-subtle hover:border-border-default text-xs text-tx-muted hover:text-white transition-all w-64 justify-between"
        >
          <div className="flex items-center space-x-2">
            <Command className="w-3.5 h-3.5 text-tx-muted" strokeWidth={1.5} />
            <span className="font-mono text-[11px]">Quick Search / Commands</span>
          </div>
          <kbd className="text-[10px] font-mono bg-bg-surface px-1.5 py-0.5 rounded border border-border-subtle text-tx-secondary">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => {
            if (activeConnectionId) {
              runActiveQuery(activeConnectionId);
            }
          }}
          disabled={!activeConnectionId || activeTab?.isRunning}
          className="flex items-center space-x-2 px-3 py-1 rounded-md bg-white text-black hover:bg-white/90 active:bg-white/80 text-xs font-semibold shadow-sm transition-all disabled:opacity-30 disabled:pointer-events-none"
        >
          <Play className="w-3.5 h-3.5 fill-black" strokeWidth={1.5} />
          <span>{activeTab?.isRunning ? 'Running...' : 'Run Query'}</span>
          <kbd className="text-[10px] font-mono bg-black/10 px-1.5 py-0.5 rounded text-black font-semibold">
            F5
          </kbd>
        </button>

        <div className="h-4 w-[1px] bg-border-subtle mx-1" />

        <button
          onClick={onOpenThemeManager}
          className="p-1.5 rounded-md text-tx-secondary hover:text-white hover:bg-bg-overlay transition-colors"
          title="Themes & Appearance"
        >
          <Settings className="w-4 h-4 text-white/80" strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
};
