import { useConnectionStore } from '@/stores/connectionStore';
import { useQueryStore } from '@/stores/queryStore';
import { Loader2, Play, Search, Settings, Zap } from 'lucide-react';
import type React from 'react';

interface TitleBarProps {
  onOpenNewConnection?: () => void;
  onOpenCommandPalette: () => void;
  onOpenThemeManager: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({ onOpenCommandPalette, onOpenThemeManager }) => {
  const { runActiveQuery, tabs, activeTabId, selectedSql } = useQueryStore();
  const { activeConnectionId } = useConnectionStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);

  const hasSelection = Boolean(selectedSql && selectedSql.trim().length > 0);
  const isRunning = activeTab?.isRunning ?? false;

  return (
    <header className="titlebar-root h-14 bg-bg-surface border-b border-border-subtle flex items-center justify-between px-6 py-2.5 select-none z-30 shrink-0 transition-colors duration-150">
      {/* ── Left: Brand ── */}
      <div className="flex items-center gap-2.5 shrink-0">
        <Zap className="w-4 h-4 text-tx-primary" strokeWidth={2} />
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-semibold tracking-tight text-tx-primary">SqlX</span>
          <span className="text-[10px] font-mono text-tx-muted tracking-wider uppercase">
            Studio
          </span>
        </div>
      </div>

      {/* ── Center: Command Palette Trigger ── */}
      <div className="flex items-center justify-center px-4">
        <button
          onClick={onOpenCommandPalette}
          className="w-80 md:w-96 h-8 flex items-center gap-2.5 px-3 rounded-lg bg-bg-base border border-border-subtle hover:border-border-default hover:bg-bg-overlay transition-all duration-150 group shadow-sm"
        >
          <Search
            className="w-3.5 h-3.5 text-tx-muted group-hover:text-tx-secondary transition-colors shrink-0"
            strokeWidth={1.5}
          />
          <span className="flex-1 text-left text-xs text-tx-muted group-hover:text-tx-secondary transition-colors truncate">
            Search commands, queries, actions…
          </span>
          <kbd className="text-[10px] font-mono text-tx-muted border border-border-subtle px-1.5 py-0.5 rounded bg-bg-surface shrink-0">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* ── Right: Execute & Settings ── */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Execute / Run Button (Fixed width, never expands/contracts, solid theme color) */}
        <button
          onClick={() => {
            if (activeConnectionId) {
              runActiveQuery(activeConnectionId);
            }
          }}
          disabled={!activeConnectionId || isRunning}
          className="group flex items-center justify-center gap-2 h-8 w-[112px] shrink-0 rounded-lg text-xs font-semibold bg-accent-primary text-accent-text hover:bg-accent-primary-hover active:bg-accent-primary-active transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm select-none"
          title={hasSelection ? 'Run selected SQL (F5)' : 'Execute SQL script (F5)'}
        >
          {isRunning ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-text" strokeWidth={2} />
          ) : (
            <Play className="w-3 h-3 fill-current text-accent-text" strokeWidth={0} />
          )}
          <span className="truncate">{hasSelection ? 'Run' : 'Execute'}</span>
          {!isRunning && (
            <kbd className="text-[10px] font-mono px-1 py-0.5 rounded bg-black/20 text-accent-text/90 leading-none">
              F5
            </kbd>
          )}
        </button>

        <div className="w-px h-4 bg-border-subtle" />

        {/* Settings Button */}
        <button
          onClick={onOpenThemeManager}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-tx-muted hover:text-tx-primary hover:bg-bg-overlay transition-all duration-150"
          title="Settings & Appearance"
        >
          <Settings className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
};
