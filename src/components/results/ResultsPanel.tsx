import { DataGrid } from '@/components/grid/DataGrid';
import type { QueryResult } from '@/types/database';
import {
  BarChart3,
  Check,
  Code2,
  Copy,
  Download,
  FileSpreadsheet,
  Search,
  Table,
} from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';

interface ResultsPanelProps {
  result: QueryResult | null;
  error: string | null;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ result, error }) => {
  const [activeTab, setActiveTab] = useState<'grid' | 'json' | 'chart' | 'structure'>('grid');
  const [filterText, setFilterText] = useState('');
  const [copied, setCopied] = useState(false);

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
    link.setAttribute('download', `query_result_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) {
    return (
      <div className="w-full h-full p-4 bg-status-error/10 border-t border-status-error/30 text-status-error font-mono text-xs overflow-auto">
        <div className="font-bold mb-1 flex items-center space-x-1.5">
          <span>SQL Execution Error</span>
        </div>
        <p className="whitespace-pre-wrap">{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-tx-muted text-xs font-mono select-none">
        <p>No active result set. Press F5 or Ctrl+Enter to execute a query.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-bg-base overflow-hidden">
      {/* Action and Sub-view bar */}
      <div className="h-9 bg-bg-surface border-b border-border-subtle flex items-center justify-between px-3 text-xs select-none">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('grid')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === 'grid'
                ? 'bg-bg-elevated text-tx-primary font-semibold'
                : 'text-tx-secondary hover:text-tx-primary hover:bg-bg-overlay'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Grid View</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === 'json'
                ? 'bg-bg-elevated text-tx-primary font-semibold'
                : 'text-tx-secondary hover:text-tx-primary hover:bg-bg-overlay'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>JSON Inspector</span>
          </button>

          <button
            onClick={() => setActiveTab('chart')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === 'chart'
                ? 'bg-bg-elevated text-tx-primary font-semibold'
                : 'text-tx-secondary hover:text-tx-primary hover:bg-bg-overlay'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Chart Visualizer</span>
          </button>

          <button
            onClick={() => setActiveTab('structure')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === 'structure'
                ? 'bg-bg-elevated text-tx-primary font-semibold'
                : 'text-tx-secondary hover:text-tx-primary hover:bg-bg-overlay'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Columns ({result.columns.length})</span>
          </button>
        </div>

        {/* Search & Export Actions */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-tx-muted" />
            <input
              type="text"
              placeholder="Filter rows..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-36 bg-bg-base border border-border-subtle rounded pl-7 pr-2 py-1 text-xs text-tx-primary focus:outline-none focus:border-accent-primary font-mono placeholder:text-tx-muted"
            />
          </div>

          <button
            onClick={handleCopyJson}
            className="flex items-center space-x-1 px-2 py-1 rounded bg-bg-elevated border border-border-subtle hover:bg-bg-overlay text-tx-secondary hover:text-tx-primary transition-colors text-xs"
            title="Copy as JSON"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-status-success" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copied ? 'Copied!' : 'JSON'}</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1 px-2 py-1 rounded bg-bg-elevated border border-border-subtle hover:bg-bg-overlay text-tx-secondary hover:text-tx-primary transition-colors text-xs"
            title="Export to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Main Viewport Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'grid' && <DataGrid data={filteredResult} />}

        {activeTab === 'json' && (
          <div className="w-full h-full p-3 bg-editor-bg overflow-auto font-mono text-xs text-tx-primary select-text">
            <pre>
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
          <div className="w-full h-full p-4 flex flex-col space-y-4 overflow-auto bg-bg-base">
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-tx-secondary font-medium">X Axis (Category):</span>
                <select
                  value={chartXCol}
                  onChange={(e) => setChartXCol(Number(e.target.value))}
                  className="bg-bg-surface border border-border-subtle rounded px-2 py-1 text-tx-primary font-mono focus:outline-none"
                >
                  {result.columns.map((c, i) => (
                    <option key={c.name} value={i}>
                      {c.name} ({c.dataType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-tx-secondary font-medium">Y Axis (Value):</span>
                <select
                  value={chartYCol}
                  onChange={(e) => setChartYCol(Number(e.target.value))}
                  className="bg-bg-surface border border-border-subtle rounded px-2 py-1 text-tx-primary font-mono focus:outline-none"
                >
                  {result.columns.map((c, i) => (
                    <option key={c.name} value={i}>
                      {c.name} ({c.dataType})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Solid Minimal Bar Chart Visualization */}
            <div className="flex-1 min-h-[220px] bg-bg-surface border border-border-subtle rounded p-4 flex items-end space-x-2 overflow-x-auto">
              {result.rows.slice(0, 50).map((row, idx) => {
                const label = String(row[chartXCol] ?? `Row ${idx + 1}`);
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
                    key={idx}
                    className="flex-1 min-w-[32px] flex flex-col items-center justify-end h-full group"
                  >
                    <span className="text-[10px] font-mono text-tx-muted opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                      {val}
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-accent-primary rounded-t group-hover:bg-accent-hover transition-all"
                    />
                    <span className="text-[10px] font-mono text-tx-secondary truncate w-full text-center mt-1">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'structure' && (
          <div className="w-full h-full p-4 overflow-auto bg-bg-base font-mono text-xs">
            <table className="w-full border-collapse border border-border-subtle text-left">
              <thead>
                <tr className="bg-bg-surface text-tx-secondary border-b border-border-subtle">
                  <th className="p-2 border-r border-border-subtle">Index</th>
                  <th className="p-2 border-r border-border-subtle">Column Name</th>
                  <th className="p-2 border-r border-border-subtle">Data Type</th>
                  <th className="p-2">Nullable</th>
                </tr>
              </thead>
              <tbody>
                {result.columns.map((col, idx) => (
                  <tr key={idx} className="border-b border-border-subtle hover:bg-bg-surface">
                    <td className="p-2 border-r border-border-subtle text-tx-muted">{idx + 1}</td>
                    <td className="p-2 border-r border-border-subtle font-bold text-tx-primary">
                      {col.name}
                    </td>
                    <td className="p-2 border-r border-border-subtle text-accent-primary uppercase">
                      {col.dataType}
                    </td>
                    <td className="p-2 text-tx-secondary">{col.nullable ? 'YES' : 'NO'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
