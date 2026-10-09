import { useConnectionStore } from '@/stores/connectionStore';
import { useQueryStore } from '@/stores/queryStore';
import { ChevronDown, Database, Loader2, Play, Search, Settings, Zap } from 'lucide-react';
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
  const isRunning = activeTab?.isRunning ?? false;

  return (
    <header className="titlebar-root h-11 bg-[#0c0d10] border-b border-white/[0.06] flex items-center justify-between pl-3 pr-2 select-none z-30">
      {/* ── Left: Brand + Connection ── */}
      <div className="flex items-center gap-3 min-w-0 shrink-0">
        {/* Brand Mark */}
        <div className="flex items-center gap-1.5">
          <div className="w-[18px] h-[18px] rounded-[4px] bg-white/90 flex items-center justify-center">
            <Zap className="w-[10px] h-[10px] text-[#0c0d10]" strokeWidth={2.5} />
          </div>
          <span className="text-[11px] font-semibold tracking-[0.02em] text-white/70">SqlX</span>
        </div>

        {/* Separator */}
        <div className="w-px h-3 bg-white/[0.08]" />

        {/* Connection Indicator */}
        {currentConn ? (
          <button
            onClick={onOpenNewConnection}
            className="group flex items-center gap-1.5 px-2 py-[3px] rounded-md hover:bg-white/[0.04] transition-colors duration-150"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/40 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[11px] font-medium text-white/60 group-hover:text-white/80 transition-colors">
              {currentConn.name}
            </span>
            <span className="text-[9px] font-mono text-white/25 uppercase tracking-wider">
              {currentConn.driver}
            </span>
            <ChevronDown
              className="w-2.5 h-2.5 text-white/20 group-hover:text-white/40 transition-colors"
              strokeWidth={1.5}
            />
          </button>
        ) : (
          <button
            onClick={onOpenNewConnection}
            className="group flex items-center gap-1.5 px-2 py-[3px] rounded-md hover:bg-white/[0.04] transition-colors duration-150"
          >
            <Database
              className="w-3 h-3 text-white/30 group-hover:text-white/50"
              strokeWidth={1.5}
            />
            <span className="text-[11px] text-white/40 group-hover:text-white/60 transition-colors">
              No connection
            </span>
          </button>
        )}
      </div>

      {/* ── Center: Command Bar ── */}
      <div className="flex-1 flex items-center justify-center px-6 max-w-md mx-auto">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center gap-2 px-2.5 py-[4px] rounded-lg bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.05] transition-all duration-150 group"
        >
          <Search
            className="w-3 h-3 text-white/20 group-hover:text-white/35 transition-colors"
            strokeWidth={1.5}
          />
          <span className="flex-1 text-left text-[11px] text-white/25 group-hover:text-white/40 transition-colors">
            Search commands…
          </span>
          <kbd className="text-[9px] font-mono text-white/15 border border-white/[0.06] px-1 py-px rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* ── Right: Execute + Settings ── */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Execute Button */}
        <button
          onClick={() => {
            if (activeConnectionId) {
              runActiveQuery(activeConnectionId);
            }
          }}
          disabled={!activeConnectionId || isRunning}
          className={`group flex items-center gap-1.5 h-[26px] px-2.5 rounded-md text-[11px] font-medium transition-all duration-150 disabled:opacity-25 disabled:pointer-events-none ${
            isRunning
              ? 'bg-white/[0.06] text-white/60'
              : hasSelection
                ? 'bg-white/90 text-[#0c0d10] hover:bg-white shadow-[0_0_12px_rgba(255,255,255,0.06)]'
                : 'bg-white/[0.08] text-white/70 hover:bg-white/[0.12] hover:text-white/90'
          }`}
        >
          {isRunning ? (
            <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} />
          ) : (
            <Play
              className={`w-3 h-3 ${hasSelection ? 'fill-[#0c0d10]' : 'fill-white/70 group-hover:fill-white/90'}`}
              strokeWidth={0}
            />
          )}
          <span>{isRunning ? 'Running' : hasSelection ? 'Run Selection' : 'Execute'}</span>
          {!isRunning && (
            <kbd
              className={`text-[9px] font-mono px-1 py-px rounded ${
                hasSelection ? 'bg-black/10 text-[#0c0d10]/50' : 'bg-white/[0.06] text-white/25'
              }`}
            >
              F5
            </kbd>
          )}
        </button>

        {/* Separator */}
        <div className="w-px h-3.5 bg-white/[0.06] mx-0.5" />

        {/* Settings */}
        <button
          onClick={onOpenThemeManager}
          className="w-7 h-7 flex items-center justify-center rounded-md text-white/25 hover:text-white/50 hover:bg-white/[0.04] transition-all duration-150"
          title="Settings"
        >
          <Settings className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
};
