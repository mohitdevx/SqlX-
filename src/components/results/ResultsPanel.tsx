import { DataGrid } from '@/components/grid/DataGrid';
import type { QueryResult } from '@/types/database';
import {
  AlertCircle,
  BarChart3,
  Boxes,
  ChevronDown,
  Clipboard,
  ClipboardCheck,
  Code2,
  Columns,
  Database,
  Download,
  FileSpreadsheet,
  Loader2,
  RotateCcw,
  Search,
  Shield,
  Sparkles,
  Table,
  Terminal,
  Wand2,
  X,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

type QueryRowValue = string | number | boolean | null | object;
type QueryRow = QueryRowValue[];

interface ResultsPanelProps {
  result: QueryResult | null;
  error: string | null;
  isRunning?: boolean;
}

interface ExtensionOption {
  id: string;
  name: string;
  description: string;
  badge?: string;
}

interface DataExtension {
  id: string;
  name: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  options: ExtensionOption[];
}

const DATA_EXTENSIONS: DataExtension[] = [
  {
    id: 'transformer',
    name: 'Data Transformer',
    description: 'Transform casing, whitespace, and ordering of active rows',
    icon: Wand2,
    options: [
      {
        id: 'uppercase',
        name: 'Uppercase Text Fields',
        description: 'Convert all text columns to uppercase',
        badge: 'Transform',
      },
      {
        id: 'lowercase',
        name: 'Lowercase Text Fields',
        description: 'Convert all text columns to lowercase',
        badge: 'Transform',
      },
      {
        id: 'trim',
        name: 'Trim Whitespace',
        description: 'Strip leading and trailing spaces from text cells',
        badge: 'Clean',
      },
      {
        id: 'reverse',
        name: 'Reverse Row Order',
        description: 'Invert the row order of the active result set',
        badge: 'Order',
      },
      {
        id: 'sort_asc',
        name: 'Sort Ascending (Col 1)',
        description: 'Sort records alphabetically/numerically by column 1',
        badge: 'Sort',
      },
      {
        id: 'sort_desc',
        name: 'Sort Descending (Col 1)',
        description: 'Sort records descending by column 1',
        badge: 'Sort',
      },
    ],
  },
  {
    id: 'anonymizer',
    name: 'PII Anonymizer',
    description: 'Mask emails, phone numbers, and sensitive credential fields',
    icon: Shield,
    options: [
      {
        id: 'mask_emails',
        name: 'Mask Email Addresses',
        description: 'Obfuscate emails (e.g. j***@domain.com)',
        badge: 'Privacy',
      },
      {
        id: 'mask_phones',
        name: 'Mask Phone Numbers',
        description: 'Conceal numbers (e.g. ***-***-1234)',
        badge: 'Privacy',
      },
      {
        id: 'redact_secrets',
        name: 'Redact Passwords & Secrets',
        description: 'Replace password/token/key columns with [REDACTED]',
        badge: 'Security',
      },
      {
        id: 'anonymize_ids',
        name: 'Hash Identifiers',
        description: 'Convert numeric IDs to pseudonymous hash hexes',
        badge: 'Mask',
      },
    ],
  },
  {
    id: 'exporter',
    name: 'Universal Exporter',
    description: 'Format and copy rows as Markdown, SQL INSERT, or NDJSON',
    icon: FileSpreadsheet,
    options: [
      {
        id: 'markdown_table',
        name: 'Copy as Markdown Table',
        description: 'Format current rows into GitHub Flavored Markdown table',
        badge: 'Copy',
      },
      {
        id: 'sql_inserts',
        name: 'Copy as SQL INSERTs',
        description: 'Generate INSERT INTO statements for current rows',
        badge: 'Copy',
      },
      {
        id: 'ndjson',
        name: 'Copy as NDJSON',
        description: 'Format current rows as newline-delimited JSON',
        badge: 'Copy',
      },
      {
        id: 'html_table',
        name: 'Copy as HTML Table',
        description: 'Generate clean <table> markup for the result set',
        badge: 'Copy',
      },
    ],
  },
  {
    id: 'aggregator',
    name: 'Data Analytics & Stats',
    description: 'Compute summaries, aggregates, and deduplicate rows',
    icon: BarChart3,
    options: [
      {
        id: 'deduplicate',
        name: 'Deduplicate Rows',
        description: 'Filter out identical repeating record rows',
        badge: 'Filter',
      },
      {
        id: 'append_totals',
        name: 'Compute Column Totals',
        description: 'Append a summary row totaling all numeric columns',
        badge: 'Aggregate',
      },
    ],
  },
];

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ result, error, isRunning }) => {
  const [activeTab, setActiveTab] = useState<'grid' | 'json' | 'chart' | 'structure'>('grid');
  const [filterText, setFilterText] = useState('');
  const [copied, setCopied] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Data manipulation state from extensions
  const [manipulatedRows, setManipulatedRows] = useState<QueryRow[] | null>(null);
  const [activeManipulationLabel, setActiveManipulationLabel] = useState<string | null>(null);

  // Extensions dropdown menu state
  const [showExtensionsMenu, setShowExtensionsMenu] = useState(false);
  const [selectedExtensionId, setSelectedExtensionId] = useState<string>('transformer');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const extensionsMenuRef = useRef<HTMLDivElement>(null);

  // Close extensions menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (extensionsMenuRef.current && !extensionsMenuRef.current.contains(e.target as Node)) {
        setShowExtensionsMenu(false);
      }
    };
    if (showExtensionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExtensionsMenu]);

  // Reset manipulated rows when incoming result changes
  useEffect(() => {
    if (result !== undefined) {
      setManipulatedRows(null);
      setActiveManipulationLabel(null);
    }
  }, [result]);

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

  // Effective rows (original or manipulated)
  const effectiveResult = useMemo<QueryResult | null>(() => {
    if (!result) return null;
    const currentRows: QueryRow[] = manipulatedRows || result.rows;
    return {
      ...result,
      rows: currentRows,
    };
  }, [result, manipulatedRows]);

  // Filter rows based on search
  const filteredResult = useMemo<QueryResult | null>(() => {
    if (!effectiveResult) return null;
    if (!filterText.trim()) return effectiveResult;

    const lower = filterText.toLowerCase();
    const rows = effectiveResult.rows.filter((row: QueryRow) =>
      row.some((cell: QueryRowValue) => cell !== null && String(cell).toLowerCase().includes(lower))
    );

    return {
      ...effectiveResult,
      rows,
    };
  }, [effectiveResult, filterText]);

  // JSON objects generation
  const jsonObjects = useMemo(() => {
    if (!effectiveResult) return [];
    return effectiveResult.rows.map((row: QueryRow) => {
      const obj: Record<string, unknown> = {};
      effectiveResult.columns.forEach((col, idx) => {
        obj[col.name] = row[idx];
      });
      return obj;
    });
  }, [effectiveResult]);

  // Export functions
  const handleCopyJson = () => {
    if (!effectiveResult) return;
    const fullJson = JSON.stringify(jsonObjects, null, 2);
    navigator.clipboard.writeText(fullJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCsv = () => {
    if (!effectiveResult) return;
    const headers = effectiveResult.columns.map((c) => `"${c.name.replace(/"/g, '""')}"`).join(',');
    const rows = effectiveResult.rows.map((row: QueryRow) =>
      row
        .map((cell: QueryRowValue) => {
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

  // Extension Manipulation Handler
  const handleApplyExtensionOption = (optionId: string) => {
    if (!result) return;
    const currentRows: QueryRow[] = manipulatedRows || result.rows;
    let newRows: QueryRow[] = currentRows.map((r: QueryRow) => [...r]);
    let label = '';
    let toast = '';

    switch (optionId) {
      case 'uppercase':
        newRows = newRows.map((r) => r.map((c) => (typeof c === 'string' ? c.toUpperCase() : c)));
        label = 'Uppercase Text';
        toast = 'Converted text columns to UPPERCASE';
        break;

      case 'lowercase':
        newRows = newRows.map((r) => r.map((c) => (typeof c === 'string' ? c.toLowerCase() : c)));
        label = 'Lowercase Text';
        toast = 'Converted text columns to lowercase';
        break;

      case 'trim':
        newRows = newRows.map((r) => r.map((c) => (typeof c === 'string' ? c.trim() : c)));
        label = 'Trimmed Whitespace';
        toast = 'Trimmed whitespace across all text cells';
        break;

      case 'reverse':
        newRows = [...newRows].reverse();
        label = 'Reversed Order';
        toast = 'Inverted row sequence';
        break;

      case 'sort_asc':
        newRows = [...newRows].sort((a, b) => {
          const valA = a[0] ?? '';
          const valB = b[0] ?? '';
          return String(valA).localeCompare(String(valB), undefined, { numeric: true });
        });
        label = 'Sorted ASC';
        toast = 'Sorted rows ascending by column 1';
        break;

      case 'sort_desc':
        newRows = [...newRows].sort((a, b) => {
          const valA = a[0] ?? '';
          const valB = b[0] ?? '';
          return String(valB).localeCompare(String(valA), undefined, { numeric: true });
        });
        label = 'Sorted DESC';
        toast = 'Sorted rows descending by column 1';
        break;

      case 'mask_emails':
        newRows = newRows.map((r) =>
          r.map((c) => {
            if (typeof c === 'string' && c.includes('@')) {
              return c.replace(/^([^@]{1,2})[^@]*(@.+)$/, '$1***$2');
            }
            return c;
          })
        );
        label = 'Masked Emails';
        toast = 'Masked email addresses in results';
        break;

      case 'mask_phones':
        newRows = newRows.map((r) =>
          r.map((c) => {
            const str = String(c ?? '');
            const cleaned = str.replace(/[-()\s]/g, '');
            if (/^\+?\d{7,15}$/.test(cleaned)) {
              return `***-***-${cleaned.slice(-4)}`;
            }
            return c;
          })
        );
        label = 'Masked Phones';
        toast = 'Masked phone numbers in results';
        break;

      case 'redact_secrets':
        newRows = newRows.map((r) =>
          r.map((c, colIdx) => {
            const colName = result.columns[colIdx]?.name.toLowerCase() || '';
            if (
              colName.includes('pass') ||
              colName.includes('secret') ||
              colName.includes('token') ||
              colName.includes('key') ||
              colName.includes('auth') ||
              colName.includes('ssn')
            ) {
              return '[REDACTED]';
            }
            return c;
          })
        );
        label = 'Redacted Secrets';
        toast = 'Redacted credential and token columns';
        break;

      case 'anonymize_ids':
        newRows = newRows.map((r) =>
          r.map((c, colIdx) => {
            const colName = result.columns[colIdx]?.name.toLowerCase() || '';
            if (colName === 'id' || colName.endsWith('_id')) {
              const hash = Math.abs(
                String(c)
                  .split('')
                  .reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
              )
                .toString(16)
                .padStart(6, '0')
                .slice(0, 8);
              return `anon_${hash}`;
            }
            return c;
          })
        );
        label = 'Hashed IDs';
        toast = 'Anonymized identifier columns';
        break;

      case 'deduplicate': {
        const seen = new Set<string>();
        newRows = newRows.filter((r) => {
          const key = JSON.stringify(r);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        label = 'Deduplicated';
        toast = `Retained ${newRows.length} unique rows`;
        break;
      }

      case 'append_totals': {
        const totalsRow: (string | number | null)[] = result.columns.map((_col, idx) => {
          if (idx === 0) return 'TOTAL';
          const nums = newRows.map((r) => Number(r[idx])).filter((n) => !Number.isNaN(n));
          if (nums.length === newRows.length && nums.length > 0) {
            return +nums.reduce((acc, curr) => acc + curr, 0).toFixed(2);
          }
          return null;
        });
        newRows = [...newRows, totalsRow];
        label = 'Appended Totals';
        toast = 'Added numeric totals row';
        break;
      }

      case 'markdown_table': {
        const headers = `| ${result.columns.map((c) => c.name).join(' | ')} |`;
        const separator = `| ${result.columns.map(() => '---').join(' | ')} |`;
        const mdRows = currentRows
          .map(
            (r: QueryRow) =>
              `| ${r.map((c: QueryRowValue) => (c === null ? 'NULL' : String(c).replace(/\|/g, '\\|'))).join(' | ')} |`
          )
          .join('\n');
        navigator.clipboard.writeText([headers, separator, mdRows].join('\n'));
        toast = 'Copied Markdown table to clipboard!';
        break;
      }

      case 'sql_inserts': {
        const tableName = 'query_export';
        const colNames = result.columns.map((c) => `"${c.name}"`).join(', ');
        const sqlRows = currentRows
          .map((r: QueryRow) => {
            const vals = r
              .map((c: QueryRowValue) => {
                if (c === null) return 'NULL';
                if (typeof c === 'number') return String(c);
                return `'${String(c).replace(/'/g, "''")}'`;
              })
              .join(', ');
            return `INSERT INTO ${tableName} (${colNames}) VALUES (${vals});`;
          })
          .join('\n');
        navigator.clipboard.writeText(sqlRows);
        toast = 'Copied SQL INSERTs to clipboard!';
        break;
      }

      case 'ndjson': {
        const ndjson = jsonObjects.map((obj) => JSON.stringify(obj)).join('\n');
        navigator.clipboard.writeText(ndjson);
        toast = 'Copied NDJSON rows to clipboard!';
        break;
      }

      case 'html_table': {
        const ths = result.columns.map((c) => `<th>${c.name}</th>`).join('');
        const trs = currentRows
          .map(
            (r: QueryRow) =>
              `<tr>${r.map((c: QueryRowValue) => `<td>${c === null ? '' : String(c)}</td>`).join('')}</tr>`
          )
          .join('\n');
        const html = `<table>\n<thead><tr>${ths}</tr></thead>\n<tbody>\n${trs}\n</tbody>\n</table>`;
        navigator.clipboard.writeText(html);
        toast = 'Copied HTML table to clipboard!';
        break;
      }

      default:
        break;
    }

    if (
      [
        'uppercase',
        'lowercase',
        'trim',
        'reverse',
        'sort_asc',
        'sort_desc',
        'mask_emails',
        'mask_phones',
        'redact_secrets',
        'anonymize_ids',
        'deduplicate',
        'append_totals',
      ].includes(optionId)
    ) {
      setManipulatedRows(newRows);
      setActiveManipulationLabel(label);
    }

    setToastMessage(toast);
    setTimeout(() => setToastMessage(null), 3000);
    setShowExtensionsMenu(false);
  };

  const handleResetManipulation = () => {
    setManipulatedRows(null);
    setActiveManipulationLabel(null);
    setToastMessage('Reset to original query output');
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Safe JSON Token Highlighter
  const renderHighlightedJson = () => {
    const displayObjects = jsonObjects.slice(0, 300);
    const raw = JSON.stringify(displayObjects, null, 2);
    const lines = raw.split('\n');

    return lines.map((line, lineIdx) => {
      const tokenRegex =
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?|[{}[\],:]|[^\s"{}[\],:]+)/g;
      const tokens: React.ReactNode[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null = null;

      while (true) {
        match = tokenRegex.exec(line);
        if (match === null) break;
        if (match.index > lastIndex) {
          tokens.push(line.slice(lastIndex, match.index));
        }
        const val = match[0];
        const keyId = `${lineIdx}-${match.index}`;

        if (val.startsWith('"')) {
          if (val.endsWith(':')) {
            tokens.push(
              <span key={`${keyId}-k`} className="text-sky-400 font-medium">
                {val.slice(0, -1)}
              </span>
            );
            tokens.push(
              <span key={`${keyId}-c`} className="text-tx-muted/60">
                :
              </span>
            );
          } else {
            tokens.push(
              <span key={`${keyId}-s`} className="text-emerald-300">
                {val}
              </span>
            );
          }
        } else if (/^(?:true|false)$/.test(val)) {
          tokens.push(
            <span key={`${keyId}-b`} className="text-amber-400 font-semibold">
              {val}
            </span>
          );
        } else if (val === 'null') {
          tokens.push(
            <span key={`${keyId}-n`} className="text-rose-400/80 italic font-mono">
              {val}
            </span>
          );
        } else if (/^-?\d/.test(val)) {
          tokens.push(
            <span key={`${keyId}-num`} className="text-purple-300 font-mono">
              {val}
            </span>
          );
        } else if (/[{}[\],:]/.test(val)) {
          tokens.push(
            <span key={`${keyId}-p`} className="text-tx-muted/70">
              {val}
            </span>
          );
        } else {
          tokens.push(val);
        }
        lastIndex = tokenRegex.lastIndex;
      }

      if (lastIndex < line.length) {
        tokens.push(line.slice(lastIndex));
      }

      return (
        <div key={lineIdx} className="leading-relaxed whitespace-pre font-mono text-xs">
          {tokens}
        </div>
      );
    });
  };

  // 1. Running State with Sleek Animated SQL Query feedback
  if (isRunning) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-bg-base select-none p-6 space-y-4">
        <div className="relative flex items-center justify-center">
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
  if (!result || !effectiveResult) {
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

  const selectedExtension =
    DATA_EXTENSIONS.find((e) => e.id === selectedExtensionId) || DATA_EXTENSIONS[0];

  // 4. Data Results Viewport
  return (
    <div className="w-full h-full flex flex-col bg-bg-base overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-12 right-6 z-50 bg-bg-overlay border border-white/10 px-3.5 py-1.5 rounded-lg shadow-xl text-xs text-tx-primary font-mono flex items-center space-x-2 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-accent-primary" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Redesigned Top Panel Bar */}
      <div className="h-10 bg-bg-surface/90 border-b border-border-subtle flex items-center justify-between px-3 text-xs select-none relative z-30">
        {/* Left Side: Segmented Mode Selector & Meta */}
        <div className="flex items-center space-x-2.5 min-w-0">
          {/* Segmented Tab Pill Controller */}
          <div className="flex items-center space-x-0.5 p-0.5 rounded-lg bg-white/[0.04]">
            <button
              onClick={() => setActiveTab('grid')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'grid'
                  ? 'bg-white/[0.08] text-tx-primary font-semibold shadow-xs'
                  : 'text-tx-muted hover:text-tx-primary'
              }`}
            >
              <Table className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Grid ({effectiveResult.rows.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('json')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'json'
                  ? 'bg-white/[0.08] text-tx-primary font-semibold shadow-xs'
                  : 'text-tx-muted hover:text-tx-primary'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>JSON</span>
            </button>

            <button
              onClick={() => setActiveTab('chart')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'chart'
                  ? 'bg-white/[0.08] text-tx-primary font-semibold shadow-xs'
                  : 'text-tx-muted hover:text-tx-primary'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Chart</span>
            </button>

            <button
              onClick={() => setActiveTab('structure')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'structure'
                  ? 'bg-white/[0.08] text-tx-primary font-semibold shadow-xs'
                  : 'text-tx-muted hover:text-tx-primary'
              }`}
            >
              <Columns className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Schema ({result.columns.length})</span>
            </button>
          </div>

          {/* Active Data Manipulation Badge */}
          {activeManipulationLabel && (
            <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-[11px] font-mono">
              <Sparkles className="w-3 h-3 shrink-0" />
              <span>{activeManipulationLabel}</span>
              <button
                onClick={handleResetManipulation}
                className="hover:text-tx-primary ml-1 text-tx-muted p-0.5 transition-colors cursor-pointer"
                title="Reset to original query output"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Search, Extensions Menu, Copy Clipboard, Export */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Quick Filter */}
          <div className="relative">
            <Search
              className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-tx-muted"
              strokeWidth={1.5}
            />
            <input
              type="text"
              placeholder="Search rows..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-32 sm:w-40 bg-white/[0.04] focus:bg-white/[0.07] rounded-lg pl-7 pr-2 py-1 text-xs text-tx-primary placeholder:text-tx-muted focus:outline-none font-sans transition-colors"
            />
          </div>

          <div className="h-4 w-[1px] bg-white/10" />

          {/* Extensions Menu Button & Popover */}
          <div className="relative" ref={extensionsMenuRef}>
            <button
              onClick={() => setShowExtensionsMenu((prev) => !prev)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                showExtensionsMenu
                  ? 'bg-white/[0.1] text-tx-primary'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-tx-secondary hover:text-tx-primary'
              }`}
              title="Apply Data Manipulation Extensions"
            >
              <Boxes className="w-3.5 h-3.5 text-accent-primary" />
              <span>Extensions</span>
              <ChevronDown
                className={`w-3 h-3 text-tx-muted transition-transform ${showExtensionsMenu ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Extensions Dropdown Popover */}
            {showExtensionsMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-96 rounded-xl bg-bg-surface border border-white/10 shadow-2xl p-3 z-50 space-y-3 animate-fade-in font-sans">
                {/* Popover Header */}
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center space-x-1.5">
                    <Boxes className="w-4 h-4 text-accent-primary" />
                    <span className="text-xs font-semibold text-tx-primary">Data Extensions</span>
                  </div>
                  {activeManipulationLabel && (
                    <button
                      onClick={handleResetManipulation}
                      className="flex items-center space-x-1 text-[11px] text-tx-muted hover:text-tx-primary px-1.5 py-0.5 rounded hover:bg-white/[0.04] transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                {/* 1. Select Extension */}
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-mono text-tx-muted tracking-wider">
                    Select Extension
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {DATA_EXTENSIONS.map((ext) => {
                      const Icon = ext.icon;
                      const isSel = ext.id === selectedExtensionId;
                      return (
                        <button
                          key={ext.id}
                          onClick={() => setSelectedExtensionId(ext.id)}
                          className={`flex items-center space-x-2 p-2 rounded-lg text-left text-xs transition-all cursor-pointer ${
                            isSel
                              ? 'bg-accent-primary/15 text-tx-primary border border-accent-primary/30'
                              : 'bg-white/[0.03] hover:bg-white/[0.06] text-tx-secondary hover:text-tx-primary'
                          }`}
                        >
                          <Icon
                            className={`w-3.5 h-3.5 shrink-0 ${isSel ? 'text-accent-primary' : 'text-tx-muted'}`}
                          />
                          <span className="truncate font-medium text-[11px]">{ext.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Select Option provided by this extension */}
                <div className="space-y-1 pt-1 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono text-tx-muted tracking-wider">
                      Select Option to Apply
                    </span>
                    <span className="text-[10px] text-tx-muted">
                      {selectedExtension.options.length} actions
                    </span>
                  </div>

                  <div className="max-h-52 overflow-y-auto custom-scrollbar space-y-1 pr-0.5">
                    {selectedExtension.options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleApplyExtensionOption(opt.id)}
                        className="w-full flex items-center justify-between p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.07] text-left transition-all cursor-pointer group"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="text-xs font-medium text-tx-primary group-hover:text-accent-primary transition-colors flex items-center space-x-1.5">
                            <span>{opt.name}</span>
                            {opt.badge && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-white/[0.06] text-tx-muted font-mono">
                                {opt.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-tx-muted truncate mt-0.5">
                            {opt.description}
                          </div>
                        </div>
                        <span className="text-[11px] text-accent-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium shrink-0">
                          Apply &rarr;
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Copy JSON with clean Clipboard icon */}
          <button
            onClick={handleCopyJson}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-tx-secondary hover:text-tx-primary transition-all text-xs font-mono cursor-pointer"
            title="Copy Results as JSON (Clipboard)"
          >
            {copied ? (
              <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
            ) : (
              <Clipboard className="w-3.5 h-3.5 text-tx-muted" strokeWidth={1.5} />
            )}
            <span>{copied ? 'Copied' : 'JSON'}</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-tx-secondary hover:text-tx-primary transition-all text-xs font-mono cursor-pointer"
            title="Export Results as CSV"
          >
            <Download className="w-3.5 h-3.5 text-tx-muted" strokeWidth={1.5} />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Main Viewport Content */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'grid' && <DataGrid data={filteredResult} />}

        {/* Syntax-Highlighted JSON Viewer */}
        {activeTab === 'json' && (
          <div className="w-full h-full flex flex-col bg-editor-bg overflow-hidden select-text">
            {jsonObjects.length > 300 && (
              <div className="px-4 py-1.5 bg-white/[0.02] border-b border-white/5 text-[11px] font-mono text-tx-muted flex items-center justify-between">
                <span>Displaying first 300 rows of {jsonObjects.length} total rows.</span>
                <span className="text-tx-secondary">Full dataset copied via Clipboard</span>
              </div>
            )}
            <div className="flex-1 overflow-auto p-4 custom-scrollbar text-tx-primary">
              {renderHighlightedJson()}
            </div>
          </div>
        )}

        {/* Bar Chart View */}
        {activeTab === 'chart' && (
          <div className="w-full h-full p-6 flex flex-col space-y-4 overflow-auto bg-bg-base font-sans">
            <div className="flex items-center space-x-6 text-xs bg-white/[0.04] p-3 rounded-xl">
              <div className="flex items-center space-x-2">
                <span className="text-tx-secondary font-medium">Category (X):</span>
                <select
                  value={chartXCol}
                  onChange={(e) => setChartXCol(Number(e.target.value))}
                  className="bg-bg-base rounded px-2 py-1 text-tx-primary font-mono focus:outline-none"
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
                  className="bg-bg-base rounded px-2 py-1 text-tx-primary font-mono focus:outline-none"
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
            <div className="flex-1 min-h-[260px] bg-white/[0.03] rounded-xl p-6 flex items-end space-x-3 overflow-x-auto">
              {effectiveResult.rows.slice(0, 40).map((row: QueryRow, idx: number) => {
                const label = String(row[chartXCol] ?? `Item ${idx + 1}`);
                const rawVal = Number(row[chartYCol]);
                const val = Number.isNaN(rawVal) ? 0 : rawVal;
                const maxVal = Math.max(
                  ...effectiveResult.rows.map((r: QueryRow) => {
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

        {/* Schema Structure View */}
        {activeTab === 'structure' && (
          <div className="w-full h-full p-6 overflow-auto bg-bg-base font-mono text-xs">
            <div className="bg-white/[0.04] rounded-xl overflow-hidden">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-white/[0.02] text-tx-secondary text-[11px] uppercase tracking-wider">
                    <th className="p-3">Index</th>
                    <th className="p-3">Column Name</th>
                    <th className="p-3">Data Type</th>
                    <th className="p-3">Nullable</th>
                  </tr>
                </thead>
                <tbody>
                  {result.columns.map((col, idx) => (
                    <tr key={col.name} className="hover:bg-white/[0.03] transition-colors">
                      <td className="p-3 text-tx-muted text-[11px]">{idx + 1}</td>
                      <td className="p-3 font-bold text-tx-primary">{col.name}</td>
                      <td className="p-3 text-tx-secondary uppercase font-mono">{col.dataType}</td>
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
