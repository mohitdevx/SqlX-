import {
  BarChart3,
  Boxes,
  Check,
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
      'Natural language to SQL generation, query explanation, query optimization suggestions, and error diagnosis.',
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
      'Interactive graphical Entity Relationship Diagram (ERD) visualizer showing foreign keys, relations, and table hierarchies.',
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
    description:
      'One-click high-speed exports to CSV, XLSX, JSON, NDJSON, and Apache Parquet formats with compression options.',
    icon: FileSpreadsheet,
    enabled: true,
    installed: true,
    downloads: '22.5k',
  },
  {
    id: 'mock-data-generator',
    name: 'Synthetic Data Generator',
    version: '1.2.0',
    author: 'DevSuite',
    category: 'Testing',
    description:
      'Generate thousands of realistic fake rows with locale-specific names, addresses, emails, and dates for staging tests.',
    icon: Wand2,
    enabled: false,
    installed: true,
    downloads: '6.4k',
  },
  {
    id: 'query-profiler',
    name: 'EXPLAIN Query Profiler',
    version: '2.0.1',
    author: 'Performance Systems',
    category: 'Performance',
    description:
      'Visual Flamegraph and tree viewer for EXPLAIN ANALYZE execution plans, identifying table scans and missing indexes.',
    icon: BarChart3,
    enabled: true,
    installed: true,
    downloads: '11.1k',
  },
  {
    id: 'db-migrator',
    name: 'Schema Migration Generator',
    version: '1.0.5',
    author: 'DevOps Tools',
    category: 'DevOps',
    description:
      'Generate up/down migration SQL scripts comparing schema diffs between development and production databases.',
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

  const categories = ['All', 'Productivity', 'Modeling', 'Utilities', 'Performance', 'Testing'];

  const filtered = useMemo(() => {
    return extensions.filter((ext) => {
      const matchesSearch =
        ext.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ext.description.toLowerCase().includes(searchTerm.toLowerCase());
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

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-bg-base text-tx-primary font-sans select-none p-6 md:p-8">
      <div className="max-w-5xl w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                <Boxes className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-tx-primary">
                Extensions & Plugins
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-accent-primary/10 border border-accent-primary/30 font-mono text-[10px] text-accent-primary font-semibold">
                Marketplace
              </span>
            </div>
            <p className="text-xs text-tx-secondary mt-1">
              Extend SqlX with visual query generators, schema modelers, performance profilers, and
              AI helpers.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative w-56">
              <Search className="w-3.5 h-3.5 text-tx-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search extensions..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-bg-surface border border-border-subtle text-xs text-tx-primary placeholder-tx-muted focus:outline-none focus:border-accent-primary transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-accent-primary text-accent-text font-semibold shadow-sm'
                  : 'bg-bg-surface hover:bg-bg-elevated text-tx-secondary hover:text-tx-primary border border-border-subtle'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Extensions Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((ext) => {
            const IconComponent = ext.icon;
            return (
              <div
                key={ext.id}
                className="p-5 rounded-xl bg-bg-surface border border-border-subtle hover:border-border-default transition-all shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary">
                        <IconComponent className="w-5 h-5 stroke-[1.75]" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-xs font-bold text-tx-primary">{ext.name}</h3>
                          <span className="font-mono text-[10px] text-tx-muted">
                            v{ext.version}
                          </span>
                        </div>
                        <div className="text-[11px] text-tx-muted flex items-center space-x-2 mt-0.5">
                          <span>{ext.author}</span>
                          <span>·</span>
                          <span>{ext.downloads} installs</span>
                        </div>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-bg-base border border-border-subtle text-tx-muted">
                      {ext.category}
                    </span>
                  </div>

                  <p className="text-xs text-tx-secondary leading-relaxed">{ext.description}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border-subtle/60">
                  <div className="flex items-center space-x-2">
                    {ext.installed ? (
                      <span className="flex items-center space-x-1 text-[11px] text-emerald-400 font-medium">
                        <Check className="w-3.5 h-3.5" />
                        <span>Installed</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-tx-muted">Available</span>
                    )}
                  </div>

                  {ext.installed ? (
                    <button
                      onClick={() => toggleExtension(ext.id)}
                      className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        ext.enabled
                          ? 'bg-accent-primary/15 text-accent-primary border border-accent-primary/30 hover:bg-accent-primary/25'
                          : 'bg-bg-base text-tx-muted hover:text-tx-primary border border-border-subtle'
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
                      className="px-3.5 py-1.5 rounded-lg bg-accent-primary hover:bg-accent-primary-hover text-accent-text text-xs font-semibold shadow-sm transition-all flex items-center space-x-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Install</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
