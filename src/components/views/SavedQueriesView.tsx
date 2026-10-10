import { SqlCodeBlock } from '@/components/common/SqlCodeBlock';
import { useConnectionStore } from '@/stores/connectionStore';
import { useQueryStore } from '@/stores/queryStore';
import { Bookmark, Check, Copy, ExternalLink, Play, Plus, Search, Trash2, X } from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';

interface SavedQueriesViewProps {
  onNavigateToEditor: () => void;
}

export const SavedQueriesView: React.FC<SavedQueriesViewProps> = ({ onNavigateToEditor }) => {
  const { savedQueries, saveQuery, removeSavedQuery, createTab, runActiveQuery } = useQueryStore();
  const { activeConnectionId } = useConnectionStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSql, setNewSql] = useState('');
  const [newTag, setNewTag] = useState('');

  // Extract unique tags
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    for (const q of savedQueries) {
      if (q.tags) {
        for (const t of q.tags) {
          tagsSet.add(t);
        }
      }
    }
    return Array.from(tagsSet);
  }, [savedQueries]);

  const filteredQueries = useMemo(() => {
    return savedQueries.filter((q) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        q.title.toLowerCase().includes(term) ||
        q.sql.toLowerCase().includes(term) ||
        q.tags?.some((t) => t.toLowerCase().includes(term));
      const matchesTag = selectedTag === 'all' || q.tags?.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [savedQueries, searchTerm, selectedTag]);

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
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    saveQuery(newTitle.trim(), newSql.trim(), tags.length > 0 ? tags : ['custom']);
    setNewTitle('');
    setNewSql('');
    setNewTag('');
    setIsCreating(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-bg-base text-tx-primary font-sans select-none custom-scrollbar p-6 md:p-10">
      <div className="max-w-4xl w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-medium tracking-tight text-tx-primary">Saved Queries</h1>
            <p className="text-xs text-tx-muted mt-1">
              {savedQueries.length === 0
                ? 'No saved query snippets yet'
                : `${savedQueries.length} saved ${savedQueries.length === 1 ? 'snippet' : 'snippets'}`}
            </p>
          </div>

          <button
            onClick={() => setIsCreating(true)}
            className="px-3.5 py-1.5 rounded-lg bg-accent-primary hover:bg-accent-primary-hover active:scale-[0.98] text-accent-text text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Snippet</span>
          </button>
        </div>

        {/* Create Form */}
        {isCreating && (
          <form
            onSubmit={handleCreateNew}
            className="p-4 rounded-xl bg-bg-surface space-y-3.5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-medium text-tx-primary">Create Saved Query</h2>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-tx-muted hover:text-tx-primary cursor-pointer p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-tx-secondary block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Monthly Active Users"
                  className="w-full px-3 py-1.5 rounded-lg bg-bg-base text-xs text-tx-primary placeholder-tx-muted/60 focus:outline-none transition-colors font-sans"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[11px] text-tx-secondary block mb-1">
                  Tags <span className="text-tx-muted text-[10px]">(comma separated)</span>
                </label>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="analytics, reports, users"
                  className="w-full px-3 py-1.5 rounded-lg bg-bg-base text-xs text-tx-primary placeholder-tx-muted/60 focus:outline-none transition-colors font-sans"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-tx-secondary block mb-1">SQL Statement</label>
              <textarea
                required
                rows={4}
                value={newSql}
                onChange={(e) => setNewSql(e.target.value)}
                placeholder="SELECT * FROM users WHERE status = 'active';"
                className="w-full px-3 py-2 rounded-lg bg-bg-base text-xs text-tx-primary placeholder-tx-muted/60 focus:outline-none font-mono transition-colors"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-tx-secondary hover:text-tx-primary hover:bg-bg-elevated transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-accent-primary hover:bg-accent-primary-hover text-accent-text text-xs font-medium transition-colors cursor-pointer"
              >
                Save Query
              </button>
            </div>
          </form>
        )}

        {/* Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Tag Pills */}
          <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-white/[0.04] self-start overflow-x-auto max-w-full">
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                selectedTag === 'all'
                  ? 'bg-white/[0.08] text-tx-primary shadow-xs'
                  : 'text-tx-muted hover:text-tx-secondary'
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono lowercase transition-all cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-white/[0.08] text-tx-primary shadow-xs'
                    : 'text-tx-muted hover:text-tx-secondary'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-tx-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search saved queries..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/[0.04] focus:bg-white/[0.07] text-xs text-tx-primary placeholder-tx-muted focus:outline-none transition-colors font-sans"
            />
          </div>
        </div>

        {/* Queries List */}
        <div className="space-y-2.5">
          {filteredQueries.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto text-tx-muted">
                <Bookmark className="w-5 h-5 opacity-60" />
              </div>
              <div>
                <p className="text-xs font-medium text-tx-secondary">
                  {savedQueries.length === 0
                    ? 'No saved queries yet'
                    : 'No queries match your filter'}
                </p>
                <p className="text-[11px] text-tx-muted mt-0.5">
                  {savedQueries.length === 0
                    ? 'Save recurring SQL queries to access and run them easily.'
                    : 'Try clearing your tag or search filter.'}
                </p>
              </div>
            </div>
          ) : (
            filteredQueries.map((query) => {
              const isCopied = copiedId === query.id;

              return (
                <div
                  key={query.id}
                  className="group rounded-xl bg-white/[0.04] hover:bg-white/[0.07] transition-all overflow-hidden"
                >
                  {/* Item Header */}
                  <div className="px-4 py-2.5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <span className="text-xs font-medium text-tx-primary truncate">
                        {query.title}
                      </span>
                      {query.tags && query.tags.length > 0 && (
                        <div className="flex items-center space-x-1">
                          {query.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.2 rounded bg-white/[0.06] text-tx-muted text-[10px] font-mono lowercase"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopy(query.id, query.sql)}
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
                        onClick={() => handleOpenInEditor(query.title, query.sql)}
                        className="p-1 text-tx-muted hover:text-tx-primary rounded hover:bg-white/[0.08] transition-colors cursor-pointer"
                        title="Open in Editor"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleRunQuery(query.title, query.sql)}
                        className="p-1 text-accent-primary hover:text-accent-primary-hover rounded hover:bg-accent-primary/10 transition-colors cursor-pointer"
                        title="Run Query"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>

                      <button
                        onClick={() => removeSavedQuery(query.id)}
                        className="p-1 text-tx-muted hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete Query"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Syntax Highlighted SQL Content */}
                  <div className="p-3.5 bg-white/[0.02]">
                    <SqlCodeBlock code={query.sql} maxHeight="180px" />
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
