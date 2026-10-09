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
  const { runActiveQuery, tabs, activeTabId, selectedSql } = useQueryStore();
  const { activeConnectionId, connections } = useConnectionStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const currentConn = connections.find((c) => c.id === activeConnectionId);

  const hasSelection = Boolean(selectedSql && selectedSql.trim().length > 0);

  return (
    <header className="h-10 bg-bg-surface border-b border-border-subtle flex items-center justify-between px-3 select-none z-20">
      {/* Left: Brand & Connection Status */}
      <div className="flex items-center space-x-2.5">
        <div className="flex items-center space-x-1.5 pr-1">
          <div className="w-5 h-5 rounded bg-white text-black font-extrabold text-[11px] flex items-center justify-center font-mono shadow-sm">
            SX
          </div>
          <span className="font-bold text-xs tracking-tight text-white">SqlX</span>
        </div>

        <div className="h-3.5 w-[1px] bg-border-subtle" />

        {/* Connection Selector Pill */}
        {currentConn ? (
          <button
            onClick={onOpenNewConnection}
            className="flex items-center space-x-2 px-2 py-1 rounded bg-bg-base hover:bg-bg-overlay border border-border-subtle hover:border-border-default text-xs transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
            <span className="font-medium text-white text-[11px]">{currentConn.name}</span>
            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-bg-elevated text-tx-muted uppercase">
              {currentConn.driver}
            </span>
            <ChevronDown className="w-3 h-3 text-tx-muted" strokeWidth={1.5} />
          </button>
        ) : (
          <button
            onClick={onOpenNewConnection}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-bg-base hover:bg-bg-overlay border border-border-subtle text-white text-[11px] font-medium transition-colors"
          >
            <Database className="w-3 h-3 text-white/70" strokeWidth={1.5} />
            <span>Connect DB</span>
          </button>
        )}
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="flex items-center">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center space-x-2 px-2.5 py-1 rounded bg-bg-base hover:bg-bg-overlay border border-border-subtle hover:border-border-default text-xs text-tx-muted hover:text-white transition-all w-56 justify-between"
        >
          <div className="flex items-center space-x-1.5">
            <Command className="w-3 h-3 text-tx-muted" strokeWidth={1.5} />
            <span className="font-mono text-[10px]">Search actions...</span>
          </div>
          <kbd className="text-[9px] font-mono bg-bg-surface px-1 py-0.2 rounded border border-border-subtle text-tx-muted">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right: Run Query Button with dynamic Selection support & Settings */}
      <div className="flex items-center space-x-1.5">
        <button
          onClick={() => {
            if (activeConnectionId) {
              runActiveQuery(activeConnectionId);
            }
          }}
          disabled={!activeConnectionId || activeTab?.isRunning}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-semibold shadow-sm transition-all disabled:opacity-30 disabled:pointer-events-none ${
            hasSelection
              ? 'bg-white text-black hover:bg-white/90 ring-1 ring-white/50'
              : 'bg-white text-black hover:bg-white/90'
          }`}
        >
          <Play className="w-3 h-3 fill-black" strokeWidth={1.5} />
          <span>
            {activeTab?.isRunning ? 'Executing...' : hasSelection ? 'Run Selection' : 'Run Query'}
          </span>
          <kbd className="text-[9px] font-mono bg-black/10 px-1 py-0.2 rounded text-black font-semibold">
            F5
          </kbd>
        </button>

        <div className="h-3.5 w-[1px] bg-border-subtle mx-0.5" />

        <button
          onClick={onOpenThemeManager}
          className="p-1.5 rounded text-tx-secondary hover:text-white hover:bg-bg-overlay transition-colors"
          title="Themes & Appearance"
        >
          <Settings className="w-3.5 h-3.5 text-white/80" strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
};
