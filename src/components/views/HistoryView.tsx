import { useConnectionStore } from '@/stores/connectionStore';
import { useQueryStore } from '@/stores/queryStore';
import {
  AlertCircle,
  Bookmark,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Play,
  Search,
  Trash2,
} from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';

interface HistoryViewProps {
  onNavigateToEditor: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onNavigateToEditor }) => {
  const { history, clearHistory, createTab, runActiveQuery, saveQuery } = useQueryStore();
  const { activeConnectionId } = useConnectionStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => item.sql.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [history, searchTerm]);

  const handleCopy = (id: string, sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleOpenInEditor = (sql: string) => {
    createTab(sql, 'History Query');
    onNavigateToEditor();
  };

  const handleRunQuery = (sql: string) => {
    createTab(sql, 'History Run');
    onNavigateToEditor();
    if (activeConnectionId) {
      setTimeout(() => runActiveQuery(activeConnectionId, sql), 50);
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-bg-base text-tx-primary font-sans select-none p-6 md:p-8">
      <div className="max-w-5xl w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Clock className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-tx-primary">Query History</h1>
              <span className="px-2 py-0.5 rounded-full bg-bg-elevated border border-border-subtle font-mono text-[10px] text-tx-muted">
                {history.length} runs
              </span>
            </div>
            <p className="text-xs text-tx-secondary mt-1">
              Audit log of all queries executed during your sessions with execution metrics.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative w-56">
              <Search className="w-3.5 h-3.5 text-tx-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search history..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-bg-surface border border-border-subtle text-xs text-tx-primary placeholder-tx-muted focus:outline-none focus:border-accent-primary transition-colors font-mono"
              />
            </div>

            {history.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Clear all query history?')) {
                    clearHistory();
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-bg-surface hover:bg-rose-500/10 text-tx-muted hover:text-rose-400 border border-border-subtle hover:border-rose-500/30 text-xs font-medium transition-colors flex items-center space-x-1.5"
                title="Clear History"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* History List */}
        <div className="space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-bg-surface border border-border-subtle text-tx-muted space-y-2">
              <Clock className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-xs">No execution history found.</p>
              <p className="text-[11px] text-tx-muted/60">
                Execute queries in the editor to see audit logs recorded here.
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-bg-surface border border-border-subtle hover:border-border-default transition-all shadow-sm space-y-3"
              >
                {/* Item Top Metrics Bar */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    {item.success ? (
                      <span className="flex items-center space-x-1 text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Success</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-rose-400 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Failed</span>
                      </span>
                    )}

                    <span className="text-tx-muted/40">·</span>
                    <span className="font-mono text-[11px] text-tx-muted">
                      {item.executionTimeMs}ms
                    </span>

                    <span className="text-tx-muted/40">·</span>
                    <span className="font-mono text-[11px] text-tx-muted">
                      {item.rowsCount} rows
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-tx-muted font-mono text-[11px]">
                    <span>{formatTime(item.timestamp)}</span>
                  </div>
                </div>

                {/* SQL Code Block */}
                <div className="p-3 rounded-lg bg-bg-base border border-border-subtle font-mono text-xs text-tx-primary whitespace-pre-wrap overflow-x-auto selection:bg-accent-primary/30">
                  {item.sql}
                </div>

                {item.error && (
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono text-xs">
                    {item.error}
                  </div>
                )}

                {/* Bottom Actions */}
                <div className="flex items-center justify-end space-x-2 pt-1 border-t border-border-subtle/50">
                  <button
                    onClick={() => handleCopy(item.id, item.sql)}
                    className="px-2.5 py-1 rounded-md bg-bg-base hover:bg-bg-elevated border border-border-subtle text-[11px] font-medium text-tx-secondary hover:text-tx-primary transition-colors flex items-center space-x-1"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      saveQuery(`Query at ${formatTime(item.timestamp)}`, item.sql);
                      alert('Query bookmarked to Saved Queries!');
                    }}
                    className="px-2.5 py-1 rounded-md bg-bg-base hover:bg-bg-elevated border border-border-subtle text-[11px] font-medium text-tx-secondary hover:text-tx-primary transition-colors flex items-center space-x-1"
                    title="Bookmark Query"
                  >
                    <Bookmark className="w-3 h-3" />
                    <span>Save</span>
                  </button>

                  <button
                    onClick={() => handleOpenInEditor(item.sql)}
                    className="px-2.5 py-1 rounded-md bg-bg-base hover:bg-bg-elevated border border-border-subtle text-[11px] font-medium text-tx-secondary hover:text-tx-primary transition-colors flex items-center space-x-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open in Tab</span>
                  </button>

                  <button
                    onClick={() => handleRunQuery(item.sql)}
                    className="px-3 py-1 rounded-md bg-accent-primary hover:bg-accent-primary-hover text-accent-text text-[11px] font-semibold transition-colors flex items-center space-x-1 shadow-sm"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Run Query</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
