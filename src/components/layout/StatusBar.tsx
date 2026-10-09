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
    <footer className="h-6 bg-bg-surface border-t border-border-subtle flex items-center justify-between px-3 text-[11px] font-mono text-tx-secondary select-none">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5">
          {currentConn ? (
            <>
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
              <span className="text-tx-muted uppercase">({currentConn.driver})</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-status-warning" />
              <span>Ready (No Active Connection)</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {activeTab?.result && (
          <>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-tx-muted" />
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
