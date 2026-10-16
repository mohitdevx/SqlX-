import { Button } from '@/components/ui/atoms/Button';
import { Input } from '@/components/ui/atoms/Input';
import { Modal } from '@/components/ui/molecules/Modal';
import type { ColumnMetadata } from '@/types/database';
import { Check, Copy, Edit3, ExternalLink, Play } from 'lucide-react';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { generateClearCellSql, generateUpdateCellSql } from './sqlHelpers';

export interface UpdateCellModalProps {
  isOpen: boolean;
  onClose: () => void;
  column: ColumnMetadata | null;
  colIndex: number;
  row: (string | number | boolean | null | object)[] | null;
  rowIndex: number;
  columns: ColumnMetadata[];
  tableName: string;
  driver?: string;
  onExecuteUpdate: (sql: string, newValue: unknown) => Promise<void>;
  onOpenInEditor: (sql: string) => void;
}

export const UpdateCellModal: React.FC<UpdateCellModalProps> = ({
  isOpen,
  onClose,
  column,
  colIndex,
  row,
  rowIndex,
  columns,
  tableName: initialTableName,
  driver,
  onExecuteUpdate,
  onOpenInEditor,
}) => {
  const [tableName, setTableName] = useState(initialTableName || 'table_name');
  const [cellValue, setCellValue] = useState('');
  const [isNull, setIsNull] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const originalVal = row && colIndex >= 0 ? row[colIndex] : null;

  useEffect(() => {
    if (isOpen && row && column) {
      setTableName(initialTableName || 'table_name');
      const val = row[colIndex];
      if (val === null || val === undefined) {
        setCellValue('');
        setIsNull(true);
      } else {
        setCellValue(String(val));
        setIsNull(false);
      }
    }
  }, [isOpen, row, column, colIndex, initialTableName]);

  const generatedSql = useMemo(() => {
    if (!column || !row) return '';
    const tbl = tableName || 'table_name';

    if (isNull) {
      return generateClearCellSql(tbl, column.name, columns, row, undefined, driver);
    }

    return generateUpdateCellSql(tbl, column.name, cellValue, columns, row, undefined, driver);
  }, [column, row, tableName, isNull, cellValue, columns, driver]);

  if (!column || !row) return null;

  const handleExecute = async () => {
    setIsSubmitting(true);
    try {
      let finalVal: unknown = isNull ? null : cellValue;
      if (!isNull && typeof originalVal === 'number') {
        const num = Number(cellValue);
        if (!Number.isNaN(num)) finalVal = num;
      }
      await onExecuteUpdate(generatedSql, finalVal);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(generatedSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 1500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center space-x-2">
          <Edit3 className="w-4 h-4 text-sky-400" />
          <span>
            Update "{column.name}" in Row #{rowIndex + 1}
          </span>
        </div>
      }
      maxWidth="md"
    >
      <div className="space-y-4 font-sans text-xs">
        <div className="text-[11px] text-tx-secondary">
          Updates only this specific cell in the selected row.
        </div>

        {/* Target Table */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-tx-secondary">Target Table:</label>
          <Input
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="table_name"
            className="font-mono text-xs"
          />
        </div>

        {/* Value Input */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-medium text-tx-secondary">
              Value for "{column.name}" ({column.dataType}):
            </label>
            <button
              type="button"
              onClick={() => {
                setIsNull((prev) => !prev);
                if (!isNull) setCellValue('');
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                isNull
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-white/[0.05] text-tx-muted hover:text-tx-primary'
              }`}
            >
              {isNull ? 'SET NULL (Active)' : 'Set NULL'}
            </button>
          </div>

          <Input
            value={cellValue}
            onChange={(e) => {
              setCellValue(e.target.value);
              setIsNull(false);
            }}
            disabled={isNull}
            placeholder={isNull ? 'NULL' : 'Enter new value...'}
            className="font-mono text-xs"
            autoFocus
          />
        </div>

        {/* Generated SQL Statement */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-tx-secondary">Strict SQL Statement:</span>
            <button
              type="button"
              onClick={handleCopySql}
              className="flex items-center space-x-1 text-tx-muted hover:text-tx-primary text-[10px] font-mono cursor-pointer transition-colors"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy SQL</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-2.5 rounded-lg bg-[#0d0d10] border border-white/10 font-mono text-[11px] text-emerald-400 overflow-x-auto whitespace-pre-wrap">
            {generatedSql}
          </pre>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onOpenInEditor(generatedSql);
              onClose();
            }}
            className="flex items-center space-x-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open in Editor</span>
          </Button>

          <div className="flex items-center space-x-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              onClick={handleExecute}
              className="flex items-center space-x-1.5"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Apply Update</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
