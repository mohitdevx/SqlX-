import { useConnectionStore } from '@/stores/connectionStore';
import { useQueryStore } from '@/stores/queryStore';
import {
  Bookmark,
  Clock,
  Database,
  ExternalLink,
  Play,
  Plus,
  Sparkles,
  Terminal,
} from 'lucide-react';
import type React from 'react';

interface HomeViewProps {
  onNavigate: (view: 'query' | 'connections' | 'history' | 'saved-queries' | 'extensions') => void;
  onOpenNewConnectionModal: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onOpenNewConnectionModal }) => {
  const { connections, activeConnectionId, schemaTree } = useConnectionStore();
  const { tabs, history, savedQueries, createTab, runActiveQuery } = useQueryStore();

  const activeConn = connections.find((c) => c.id === activeConnectionId);

  const handleLaunchTemplate = (title: string, sql: string) => {
    createTab(sql, title);
    onNavigate('query');
    if (activeConnectionId) {
      setTimeout(() => runActiveQuery(activeConnectionId, sql), 50);
    }
  };

  const templates = [
    {
      title: 'Server Diagnostics',
      desc: 'Check database engine uptime, active connection pool, and timestamp.',
      sql: 'SELECT CURRENT_TIMESTAMP AS server_time, version() AS db_version;',
    },
    {
      title: 'Active Users Audit',
      desc: 'Inspect most recent active accounts and their privileges.',
      sql: 'SELECT id, email, role, is_active, created_at FROM users ORDER BY id DESC LIMIT 20;',
    },
    {
      title: 'Order Revenue Summary',
      desc: 'Aggregate order volumes, completed transactions, and revenues.',
      sql: 'SELECT status, count(*) AS total_orders, sum(total_amount) AS revenue FROM orders GROUP BY status;',
    },
    {
      title: 'Catalog Inventory Check',
      desc: 'Spot check low inventory SKUs requiring replenishment.',
      sql: 'SELECT sku, name, price, stock_quantity FROM products WHERE stock_quantity < 50 ORDER BY stock_quantity ASC LIMIT 15;',
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-bg-base text-tx-primary font-sans select-none p-6 md:p-8">
      <div className="max-w-6xl w-full mx-auto space-y-6">
        {/* Hero Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-tx-primary">SqlX Studio</h1>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-accent-primary/10 border border-accent-primary/30 text-accent-primary font-semibold">
                v1.0 Pro
              </span>
            </div>
            <p className="text-xs text-tx-secondary mt-1">
              High-performance unified database management, schema explorer, and query editor.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => {
                createTab();
                onNavigate('query');
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-accent-primary hover:bg-accent-primary-hover text-accent-text text-xs font-semibold shadow-md shadow-accent-primary/20 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Query</span>
            </button>
            <button
              onClick={onOpenNewConnectionModal}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-bg-surface hover:bg-bg-elevated border border-border-subtle hover:border-border-default text-tx-primary text-xs font-semibold transition-all cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-accent-primary" />
              <span>Add Database</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => onNavigate('connections')}
            className="p-4 rounded-xl bg-bg-surface border border-border-subtle hover:border-accent-primary/40 cursor-pointer transition-all shadow-sm group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                <Database className="w-5 h-5 stroke-[1.75]" />
              </div>
              <span className="text-[10px] font-mono text-tx-muted group-hover:text-accent-primary transition-colors">
                Manage →
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight text-tx-primary">
                {connections.length}
              </div>
              <div className="text-[11px] text-tx-muted font-medium">Configured Connections</div>
            </div>
          </div>

          <div
            onClick={() => onNavigate('query')}
            className="p-4 rounded-xl bg-bg-surface border border-border-subtle hover:border-accent-primary/40 cursor-pointer transition-all shadow-sm group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <Terminal className="w-5 h-5 stroke-[1.75]" />
              </div>
              <span className="text-[10px] font-mono text-tx-muted group-hover:text-accent-primary transition-colors">
                Editor →
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight text-tx-primary">{tabs.length}</div>
              <div className="text-[11px] text-tx-muted font-medium">Open Query Tabs</div>
            </div>
          </div>

          <div
            onClick={() => onNavigate('saved-queries')}
            className="p-4 rounded-xl bg-bg-surface border border-border-subtle hover:border-accent-primary/40 cursor-pointer transition-all shadow-sm group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <Bookmark className="w-5 h-5 stroke-[1.75]" />
              </div>
              <span className="text-[10px] font-mono text-tx-muted group-hover:text-accent-primary transition-colors">
                Saved →
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight text-tx-primary">
                {savedQueries.length}
              </div>
              <div className="text-[11px] text-tx-muted font-medium">Saved Queries</div>
            </div>
          </div>

          <div
            onClick={() => onNavigate('history')}
            className="p-4 rounded-xl bg-bg-surface border border-border-subtle hover:border-accent-primary/40 cursor-pointer transition-all shadow-sm group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5 stroke-[1.75]" />
              </div>
              <span className="text-[10px] font-mono text-tx-muted group-hover:text-accent-primary transition-colors">
                History →
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight text-tx-primary">
                {history.length}
              </div>
              <div className="text-[11px] text-tx-muted font-medium">Executed Queries</div>
            </div>
          </div>
        </div>

        {/* Active Database Hub Banner */}
        <div className="p-5 rounded-xl bg-gradient-to-r from-accent-primary/10 via-bg-surface to-bg-surface border border-accent-primary/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-accent-primary/20 border border-accent-primary/40 flex items-center justify-center text-accent-primary">
              <Database className="w-6 h-6 stroke-[1.75]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase font-mono tracking-wider text-tx-muted">
                  Active Database
                </span>
                {activeConn && (
                  <span className="flex items-center space-x-1 px-1.5 py-0.2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    <span>Live</span>
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-tx-primary mt-0.5">
                {activeConn ? activeConn.name : 'No Database Connected'}
              </h2>
              <p className="text-xs text-tx-secondary font-mono mt-0.5">
                {activeConn
                  ? `${activeConn.driver.toUpperCase()} · ${activeConn.database || activeConn.filePath || 'default'} (${schemaTree ? `${schemaTree.tables.length} tables` : 'schema ready'})`
                  : 'Select or add a connection in the left side panel to start querying'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigate('query')}
              className="px-4 py-2 rounded-lg bg-accent-primary hover:bg-accent-primary-hover text-accent-text text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Open Query Editor</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('connections')}
              className="px-3.5 py-2 rounded-lg bg-bg-surface hover:bg-bg-elevated border border-border-subtle text-tx-secondary hover:text-tx-primary text-xs font-medium transition-all cursor-pointer"
            >
              Switch Connection
            </button>
          </div>
        </div>

        {/* Starter Query Templates */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-accent-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-tx-primary">
                Quick Query Starters
              </h2>
            </div>
            <span className="text-xs text-tx-muted">Click any starter to execute in editor</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tpl) => (
              <div
                key={tpl.title}
                onClick={() => handleLaunchTemplate(tpl.title, tpl.sql)}
                className="p-4 rounded-xl bg-bg-surface border border-border-subtle hover:border-accent-primary/40 hover:bg-bg-overlay/40 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-tx-primary group-hover:text-accent-primary transition-colors">
                      {tpl.title}
                    </h3>
                    <div className="w-6 h-6 rounded-md bg-accent-primary/10 text-accent-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-2.5 h-2.5 fill-current" />
                    </div>
                  </div>
                  <p className="text-[11px] text-tx-muted mt-1">{tpl.desc}</p>
                </div>

                <div className="mt-3 p-2 rounded-lg bg-bg-base border border-border-subtle/60 font-mono text-[10px] text-tx-secondary truncate">
                  {tpl.sql}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
