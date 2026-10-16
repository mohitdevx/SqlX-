import { Clipboard, Copy, Edit2, Edit3, Eraser, EyeOff, Trash2 } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef } from 'react';

export interface GridContextMenuProps {
  x: number;
  y: number;
  type: 'row' | 'column';
  rowIndex?: number;
  colIndex?: number;
  columnName?: string;
  onClose: () => void;
  onUpdateCell?: () => void;
  onClearCell?: () => void;
  onUpdateRow?: () => void;
  onDeleteRow?: () => void;
  onRemoveColumnFromView?: () => void;
  onRenameColumnHeader?: () => void;
  onCopyCell?: () => void;
  onCopyRow?: () => void;
  onCopyColumn?: () => void;
}

export const GridContextMenu: React.FC<GridContextMenuProps> = ({
  x,
  y,
  type,
  rowIndex,
  columnName,
  onClose,
  onUpdateCell,
  onClearCell,
  onUpdateRow,
  onDeleteRow,
  onRemoveColumnFromView,
  onRenameColumnHeader,
  onCopyCell,
  onCopyRow,
  onCopyColumn,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const adjustedX = Math.max(10, Math.min(x, window.innerWidth - 240));
  const adjustedY = Math.max(10, Math.min(y, window.innerHeight - 300));
  const displayRow = rowIndex !== undefined ? rowIndex + 1 : undefined;

  return (
    <div
      ref={menuRef}
      style={{ left: `${adjustedX}px`, top: `${adjustedY}px` }}
      className="fixed z-50 w-60 bg-[#141416] border border-white/10 shadow-2xl rounded-xl p-1.5 font-sans text-xs animate-fade-in select-none space-y-0.5"
    >
      {type === 'column' ? (
        <>
          <div className="px-2.5 py-1 text-[10px] font-mono text-tx-muted uppercase tracking-wider truncate">
            Column: {columnName || 'Selected'}
          </div>

          <button
            type="button"
            onClick={() => {
              onRenameColumnHeader?.();
              onClose();
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-tx-secondary hover:text-tx-primary hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
          >
            <Edit2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="truncate">Rename in View</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onRemoveColumnFromView?.();
              onClose();
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
          >
            <EyeOff className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="truncate">Remove from View</span>
          </button>

          <div className="my-1 border-t border-white/10" />

          <button
            type="button"
            onClick={() => {
              onCopyColumn?.();
              onClose();
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-tx-secondary hover:text-tx-primary hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
          >
            <Copy className="w-3.5 h-3.5 text-tx-muted shrink-0" />
            <span className="truncate">Copy Column Name</span>
          </button>
        </>
      ) : (
        <>
          {/* Specific Cell actions */}
          {columnName && (
            <>
              <div className="px-2.5 py-1 text-[10px] font-mono text-tx-muted uppercase tracking-wider truncate">
                Selected Cell ({columnName})
              </div>

              <button
                type="button"
                onClick={() => {
                  onUpdateCell?.();
                  onClose();
                }}
                className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-tx-secondary hover:text-tx-primary hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
              >
                <Edit3 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate">Update "{columnName}"</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClearCell?.();
                  onClose();
                }}
                className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer text-left"
              >
                <Eraser className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">Delete Value (Set NULL)</span>
              </button>

              <div className="my-1 border-t border-white/10" />
            </>
          )}

          {/* Specific Row actions */}
          <div className="px-2.5 py-0.5 text-[10px] font-mono text-tx-muted uppercase tracking-wider">
            Selected Row #{displayRow}
          </div>

          <button
            type="button"
            onClick={() => {
              onUpdateRow?.();
              onClose();
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-tx-secondary hover:text-tx-primary hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
          >
            <Edit2 className="w-3.5 h-3.5 text-tx-muted shrink-0" />
            <span className="truncate">Update Entire Row</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onDeleteRow?.();
              onClose();
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="truncate">Delete Row #{displayRow}</span>
          </button>

          <div className="my-1 border-t border-white/10" />

          {onCopyCell && (
            <button
              type="button"
              onClick={() => {
                onCopyCell();
                onClose();
              }}
              className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-tx-secondary hover:text-tx-primary hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
            >
              <Clipboard className="w-3.5 h-3.5 text-tx-muted shrink-0" />
              <span className="truncate">Copy Cell Value</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onCopyRow?.();
              onClose();
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-tx-secondary hover:text-tx-primary hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
          >
            <Copy className="w-3.5 h-3.5 text-tx-muted shrink-0" />
            <span className="truncate">Copy Row as JSON</span>
          </button>
        </>
      )}
    </div>
  );
};
