import { Button } from '@/components/ui/atoms/Button';
import { Input } from '@/components/ui/atoms/Input';
import { Modal } from '@/components/ui/molecules/Modal';
import type { ColumnMetadata } from '@/types/database';
import { Check, Copy, ExternalLink, Play } from 'lucide-react';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { generateUpdateRowSql } from './sqlHelpers';

export interface UpdateRowModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnMetadata[];
  row: (string | number | boolean | null | object)[] | null;
  rowIndex: number;
  tableName: string;
  driver?: string;
  onExecuteUpdate: (
    sql: string,
    updatedRow: (string | number | boolean | null | object)[]
  ) => Promise<void>;
  onOpenInEditor: (sql: string) => void;
}

export const UpdateRowModal: React.FC<UpdateRowModalProps> = ({
  isOpen,
  onClose,
  columns,
  row,
  rowIndex,
  tableName: initialTableName,
  driver,
  onExecuteUpdate,
  onOpenInEditor,
}) => {
  const [tableName, setTableName] = useState(initialTableName || 'table_name');
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (row && isOpen) {
      setTableName(initialTableName || 'table_name');
      const vals: Record<string, string> = {};
      columns.forEach((col, idx) => {
        vals[col.name] = row[idx] !== null && row[idx] !== undefined ? String(row[idx]) : '';
      });
      setFieldValues(vals);
    }
  }, [row, columns, initialTableName, isOpen]);

  const generatedSql = useMemo(() => {
    if (!row) return '';
    return generateUpdateRowSql(
      tableName || 'table_name',
      columns,
      row,
      fieldValues,
      undefined,
      driver
    );
  }, [tableName, columns, row, fieldValues, driver]);

  if (!row) return null;

  const handleExecute = async () => {
    setIsSubmitting(true);
    try {
      // Build new row representation
      const updatedRow = columns.map((col, idx) => {
        const val = fieldValues[col.name];
        if (val === undefined || val === '') {
          // If original was null or changed to empty
          return row[idx] === null ? null : val;
        }
        // Try parsing number if original was number
        if (typeof row[idx] === 'number') {
          const num = Number(val);
          return Number.isNaN(num) ? val : num;
        }
        return val;
      });

      await onExecuteUpdate(generatedSql, updatedRow);
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
          <span>Update Row #{rowIndex + 1}</span>
          <span className="text-[11px] font-mono font-normal text-tx-muted px-2 py-0.5 rounded bg-white/[0.05]">
            {tableName}
          </span>
        </div>
      }
      maxWidth="lg"
    >
      <div className="space-y-4 font-sans text-xs">
        {/* Table Name Specifier */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-tx-secondary">Target Table:</label>
          <Input
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="table_name"
            className="font-mono text-xs"
          />
        </div>

        {/* Row Values Grid */}
        <div className="space-y-2">
          <div className="text-[11px] font-medium text-tx-secondary">Column Values:</div>
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {columns.map((col) => {
              return (
                <div
                  key={col.name}
                  className="flex flex-col space-y-1 bg-white/[0.02] p-2 rounded-lg border border-white/[0.04]"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono font-medium text-tx-primary">{col.name}</span>
                    <span className="font-mono text-[10px] text-tx-muted uppercase">
                      {col.dataType}
                    </span>
                  </div>
                  <Input
                    value={fieldValues[col.name] ?? ''}
                    onChange={(e) =>
                      setFieldValues((prev) => ({
                        ...prev,
                        [col.name]: e.target.value,
                      }))
                    }
                    placeholder="NULL"
                    className="font-mono text-xs"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Generated SQL Preview */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-tx-secondary">SQL Statement:</span>
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
              <span>Execute Update</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
