import { useConnectionStore } from '@/stores/connectionStore';
import { useQueryStore } from '@/stores/queryStore';
import { Bookmark, Check, Copy, ExternalLink, Play, Plus, Search, Tag, Trash2 } from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';

interface SavedQueriesViewProps {
  onNavigateToEditor: () => void;
}

export const SavedQueriesView: React.FC<SavedQueriesViewProps> = ({ onNavigateToEditor }) => {
  const { savedQueries, saveQuery, removeSavedQuery, createTab, runActiveQuery } = useQueryStore();
  const { activeConnectionId } = useConnectionStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSql, setNewSql] = useState('');
  const [newTag, setNewTag] = useState('');

  const filteredQueries = useMemo(() => {
    return savedQueries.filter(
      (q) =>
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.sql.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.tags?.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [savedQueries, searchTerm]);

  const handleCopy = (id: string, sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleOpenInEditor = (title: string, sql: string) => {
    createTab(sql, title);
    onNavigateToEditor();
  };

  const handleRunQuery = (title: string, sql: string) => {
    createTab(sql, title);
    onNavigateToEditor();
    if (activeConnectionId) {
      setTimeout(() => runActiveQuery(activeConnectionId, sql), 50);
    }
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSql.trim()) return;
    const tags = newTag
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    saveQuery(newTitle, newSql, tags.length > 0 ? tags : ['custom']);
    setNewTitle('');
    setNewSql('');
    setNewTag('');
    setIsCreating(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-bg-base text-tx-primary font-sans select-none p-6 md:p-8">
      <div className="max-w-5xl w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Bookmark className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-tx-primary">Saved Queries</h1>
              <span className="px-2 py-0.5 rounded-full bg-bg-elevated border border-border-subtle font-mono text-[10px] text-tx-muted">
                {savedQueries.length} items
              </span>
            </div>
            <p className="text-xs text-tx-secondary mt-1">
              Organize, bookmark, and quickly execute recurring SQL scripts and snippets.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative w-56">
              <Search className="w-3.5 h-3.5 text-tx-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search saved queries..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-bg-surface border border-border-subtle text-xs text-tx-primary placeholder-tx-muted focus:outline-none focus:border-accent-primary transition-colors"
              />
            </div>

            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-accent-primary hover:bg-accent-primary-hover text-accent-text text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Save Query</span>
            </button>
          </div>
        </div>

        {/* Create Modal / Card */}
        {isCreating && (
          <form
            onSubmit={handleCreateNew}
            className="p-5 rounded-xl bg-bg-surface border border-accent-primary/40 shadow-lg space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-tx-primary">
                Add New Saved Query
              </h2>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-xs text-tx-muted hover:text-tx-primary"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-tx-secondary block mb-1">
                  Query Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Monthly Active Subscribers"
                  className="w-full px-3 py-1.5 rounded-lg bg-bg-base border border-border-subtle text-xs text-tx-primary focus:outline-none focus:border-accent-primary font-sans"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-tx-secondary block mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="e.g. analytics, monthly, report"
                  className="w-full px-3 py-1.5 rounded-lg bg-bg-base border border-border-subtle text-xs text-tx-primary focus:outline-none focus:border-accent-primary font-sans"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-tx-secondary block mb-1">
                SQL Query Buffer
              </label>
              <textarea
                required
                rows={4}
                value={newSql}
                onChange={(e) => setNewSql(e.target.value)}
                placeholder="SELECT * FROM my_table WHERE ..."
                className="w-full px-3 py-2 rounded-lg bg-bg-base border border-border-subtle text-xs font-mono text-tx-primary focus:outline-none focus:border-accent-primary resize-y"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 rounded-lg bg-bg-base hover:bg-bg-elevated border border-border-subtle text-xs text-tx-secondary hover:text-tx-primary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-accent-primary hover:bg-accent-primary-hover text-accent-text text-xs font-semibold shadow-sm transition-all"
              >
                Save Snippet
              </button>
            </div>
          </form>
        )}

        {/* Queries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQueries.length === 0 ? (
            <div className="md:col-span-2 p-12 text-center rounded-xl bg-bg-surface border border-border-subtle text-tx-muted space-y-2">
              <Bookmark className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-xs">No saved queries found.</p>
              <p className="text-[11px] text-tx-muted/60">
                Click "+ Save Query" to save reusable SQL snippets.
              </p>
            </div>
          ) : (
            filteredQueries.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-bg-surface border border-border-subtle hover:border-border-default transition-all shadow-sm flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-bold text-tx-primary truncate">{item.title}</h3>
                    <button
                      onClick={() => removeSavedQuery(item.id)}
                      className="p-1 rounded text-tx-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Saved Query"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.2 rounded bg-bg-base border border-border-subtle/80 text-[10px] font-mono text-tx-muted flex items-center space-x-1"
                        >
                          <Tag className="w-2.5 h-2.5" />
                          <span>{tag}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="p-2.5 rounded-lg bg-bg-base border border-border-subtle font-mono text-[11px] text-tx-secondary max-h-32 overflow-y-auto whitespace-pre-wrap">
                    {item.sql}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border-subtle/60">
                  <button
                    onClick={() => handleCopy(item.id, item.sql)}
                    className="p-1.5 rounded hover:bg-bg-elevated text-tx-muted hover:text-tx-primary transition-colors flex items-center space-x-1 text-[11px]"
                    title="Copy SQL"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleOpenInEditor(item.title, item.sql)}
                      className="px-2.5 py-1 rounded-md bg-bg-base hover:bg-bg-elevated border border-border-subtle text-[11px] font-medium text-tx-secondary hover:text-tx-primary transition-colors flex items-center space-x-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleRunQuery(item.title, item.sql)}
                      className="px-3 py-1 rounded-md bg-accent-primary hover:bg-accent-primary-hover text-accent-text text-[11px] font-semibold transition-colors flex items-center space-x-1 shadow-sm"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Run</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
