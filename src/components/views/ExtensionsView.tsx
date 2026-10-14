import {
  BarChart3,
  Blocks,
  Download,
  FileSpreadsheet,
  GitFork,
  Network,
  Search,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Wand2,
} from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';

interface ExtensionItem {
  id: string;
  name: string;
  version: string;
  author: string;
  category: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  enabled: boolean;
  installed: boolean;
  downloads: string;
}

const initialExtensions: ExtensionItem[] = [
  {
    id: 'ai-assistant',
    name: 'AI SQL Copilot',
    version: '2.4.0',
    author: 'SqlX Labs',
    category: 'Productivity',
    description:
      'Natural language to SQL generation, query explanation, and contextual schema suggestions.',
    icon: Sparkles,
    enabled: true,
    installed: true,
    downloads: '14.2k',
  },
  {
    id: 'erd-visualizer',
    name: 'ERD Schema Visualizer',
    version: '1.8.2',
    author: 'Database Tools',
    category: 'Modeling',
    description:
      'Interactive graphical Entity Relationship Diagram visualizer showing relations and foreign keys.',
    icon: Network,
    enabled: true,
    installed: true,
    downloads: '9.8k',
  },
  {
    id: 'data-exporter',
    name: 'Universal Data Exporter',
    version: '3.1.0',
    author: 'SqlX Core',
    category: 'Utilities',
    description: 'High-speed exports to CSV, Excel, JSON, NDJSON, and Apache Parquet formats.',
    icon: FileSpreadsheet,
    enabled: true,
    installed: true,
    downloads: '22.5k',
  },
  {
    id: 'query-profiler',
    name: 'EXPLAIN Query Profiler',
    version: '2.0.1',
    author: 'Performance Systems',
    category: 'Performance',
    description: 'Visual execution plan analyzer and tree viewer for EXPLAIN ANALYZE queries.',
    icon: BarChart3,
    enabled: true,
    installed: true,
    downloads: '11.1k',
  },
  {
    id: 'mock-data-generator',
    name: 'Synthetic Data Generator',
    version: '1.2.0',
    author: 'DevSuite',
    category: 'Testing',
    description:
      'Generate realistic dummy data rows with names, addresses, emails, and dates for staging tests.',
    icon: Wand2,
    enabled: false,
    installed: true,
    downloads: '6.4k',
  },
  {
    id: 'db-migrator',
    name: 'Schema Migration Generator',
    version: '1.0.5',
    author: 'DevOps Tools',
    category: 'DevOps',
    description:
      'Generate up/down migration SQL scripts comparing schema diffs between environments.',
    icon: GitFork,
    enabled: false,
    installed: false,
    downloads: '4.9k',
  },
];

export const ExtensionsView: React.FC = () => {
  const [extensions, setExtensions] = useState<ExtensionItem[]>(initialExtensions);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'Productivity',
    'Modeling',
    'Utilities',
    'Performance',
    'Testing',
    'DevOps',
  ];

  const filtered = useMemo(() => {
    return extensions.filter((ext) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        ext.name.toLowerCase().includes(term) ||
        ext.description.toLowerCase().includes(term) ||
        ext.author.toLowerCase().includes(term);
      const matchesCategory = selectedCategory === 'All' || ext.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [extensions, searchTerm, selectedCategory]);

  const toggleExtension = (id: string) => {
    setExtensions((prev) =>
      prev.map((ext) => (ext.id === id ? { ...ext, enabled: !ext.enabled } : ext))
    );
  };

  const installExtension = (id: string) => {
    setExtensions((prev) =>
      prev.map((ext) => (ext.id === id ? { ...ext, installed: true, enabled: true } : ext))
    );
  };

  const activeCount = extensions.filter((e) => e.installed && e.enabled).length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-bg-base text-tx-primary font-sans select-none custom-scrollbar p-6 md:p-10">
      <div className="max-w-4xl w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-medium tracking-tight text-tx-primary">Extensions</h1>
            <p className="text-xs text-tx-muted mt-1">
              Extend SqlX with plugins, visual analyzers, and developer tools · {activeCount}{' '}
              enabled
            </p>
          </div>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Category Pills */}
          <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-white/[0.04] self-start overflow-x-auto max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white/[0.08] text-tx-primary shadow-xs'
                    : 'text-tx-muted hover:text-tx-secondary'
                }`}
              >
                {cat}
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
              placeholder="Search extensions..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/[0.04] focus:bg-white/[0.07] text-xs text-tx-primary placeholder-tx-muted focus:outline-none transition-colors font-sans"
            />
          </div>
        </div>

        {/* Extensions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filtered.length === 0 ? (
            <div className="col-span-full py-16 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto text-tx-muted">
                <Blocks className="w-5 h-5 opacity-60" />
              </div>
              <div>
                <p className="text-xs font-medium text-tx-secondary">No extensions found</p>
                <p className="text-[11px] text-tx-muted mt-0.5">
                  Try searching for different keywords or categories.
                </p>
              </div>
            </div>
          ) : (
            filtered.map((ext) => {
              const Icon = ext.icon;

              return (
                <div
                  key={ext.id}
                  className="p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] transition-all flex flex-col justify-between space-y-3"
                >
                  {/* Top: Icon + Info */}
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-bg-elevated flex items-center justify-center text-tx-primary shrink-0">
                      <Icon className="w-4 h-4 text-accent-primary" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-xs font-medium text-tx-primary truncate">{ext.name}</h3>
                        <span className="text-[10px] font-mono text-tx-muted">v{ext.version}</span>
                      </div>
                      <p className="text-[11px] text-tx-muted font-sans">by {ext.author}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-tx-secondary font-sans leading-relaxed line-clamp-2">
                    {ext.description}
                  </p>

                  {/* Bottom: Meta & Actions */}
                  <div className="pt-2 flex items-center justify-between text-[11px] border-t border-border-subtle/20">
                    <div className="flex items-center space-x-2 text-tx-muted">
                      <span className="px-1.5 py-0.2 rounded bg-bg-elevated text-tx-muted text-[10px] font-medium">
                        {ext.category}
                      </span>
                      <span>·</span>
                      <span className="font-mono text-[10px]">{ext.downloads} installs</span>
                    </div>

                    <div>
                      {ext.installed ? (
                        <button
                          onClick={() => toggleExtension(ext.id)}
                          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            ext.enabled
                              ? 'bg-accent-primary/15 text-accent-primary'
                              : 'bg-bg-elevated text-tx-muted hover:text-tx-secondary'
                          }`}
                        >
                          {ext.enabled ? (
                            <>
                              <ToggleRight className="w-4 h-4 text-accent-primary" />
                              <span>Enabled</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4" />
                              <span>Disabled</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => installExtension(ext.id)}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-bg-elevated hover:bg-accent-primary hover:text-accent-text text-tx-secondary text-xs font-medium transition-colors cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>Install</span>
                        </button>
                      )}
                    </div>
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
