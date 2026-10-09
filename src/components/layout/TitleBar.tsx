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
    <header className="titlebar-root h-13 bg-[#0c0d10] border-b border-white/[0.06] flex items-center justify-between px-5 select-none z-30">
      {/* ── Left: Clean Brand ── */}
      <div className="flex items-center gap-2.5 min-w-0 shrink-0">
        <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center shadow-sm">
          <Zap className="w-3.5 h-3.5 text-[#0c0d10]" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold tracking-wide text-white/90 leading-tight">
            SqlX
          </span>
          <span className="text-[9px] font-mono text-white/30 tracking-wider uppercase leading-none">
            Studio
          </span>
        </div>
      </div>

      {/* ── Center: Search / Command Bar ── */}
      <div className="flex-1 flex items-center justify-center px-8 max-w-lg mx-auto">
        <button
          onClick={onOpenCommandPalette}
          className="w-full h-8 flex items-center gap-2.5 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.06] transition-all duration-150 group shadow-sm"
        >
          <Search
            className="w-3.5 h-3.5 text-white/25 group-hover:text-white/40 transition-colors"
            strokeWidth={1.5}
          />
          <span className="flex-1 text-left text-xs text-white/30 group-hover:text-white/50 transition-colors">
            Search commands, tables, actions…
          </span>
          <kbd className="text-[10px] font-mono text-white/20 border border-white/[0.08] px-1.5 py-0.5 rounded bg-white/[0.02]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* ── Right: Action & Settings ── */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Execute Button */}
        <button
          onClick={() => {
            if (activeConnectionId) {
              runActiveQuery(activeConnectionId);
            }
          }}
          disabled={!activeConnectionId || isRunning}
          className={`group flex items-center gap-2 h-8 px-3 rounded-lg text-xs font-medium transition-all duration-150 disabled:opacity-25 disabled:pointer-events-none shadow-sm ${
            isRunning
              ? 'bg-white/[0.06] text-white/60'
              : hasSelection
                ? 'bg-white text-[#0c0d10] hover:bg-white/90 shadow-[0_0_16px_rgba(255,255,255,0.08)]'
                : 'bg-white/[0.08] text-white/80 hover:bg-white/[0.13] hover:text-white'
          }`}
        >
          {isRunning ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
          ) : (
            <Play
              className={`w-3.5 h-3.5 ${hasSelection ? 'fill-[#0c0d10]' : 'fill-white/80 group-hover:fill-white'}`}
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

        {/* Settings */}
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
