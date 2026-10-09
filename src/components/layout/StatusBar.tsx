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
    <footer className="h-[22px] bg-bg-surface border-t border-border-subtle flex items-center justify-between px-3 text-[10px] font-mono text-tx-muted select-none transition-colors duration-150">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          {currentConn ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-status-success inline-block" />
              <span className="text-tx-primary font-medium">{currentConn.name}</span>
              <span className="text-tx-muted uppercase">({currentConn.driver})</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-tx-muted inline-block" />
              <span>Ready</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {activeTab?.result && (
          <>
            <div className="flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-tx-muted" strokeWidth={1.5} />
              <span>{activeTab.result.executionTimeMs}ms</span>
            </div>
            <div>{activeTab.result.rows.length} rows</div>
          </>
        )}
        <div className="text-tx-muted">{currentTheme.name}</div>
        <div className="text-tx-muted">UTF-8</div>
      </div>
    </footer>
  );
};
