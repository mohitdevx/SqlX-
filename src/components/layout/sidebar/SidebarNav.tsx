import { Blocks, Bookmark, Clock, Database, Home, Plus, Terminal } from 'lucide-react';
import type React from 'react';

export type NavView =
  | 'query'
  | 'home'
  | 'connections'
  | 'history'
  | 'saved-queries'
  | 'extensions'
  | 'theme';

export interface SidebarNavProps {
  activeView: NavView;
  setActiveView: (view: NavView) => void;
  onNewQuery: () => void;
  tabsCount: number;
  connectionsCount: number;
  historyCount: number;
  savedQueriesCount: number;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeView,
  setActiveView,
  onNewQuery,
  tabsCount,
  connectionsCount,
  historyCount,
  savedQueriesCount,
}) => {
  return (
    <div className="p-3 pb-2 border-b border-border-subtle shrink-0 space-y-2.5">
      {/* "+ New Query" CTA Button */}
      <button
        type="button"
        onClick={onNewQuery}
        className="w-full py-2 px-3 rounded-lg bg-accent-primary hover:bg-accent-primary-hover active:scale-[0.98] text-accent-text text-xs font-semibold shadow-md shadow-accent-primary/20 transition-all flex items-center justify-between cursor-pointer group"
      >
        <div className="flex items-center space-x-2">
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Query</span>
        </div>
        <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/20 text-accent-text/80">
          Ctrl+T
        </kbd>
      </button>

      {/* Navigation Options with Logos */}
      <div className="space-y-0.5">
        {/* Home */}
        <button
          type="button"
          onClick={() => setActiveView('home')}
          className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs font-medium transition-colors cursor-pointer ${
            activeView === 'home'
              ? 'bg-accent-primary/15 text-accent-primary font-semibold'
              : 'text-tx-secondary hover:text-tx-primary hover:bg-bg-overlay'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </div>
        </button>

        {/* SQL Editor Tab View */}
        <button
          type="button"
          onClick={() => setActiveView('query')}
          className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs font-medium transition-colors cursor-pointer ${
            activeView === 'query'
              ? 'bg-accent-primary/15 text-accent-primary font-semibold'
              : 'text-tx-secondary hover:text-tx-primary hover:bg-bg-overlay'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <Terminal className="w-3.5 h-3.5" />
            <span>SQL Editor</span>
          </div>
          <span className="px-1.5 py-0.2 rounded bg-bg-base text-tx-muted font-mono text-[10px]">
            {tabsCount}
          </span>
        </button>

        {/* Connections */}
        <button
          type="button"
          onClick={() => setActiveView('connections')}
          className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs font-medium transition-colors cursor-pointer ${
            activeView === 'connections'
              ? 'bg-accent-primary/15 text-accent-primary font-semibold'
              : 'text-tx-secondary hover:text-tx-primary hover:bg-bg-overlay'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <Database className="w-3.5 h-3.5" />
            <span>Connections</span>
          </div>
          <span className="px-1.5 py-0.2 rounded bg-bg-base text-tx-muted font-mono text-[10px]">
            {connectionsCount}
          </span>
        </button>

        {/* History */}
        <button
          type="button"
          onClick={() => setActiveView('history')}
          className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs font-medium transition-colors cursor-pointer ${
            activeView === 'history'
              ? 'bg-accent-primary/15 text-accent-primary font-semibold'
              : 'text-tx-secondary hover:text-tx-primary hover:bg-bg-overlay'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <Clock className="w-3.5 h-3.5" />
            <span>History</span>
          </div>
          {historyCount > 0 && (
            <span className="px-1.5 py-0.2 rounded bg-bg-base text-tx-muted font-mono text-[10px]">
              {historyCount}
            </span>
          )}
        </button>

        {/* Saved Queries */}
        <button
          type="button"
          onClick={() => setActiveView('saved-queries')}
          className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs font-medium transition-colors cursor-pointer ${
            activeView === 'saved-queries'
              ? 'bg-accent-primary/15 text-accent-primary font-semibold'
              : 'text-tx-secondary hover:text-tx-primary hover:bg-bg-overlay'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Queries</span>
          </div>
          {savedQueriesCount > 0 && (
            <span className="px-1.5 py-0.2 rounded bg-bg-base text-tx-muted font-mono text-[10px]">
              {savedQueriesCount}
            </span>
          )}
        </button>

        {/* Extensions */}
        <button
          type="button"
          onClick={() => setActiveView('extensions')}
          className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs font-medium transition-colors cursor-pointer ${
            activeView === 'extensions'
              ? 'bg-accent-primary/15 text-accent-primary font-semibold'
              : 'text-tx-secondary hover:text-tx-primary hover:bg-bg-overlay'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <Blocks className="w-3.5 h-3.5 text-white" />
            <span>Extensions</span>
          </div>
        </button>
      </div>
    </div>
  );
};
