import { DataGrid } from '@/components/grid/DataGrid';
import type { QueryResult } from '@/types/database';
import {
  AlertCircle,
  BarChart3,
  Check,
  Code2,
  Columns,
  Copy,
  Database,
  Download,
  Loader2,
  Search,
  Table,
  Terminal,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';

interface ResultsPanelProps {
  result: QueryResult | null;
  error: string | null;
  isRunning?: boolean;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ result, error, isRunning }) => {
  const [activeTab, setActiveTab] = useState<'grid' | 'json' | 'chart' | 'structure'>('grid');
  const [filterText, setFilterText] = useState('');
  const [copied, setCopied] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Live timer during query execution
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      setElapsedSeconds(0);
      interval = setInterval(() => {
        setElapsedSeconds((prev) => +(prev + 0.1).toFixed(1));
      }, 100);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  // Selected chart columns
  const [chartXCol, setChartXCol] = useState<number>(0);
  const [chartYCol, setChartYCol] = useState<number>(1);

  // Filter rows based on search
  const filteredResult = useMemo(() => {
    if (!result) return null;
    if (!filterText.trim()) return result;

    const lower = filterText.toLowerCase();
    const rows = result.rows.filter((row) =>
      row.some((cell) => cell !== null && String(cell).toLowerCase().includes(lower))
    );

    return {
      ...result,
      rows,
    };
  }, [result, filterText]);

  // Export functions
  const handleCopyJson = () => {
    if (!result) return;
    const jsonObjects = result.rows.map((row) => {
      const obj: Record<string, unknown> = {};
      result.columns.forEach((col, idx) => {
        obj[col.name] = row[idx];
      });
      return obj;
    });

    navigator.clipboard.writeText(JSON.stringify(jsonObjects, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCsv = () => {
    if (!result) return;
    const headers = result.columns.map((c) => `"${c.name.replace(/"/g, '""')}"`).join(',');
    const rows = result.rows.map((row) =>
      row
        .map((cell) => {
          if (cell === null) return '';
          return `"${String(cell).replace(/"/g, '""')}"`;
        })
        .join(',')
    );

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sqlx_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1. Running State with Sleek Animated SQL Query feedback
  if (isRunning) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-bg-base select-none p-6 space-y-4">
        <div className="relative flex items-center justify-center">
          {/* Subtle pulsating outer ring */}
          <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 animate-ping absolute" />
          <div className="w-12 h-12 rounded-xl bg-bg-surface border border-border-default flex items-center justify-center text-white shadow-lg relative z-10">
            <Database className="w-5 h-5 text-white/90 animate-pulse" strokeWidth={1.5} />
          </div>
        </div>

        <div className="text-center space-y-1.5">
          <div className="flex items-center justify-center space-x-2 text-white text-xs font-semibold tracking-tight">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-white/80" strokeWidth={2} />
            <span>Executing SQL Query...</span>
          </div>
          <p className="text-[11px] font-mono text-tx-muted">
            Transmitting stream buffers &bull; Elapsed:{' '}
            <span className="text-white font-medium">{elapsedSeconds.toFixed(1)}s</span>
          </p>
        </div>

        {/* Shimmering loading bar */}
        <div className="w-48 h-1 bg-bg-surface border border-border-subtle rounded-full overflow-hidden">
          <div className="w-full h-full bg-white/40 animate-pulse rounded-full" />
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="w-full h-full p-6 bg-status-error/5 border-t border-status-error/20 text-status-error font-mono text-xs overflow-auto space-y-2">
        <div className="flex items-center space-x-2 font-bold text-sm">
          <AlertCircle className="w-4 h-4 text-status-error flex-shrink-0" strokeWidth={1.5} />
          <span>Execution Failed</span>
        </div>
        <div className="p-3 bg-bg-surface border border-status-error/30 rounded-md whitespace-pre-wrap text-white font-mono text-xs leading-relaxed">
          {error}
        </div>
      </div>
    );
  }

  // 3. Empty State
  if (!result) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-tx-muted text-xs font-mono select-none space-y-1.5 bg-bg-base">
        <div className="w-8 h-8 rounded-lg bg-bg-surface border border-border-subtle flex items-center justify-center text-tx-muted">
          <Terminal className="w-4 h-4 text-white/60" strokeWidth={1.5} />
        </div>
        <p className="font-medium text-white/80 text-xs">Ready to Query</p>
        <p className="text-tx-muted text-[11px]">Select text or press F5 to execute statements.</p>
      </div>
    );
  }

  // 4. Data Results
  return (
    <div className="w-full h-full flex flex-col bg-bg-base overflow-hidden">
      {/* Sub-view switcher bar */}
      <div className="h-9 bg-bg-surface border-b border-border-subtle flex items-center justify-between px-3 text-xs select-none">
        <div className="flex items-center space-x-1 bg-bg-base p-0.5 rounded-md border border-border-subtle">
          <button
            onClick={() => setActiveTab('grid')}
            className={`flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-xs font-medium transition-all ${
              activeTab === 'grid'
                ? 'bg-bg-elevated text-white font-semibold shadow-sm'
                : 'text-tx-secondary hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5 text-white/80" strokeWidth={1.5} />
            <span>Grid ({result.rows.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-xs font-medium transition-all ${
              activeTab === 'json'
                ? 'bg-bg-elevated text-white font-semibold shadow-sm'
                : 'text-tx-secondary hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-white/80" strokeWidth={1.5} />
            <span>JSON</span>
          </button>

          <button
            onClick={() => setActiveTab('chart')}
            className={`flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-xs font-medium transition-all ${
              activeTab === 'chart'
                ? 'bg-bg-elevated text-white font-semibold shadow-sm'
                : 'text-tx-secondary hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-white/80" strokeWidth={1.5} />
            <span>Chart</span>
          </button>

          <button
            onClick={() => setActiveTab('structure')}
            className={`flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-xs font-medium transition-all ${
              activeTab === 'structure'
                ? 'bg-bg-elevated text-white font-semibold shadow-sm'
                : 'text-tx-secondary hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5 text-white/80" strokeWidth={1.5} />
            <span>Schema</span>
          </button>
        </div>

        {/* Search & Export Actions */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2 top-2 text-tx-muted" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search rows..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-36 bg-bg-base border border-border-subtle rounded pl-7 pr-2 py-0.5 text-xs text-white focus:outline-none focus:border-border-strong font-mono placeholder:text-tx-muted transition-colors"
            />
          </div>

          <div className="h-3.5 w-[1px] bg-border-subtle" />

          <button
            onClick={handleCopyJson}
            className="flex items-center space-x-1 px-2 py-0.5 rounded bg-bg-surface hover:bg-bg-overlay border border-border-subtle text-tx-secondary hover:text-white transition-all text-xs font-mono"
            title="Copy as JSON"
          >
            {copied ? (
              <Check className="w-3 h-3 text-white" strokeWidth={1.5} />
            ) : (
              <Copy className="w-3 h-3 text-white/80" strokeWidth={1.5} />
            )}
            <span>{copied ? 'Copied' : 'JSON'}</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1 px-2 py-0.5 rounded bg-bg-surface hover:bg-bg-overlay border border-border-subtle text-tx-secondary hover:text-white transition-all text-xs font-mono"
            title="Export CSV"
          >
            <Download className="w-3 h-3 text-white/80" strokeWidth={1.5} />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Main Viewport Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'grid' && <DataGrid data={filteredResult} />}

        {activeTab === 'json' && (
          <div className="w-full h-full p-4 bg-editor-bg overflow-auto font-mono text-xs text-white select-text">
            <pre className="leading-relaxed">
              {JSON.stringify(
                result.rows.map((row) => {
                  const obj: Record<string, unknown> = {};
                  result.columns.forEach((col, idx) => {
                    obj[col.name] = row[idx];
                  });
                  return obj;
                }),
                null,
                2
              )}
            </pre>
          </div>
        )}

        {activeTab === 'chart' && (
          <div className="w-full h-full p-6 flex flex-col space-y-4 overflow-auto bg-bg-base font-sans">
            <div className="flex items-center space-x-6 text-xs bg-bg-surface p-3 rounded-lg border border-border-subtle">
              <div className="flex items-center space-x-2">
                <span className="text-tx-secondary font-medium">Category (X):</span>
                <select
                  value={chartXCol}
                  onChange={(e) => setChartXCol(Number(e.target.value))}
                  className="bg-bg-base border border-border-subtle rounded px-2 py-1 text-white font-mono focus:outline-none"
                >
                  {result.columns.map((c, i) => (
                    <option key={c.name} value={i}>
                      {c.name} ({c.dataType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-tx-secondary font-medium">Metric (Y):</span>
                <select
                  value={chartYCol}
                  onChange={(e) => setChartYCol(Number(e.target.value))}
                  className="bg-bg-base border border-border-subtle rounded px-2 py-1 text-white font-mono focus:outline-none"
                >
                  {result.columns.map((c, i) => (
                    <option key={c.name} value={i}>
                      {c.name} ({c.dataType})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Minimalist Solid Bar Chart */}
            <div className="flex-1 min-h-[260px] bg-bg-surface border border-border-subtle rounded-lg p-6 flex items-end space-x-3 overflow-x-auto">
              {result.rows.slice(0, 40).map((row, idx) => {
                const label = String(row[chartXCol] ?? `Item ${idx + 1}`);
                const rawVal = Number(row[chartYCol]);
                const val = Number.isNaN(rawVal) ? 0 : rawVal;
                const maxVal = Math.max(
                  ...result.rows.map((r) => {
                    const n = Number(r[chartYCol]);
                    return Number.isNaN(n) ? 0 : n;
                  }),
                  1
                );
                const heightPct = Math.max((val / maxVal) * 100, 4);

                return (
                  <div
                    key={label + idx}
                    className="flex-1 min-w-[36px] flex flex-col items-center justify-end h-full group"
                  >
                    <span className="text-[10px] font-mono text-tx-muted opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-semibold">
                      {val}
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-white/70 rounded-t-sm group-hover:bg-white transition-all"
                    />
                    <span className="text-[10px] font-mono text-tx-secondary truncate w-full text-center mt-1.5">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'structure' && (
          <div className="w-full h-full p-6 overflow-auto bg-bg-base font-mono text-xs">
            <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-bg-overlay text-tx-secondary border-b border-border-subtle text-[11px] uppercase tracking-wider">
                    <th className="p-3 border-r border-border-subtle">Index</th>
                    <th className="p-3 border-r border-border-subtle">Column Name</th>
                    <th className="p-3 border-r border-border-subtle">Data Type</th>
                    <th className="p-3">Nullable</th>
                  </tr>
                </thead>
                <tbody>
                  {result.columns.map((col, idx) => (
                    <tr
                      key={col.name}
                      className="border-b border-border-subtle hover:bg-bg-overlay/50 transition-colors"
                    >
                      <td className="p-3 border-r border-border-subtle text-tx-muted text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="p-3 border-r border-border-subtle font-bold text-white">
                        {col.name}
                      </td>
                      <td className="p-3 border-r border-border-subtle text-white/90 uppercase font-mono">
                        {col.dataType}
                      </td>
                      <td className="p-3 text-tx-secondary">{col.nullable ? 'YES' : 'NO'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
