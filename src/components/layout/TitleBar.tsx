import React from 'react';
import { Database, Moon, Sun, Settings, Play } from 'lucide-react';
import { useQueryStore } from '@/stores/queryStore';
import { useConnectionStore } from '@/stores/connectionStore';

export const TitleBar: React.FC = () => {
  const { runActiveQuery, tabs, activeTabId } = useQueryStore();
  const { activeConnectionId } = useConnectionStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <header className="h-10 bg-bg-surface border-b border-border-subtle flex items-center justify-between px-3 select-none">
      <div className="flex items-center space-x-2">
        <div className="flex items-center justify-center w-6 h-6 rounded bg-accent-primary text-accent-text font-bold text-xs">
          SX
        </div>
        <span className="font-semibold text-xs tracking-wider text-tx-primary">SQLX</span>
        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-bg-elevated text-tx-muted border border-border-subtle">
          Desktop v0.1
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => {
            if (activeConnectionId) {
              runActiveQuery(activeConnectionId);
            }
          }}
          disabled={!activeConnectionId || activeTab?.isRunning}
          className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium rounded bg-accent-primary text-accent-text hover:bg-accent-hover active:bg-accent-active disabled:opacity-40 transition-colors"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{activeTab?.isRunning ? 'Running...' : 'Run Query (F5)'}</span>
        </button>
      </div>

      <div className="flex items-center space-x-2 text-tx-secondary">
        <button className="p-1 hover:bg-bg-overlay rounded transition-colors text-tx-muted hover:text-tx-primary" title="Theme & Settings">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
