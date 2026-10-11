import { SqlCodeBlock } from '@/components/common/SqlCodeBlock';
import { useConnectionStore } from '@/stores/connectionStore';
import { useQueryStore } from '@/stores/queryStore';
import { Bookmark, Check, Clock, Copy, ExternalLink, Play, Search, Trash2 } from 'lucide-react';
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
  const [savedId, setSavedId] = useState<string | null>(null);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => item.sql.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [history, searchTerm]);

  const handleCopy = (id: string, sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleSaveToQueries = (id: string, sql: string) => {
    const firstLine = sql.trim().split('\n')[0].slice(0, 40);
    saveQuery(firstLine || 'Saved History Query', sql, ['history']);
    setSavedId(id);
    setTimeout(() => setSavedId(null), 1500);
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

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-bg-base text-tx-primary font-sans select-none custom-scrollbar p-6 md:p-10">
      <div className="max-w-4xl w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-medium tracking-tight text-tx-primary">Query History</h1>
            <p className="text-xs text-tx-muted mt-1">
              {history.length === 0
                ? 'No queries executed yet in this session'
                : `${history.length} executed ${history.length === 1 ? 'query' : 'queries'}`}
            </p>
          </div>

          {history.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Clear all execution history?')) {
                  clearHistory();
                }
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-tx-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {/* Search */}
        {history.length > 0 && (
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-tx-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter executed queries..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/[0.04] focus:bg-white/[0.07] text-xs text-tx-primary placeholder-tx-muted focus:outline-none transition-colors font-mono"
            />
          </div>
        )}

        {/* History Rows */}
        <div className="space-y-2.5">
          {filteredHistory.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto text-tx-muted">
                <Clock className="w-5 h-5 opacity-60" />
              </div>
              <div>
                <p className="text-xs font-medium text-tx-secondary">
                  {history.length === 0
                    ? 'No history recorded yet'
                    : 'No queries match your search'}
                </p>
                <p className="text-[11px] text-tx-muted mt-0.5">
                  {history.length === 0
                    ? 'Execute statements in the editor to record queries here.'
                    : 'Try searching for different keywords.'}
                </p>
              </div>
            </div>
          ) : (
            filteredHistory.map((item) => {
              const isCopied = copiedId === item.id;
              const isSaved = savedId === item.id;

              return (
                <div
                  key={item.id}
                  className="group rounded-xl bg-white/[0.04] hover:bg-white/[0.07] transition-all overflow-hidden"
                >
                  {/* Meta Bar */}
                  <div className="px-4 py-2.5 flex items-center justify-between text-[11px] border-b border-border-subtle/20">
                    <div className="flex items-center space-x-2.5">
                      {item.success ? (
                        <span className="text-emerald-400 font-medium text-xs">Success</span>
                      ) : (
                        <span className="text-rose-400 font-medium text-xs">Failed</span>
                      )}
                      <span className="text-tx-muted opacity-30">·</span>
                      <span className="font-mono text-tx-muted">{item.executionTimeMs}ms</span>
                      <span className="text-tx-muted opacity-30">·</span>
                      <span className="font-mono text-tx-muted">{item.rowsCount} rows</span>
                    </div>

                    <div className="flex items-center space-x-3 text-tx-muted">
                      <span className="font-mono text-[10px]">
                        {formatTimestamp(item.timestamp)}
                      </span>

                      {/* Action buttons on row header */}
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCopy(item.id, item.sql)}
                          className="p-1 text-tx-muted hover:text-tx-primary rounded hover:bg-white/[0.08] transition-colors cursor-pointer"
                          title="Copy SQL"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleSaveToQueries(item.id, item.sql)}
                          className="p-1 text-tx-muted hover:text-tx-primary rounded hover:bg-white/[0.08] transition-colors cursor-pointer"
                          title="Save to Saved Queries"
                        >
                          {isSaved ? (
                            <Check className="w-3.5 h-3.5 text-accent-primary" />
                          ) : (
                            <Bookmark className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenInEditor(item.sql)}
                          className="p-1 text-tx-muted hover:text-tx-primary rounded hover:bg-white/[0.08] transition-colors cursor-pointer"
                          title="Open in Editor Tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRunQuery(item.sql)}
                          className="p-1 text-accent-primary hover:text-accent-primary-hover rounded hover:bg-accent-primary/10 transition-colors cursor-pointer"
                          title="Re-run Query"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Syntax Highlighted SQL Code Block */}
                  <div className="p-3.5">
                    <SqlCodeBlock code={item.sql} maxHeight="180px" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
