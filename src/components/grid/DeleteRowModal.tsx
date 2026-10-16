import { Button } from '@/components/ui/atoms/Button';
import { Input } from '@/components/ui/atoms/Input';
import { Modal } from '@/components/ui/molecules/Modal';
import type { ColumnMetadata } from '@/types/database';
import { AlertTriangle, Check, Copy, ExternalLink, Trash2 } from 'lucide-react';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { generateDeleteRowSql } from './sqlHelpers';

export interface DeleteRowModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnMetadata[];
  row: (string | number | boolean | null | object)[] | null;
  rowIndex: number;
  tableName: string;
  driver?: string;
  onExecuteDelete: (sql: string, rowIndex: number) => Promise<void>;
  onOpenInEditor: (sql: string) => void;
}

export const DeleteRowModal: React.FC<DeleteRowModalProps> = ({
  isOpen,
  onClose,
  columns,
  row,
  rowIndex,
  tableName: initialTableName,
  driver,
  onExecuteDelete,
  onOpenInEditor,
}) => {
  const [tableName, setTableName] = useState(initialTableName || 'table_name');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTableName(initialTableName || 'table_name');
    }
  }, [initialTableName, isOpen]);

  const generatedSql = useMemo(() => {
    if (!row) return '';
    return generateDeleteRowSql(tableName || 'table_name', columns, row, undefined, driver);
  }, [tableName, columns, row, driver]);

  if (!row) return null;

  const handleExecute = async () => {
    setIsSubmitting(true);
    try {
      await onExecuteDelete(generatedSql, rowIndex);
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
        <div className="flex items-center space-x-2 text-red-400">
          <AlertTriangle className="w-4 h-4" />
          <span>Delete Row #{rowIndex + 1}</span>
        </div>
      }
      maxWidth="md"
    >
      <div className="space-y-4 font-sans text-xs">
        <p className="text-tx-secondary text-xs">
          Are you sure you want to permanently delete this record from table{' '}
          <span className="font-mono text-tx-primary font-semibold">{tableName}</span>?
        </p>

        {/* Target Table Input */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-tx-secondary">Target Table:</label>
          <Input
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="table_name"
            className="font-mono text-xs"
          />
        </div>

        {/* Row Data Snapshot */}
        <div className="space-y-1">
          <div className="text-[11px] font-medium text-tx-secondary">Row Snapshot:</div>
          <div className="max-h-40 overflow-y-auto bg-white/[0.02] border border-white/10 rounded-lg p-2.5 space-y-1 font-mono text-[11px]">
            {columns.slice(0, 8).map((col, idx) => (
              <div
                key={col.name}
                className="flex justify-between items-center py-0.5 border-b border-white/[0.04] last:border-0"
              >
                <span className="text-tx-muted">{col.name}:</span>
                <span className="text-tx-primary font-medium truncate max-w-[200px]">
                  {row[idx] !== null && row[idx] !== undefined ? String(row[idx]) : 'NULL'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Generated SQL Statement */}
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
          <pre className="p-2.5 rounded-lg bg-[#0d0d10] border border-red-500/20 font-mono text-[11px] text-red-400 overflow-x-auto whitespace-pre-wrap">
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
              variant="danger"
              size="sm"
              isLoading={isSubmitting}
              onClick={handleExecute}
              className="flex items-center space-x-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Row</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
