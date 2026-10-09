import { useConnectionStore } from '@/stores/connectionStore';
import { useQueryStore } from '@/stores/queryStore';
import { useThemeStore } from '@/stores/themeStore';
import { Clock } from 'lucide-react';
import type React from 'react';

export const StatusBar: React.FC = () => {
  const { activeConnectionId, connections } = useConnectionStore();
  const { tabs, activeTabId } = useQueryStore();
  const { currentTheme } = useThemeStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const currentConn = connections.find((c) => c.id === activeConnectionId);

  return (
    <footer className="h-[22px] bg-[#0a0b0e] border-t border-white/[0.04] flex items-center justify-between px-3 text-[10px] font-mono text-white/20 select-none">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          {currentConn ? (
            <>
              <span className="w-1 h-1 rounded-full bg-emerald-400/60 inline-block" />
              <span className="text-white/35 font-medium">{currentConn.name}</span>
              <span className="text-white/15 uppercase">{currentConn.driver}</span>
            </>
          ) : (
            <>
              <span className="w-1 h-1 rounded-full bg-white/20 inline-block" />
              <span>Ready</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {activeTab?.result && (
          <>
            <div className="flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-white/15" strokeWidth={1.5} />
              <span>{activeTab.result.executionTimeMs}ms</span>
            </div>
            <div>{activeTab.result.rows.length} rows</div>
          </>
        )}
        <div className="text-white/12">{currentTheme.name}</div>
        <div className="text-white/12">UTF-8</div>
      </div>
    </footer>
  );
};
