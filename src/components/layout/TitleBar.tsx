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
    <header className="titlebar-root h-14 bg-[#0c0d10] border-b border-white/[0.06] flex items-center justify-between px-6 py-2.5 select-none z-30 shrink-0">
      {/* ── Left: Brand ── */}
      <div className="flex items-center gap-2.5 shrink-0">
        <Zap className="w-4 h-4 text-white" strokeWidth={2} />
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-semibold tracking-tight text-white/90">SqlX</span>
          <span className="text-[10px] font-mono text-white/30 tracking-wider uppercase">
            Studio
          </span>
        </div>
      </div>

      {/* ── Center: Command Palette Trigger ── */}
      <div className="flex items-center justify-center px-4">
        <button
          onClick={onOpenCommandPalette}
          className="w-80 md:w-96 h-8 flex items-center gap-2.5 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.06] transition-all duration-150 group shadow-sm"
        >
          <Search
            className="w-3.5 h-3.5 text-white/25 group-hover:text-white/40 transition-colors shrink-0"
            strokeWidth={1.5}
          />
          <span className="flex-1 text-left text-xs text-white/30 group-hover:text-white/50 transition-colors truncate">
            Search commands, queries, actions…
          </span>
          <kbd className="text-[10px] font-mono text-white/20 border border-white/[0.08] px-1.5 py-0.5 rounded bg-white/[0.02] shrink-0">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* ── Right: Execute & Settings ── */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Execute Query Button */}
        <button
          onClick={() => {
            if (activeConnectionId) {
              runActiveQuery(activeConnectionId);
            }
          }}
          disabled={!activeConnectionId || isRunning}
          className={`group flex items-center gap-2 h-8 px-3.5 rounded-lg text-xs font-medium transition-all duration-150 disabled:opacity-25 disabled:pointer-events-none shadow-sm ${
            isRunning
              ? 'bg-white/[0.06] text-white/60'
              : hasSelection
                ? 'bg-white text-[#0c0d10] hover:bg-white/90 shadow-[0_0_16px_rgba(255,255,255,0.08)] font-semibold'
                : 'bg-white/[0.08] text-white/80 hover:bg-white/[0.13] hover:text-white'
          }`}
        >
          {isRunning ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
          ) : (
            <Play
              className={`w-3 h-3 ${hasSelection ? 'fill-[#0c0d10]' : 'fill-white/80 group-hover:fill-white'}`}
              strokeWidth={0}
            />
          )}
          <span>{isRunning ? 'Running' : hasSelection ? 'Run Selection' : 'Execute'}</span>
          {!isRunning && (
            <kbd
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                hasSelection ? 'bg-black/10 text-[#0c0d10]/60' : 'bg-white/[0.06] text-white/30'
              }`}
            >
              F5
            </kbd>
          )}
        </button>

        <div className="w-px h-4 bg-white/[0.06]" />

        {/* Settings Button */}
        <button
          onClick={onOpenThemeManager}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all duration-150"
          title="Settings & Appearance"
        >
          <Settings className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
};
