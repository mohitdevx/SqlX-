import React from 'react';
import { useConnectionStore } from '@/stores/connectionStore';
import { useQueryStore } from '@/stores/queryStore';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const { activeConnectionId } = useConnectionStore();
  const { tabs, activeTabId } = useQueryStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <footer className="h-6 bg-bg-surface border-t border-border-subtle flex items-center justify-between px-3 text-[11px] font-mono text-tx-secondary select-none">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5">
          {activeConnectionId ? (
            <>
              <span className="w-2 h-2 rounded-full bg-status-success inline-block"></span>
              <span className="text-tx-primary">Connected: {activeConnectionId}</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-status-warning inline-block"></span>
              <span>Disconnected</span>
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
            <div>{activeTab.result.rows.length} rows fetched</div>
          </>
        )}
        <div className="text-tx-muted">UTF-8</div>
      </div>
    </footer>
  );
};
