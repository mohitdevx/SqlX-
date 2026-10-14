import { Toast } from '@/components/ui/molecules/Toast';
import type { QueryResult } from '@/types/database';
import { type QueryRow, type QueryRowValue, applyDataTransform } from '@/utils/dataTransforms';
import { copyJsonToClipboard, downloadCsvFile, downloadJsonFile } from '@/utils/exportUtils';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { type ResultsTab, ResultsToolbar } from './ResultsToolbar';
import { ChartView } from './views/ChartView';
import { EmptyStateView } from './views/EmptyStateView';
import { ErrorStateView } from './views/ErrorStateView';
import { GridView } from './views/GridView';
import { JsonView } from './views/JsonView';
import { RunningStateView } from './views/RunningStateView';
import { SchemaView } from './views/SchemaView';

export interface ResultsPanelProps {
  result: QueryResult | null;
  error: string | null;
  isRunning?: boolean;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ result, error, isRunning }) => {
  const [activeTab, setActiveTab] = useState<ResultsTab>('grid');
  const [filterText, setFilterText] = useState('');
  const [copied, setCopied] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Data manipulation state from extensions
  const [manipulatedRows, setManipulatedRows] = useState<QueryRow[] | null>(null);
  const [activeManipulationLabel, setActiveManipulationLabel] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
  const handleCopyJson = async () => {
    if (!effectiveResult) return;
    await copyJsonToClipboard(jsonObjects);
    setCopied(true);
    setToastMessage('Copied JSON to clipboard');
    setTimeout(() => {
      setCopied(false);
      setToastMessage(null);
    }, 2000);
  };

  const handleExportJson = () => {
    if (!effectiveResult) return;
    downloadJsonFile(jsonObjects);
    setToastMessage('Exported results as JSON file');
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleExportCsv = () => {
    if (!effectiveResult) return;
    downloadCsvFile(effectiveResult.columns, effectiveResult.rows);
    setToastMessage('Exported results as CSV file');
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Extension Manipulation Handler
  const handleApplyExtensionOption = (optionId: string) => {
    if (!result) return;
    const currentRows: QueryRow[] = manipulatedRows || result.rows;
    const res = applyDataTransform(optionId, result.columns, currentRows, jsonObjects);

    if (res.newRows) {
      setManipulatedRows(res.newRows);
      if (res.label) setActiveManipulationLabel(res.label);
    }
    if (res.toast) {
      setToastMessage(res.toast);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleResetManipulation = () => {
    setManipulatedRows(null);
    setActiveManipulationLabel(null);
    setToastMessage('Reset to original query output');
    setTimeout(() => setToastMessage(null), 2500);
  };

  // 1. Running State
  if (isRunning) {
    return <RunningStateView elapsedSeconds={elapsedSeconds} />;
  }

  // 2. Error State
  if (error) {
    return <ErrorStateView error={error} />;
  }

  // 3. Empty State
  if (!result || !effectiveResult) {
    return <EmptyStateView />;
  }

  // 4. Data Results Viewport
  return (
    <div className="w-full h-full flex flex-col bg-bg-base overflow-hidden">
      <Toast message={toastMessage} />

      <ResultsToolbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        rowCount={effectiveResult.rows.length}
        columnCount={result.columns.length}
        activeManipulationLabel={activeManipulationLabel}
        onResetManipulation={handleResetManipulation}
        filterText={filterText}
        setFilterText={setFilterText}
        onApplyExtensionOption={handleApplyExtensionOption}
        onExportJson={handleExportJson}
        onExportCsv={handleExportCsv}
        onCopyJson={handleCopyJson}
        copied={copied}
      />

      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'grid' && <GridView data={filteredResult} />}
        {activeTab === 'json' && <JsonView jsonObjects={jsonObjects} />}
        {activeTab === 'chart' && <ChartView result={result} effectiveResult={effectiveResult} />}
        {activeTab === 'structure' && <SchemaView columns={result.columns} />}
      </div>
    </div>
  );
};
export default ResultsPanel;
