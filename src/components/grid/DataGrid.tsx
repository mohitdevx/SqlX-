import { Toast } from '@/components/ui/molecules/Toast';
import { executeQuery } from '@/services/tauriBridge';
import { useConnectionStore } from '@/stores/connectionStore';
import { useQueryStore } from '@/stores/queryStore';
import type { ColumnMetadata, QueryResult } from '@/types/database';
import { useVirtualizer } from '@tanstack/react-virtual';
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DeleteRowModal } from './DeleteRowModal';
import { GridContextMenu } from './GridContextMenu';
import { UpdateCellModal } from './UpdateCellModal';
import { UpdateRowModal } from './UpdateRowModal';
import { detectTableFromSql, generateClearCellSql } from './sqlHelpers';

interface DataGridProps {
  data: QueryResult | null;
}

interface ContextMenuState {
  x: number;
  y: number;
  type: 'row' | 'column';
  rowIndex?: number;
  row?: (string | number | boolean | null | object)[];
  colIndex?: number;
  column?: ColumnMetadata;
}

export const DataGrid: React.FC<DataGridProps> = ({ data }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [gridData, setGridData] = useState<QueryResult | null>(data);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selected cell & row tracking
  const [selectedCell, setSelectedCell] = useState<{
    rowIndex: number;
    colIndex: number;
  } | null>(null);

  // Modals state
  const [isUpdateCellOpen, setIsUpdateCellOpen] = useState(false);
  const [isUpdateRowOpen, setIsUpdateRowOpen] = useState(false);
  const [isDeleteRowOpen, setIsDeleteRowOpen] = useState(false);

  const [targetRow, setTargetRow] = useState<{
    row: (string | number | boolean | null | object)[];
    index: number;
  } | null>(null);

  const [targetCol, setTargetCol] = useState<{
    column: ColumnMetadata;
    index: number;
  } | null>(null);

  // Store connections & query
  const { activeConnectionId, selectedTable, connections } = useConnectionStore();
  const { tabs, activeTabId, createTab } = useQueryStore();

  const activeTab = useMemo(() => tabs.find((t) => t.id === activeTabId), [tabs, activeTabId]);
  const activeConn = useMemo(
    () => connections.find((c) => c.id === activeConnectionId),
    [connections, activeConnectionId]
  );

  // Inferred Table Name
  const inferredTableName = useMemo(() => {
    if (selectedTable) return selectedTable;
    const detected = detectTableFromSql(activeTab?.lastExecutedSql || activeTab?.sql);
    return detected || 'table_name';
  }, [selectedTable, activeTab]);

  useEffect(() => {
    setGridData(data);
    setSelectedCell(null);
  }, [data]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const rowCount = gridData?.rows.length || 0;
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 30,
    overscan: 25,
  });

  if (!gridData || gridData.columns.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-tx-muted text-xs font-mono select-none space-y-1">
        <p className="font-medium text-tx-secondary">No Results to Display</p>
        <p className="text-[11px] text-tx-muted">
          Execute a query using F5 or Ctrl+Enter to view results.
        </p>
      </div>
    );
  }

  // Right-click on cell / row
  const handleCellContextMenu = (
    e: React.MouseEvent,
    row: (string | number | boolean | null | object)[],
    rowIndex: number,
    colIndex: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const col = gridData.columns[colIndex];
    setSelectedCell({ rowIndex, colIndex });
    setTargetRow({ row, index: rowIndex });
    setTargetCol(col ? { column: col, index: colIndex } : null);
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type: 'row',
      rowIndex,
      row,
      colIndex,
      column: col,
    });
  };

  // Right-click on header column
  const handleHeaderContextMenu = (
    e: React.MouseEvent,
    column: ColumnMetadata,
    colIndex: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setTargetCol({ column, index: colIndex });
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type: 'column',
      colIndex,
      column,
    });
  };

  // 1. Update single cell value
  const handleExecuteUpdateCell = async (sql: string, newValue: unknown) => {
    if (activeConnectionId) {
      try {
        await executeQuery(activeConnectionId, sql);
      } catch (err) {
        showToast(`Warning: DB update failed: ${String(err)}`);
      }
    }

    if (targetRow && targetCol) {
      setGridData((prev) => {
        if (!prev) return null;
        const nextRows = [...prev.rows];
        const updatedRow = [...nextRows[targetRow.index]];
        updatedRow[targetCol.index] = newValue as string | number | boolean | null | object;
        nextRows[targetRow.index] = updatedRow;
        return { ...prev, rows: nextRows };
      });
      showToast(`Updated "${targetCol.column.name}" in Row #${targetRow.index + 1}`);
    }
  };

  // 2. Clear single cell value (Set to NULL)
  const handleClearCell = async () => {
    if (!targetRow || !targetCol || !gridData) return;
    const colName = targetCol.column.name;
    const sql = generateClearCellSql(
      inferredTableName,
      colName,
      gridData.columns,
      targetRow.row,
      undefined,
      activeConn?.driver
    );

    if (activeConnectionId) {
      try {
        await executeQuery(activeConnectionId, sql);
      } catch (err) {
        showToast(`Warning: DB clear failed: ${String(err)}`);
      }
    }

    setGridData((prev) => {
      if (!prev) return null;
      const nextRows = [...prev.rows];
      const updatedRow = [...nextRows[targetRow.index]];
      updatedRow[targetCol.index] = null;
      nextRows[targetRow.index] = updatedRow;
      return { ...prev, rows: nextRows };
    });
    showToast(`Set "${colName}" to NULL in Row #${targetRow.index + 1}`);
  };

  // 3. Update entire row
  const handleExecuteUpdateRow = async (
    sql: string,
    updatedRow: (string | number | boolean | null | object)[]
  ) => {
    if (activeConnectionId) {
      try {
        await executeQuery(activeConnectionId, sql);
      } catch (err) {
        showToast(`Warning: DB query failed: ${String(err)}`);
      }
    }

    if (targetRow) {
      setGridData((prev) => {
        if (!prev) return null;
        const nextRows = [...prev.rows];
        nextRows[targetRow.index] = updatedRow;
        return { ...prev, rows: nextRows };
      });
      showToast(`Updated Row #${targetRow.index + 1} successfully`);
    }
  };

  // 4. Delete specific row
  const handleExecuteDeleteRow = async (sql: string, rowIndex: number) => {
    if (activeConnectionId) {
      try {
        await executeQuery(activeConnectionId, sql);
      } catch (err) {
        showToast(`Warning: DB delete failed: ${String(err)}`);
      }
    }

    setGridData((prev) => {
      if (!prev) return null;
      const nextRows = prev.rows.filter((_, idx) => idx !== rowIndex);
      return { ...prev, rows: nextRows };
    });
    setSelectedCell(null);
    showToast(`Deleted Row #${rowIndex + 1}`);
  };

  // 5. Remove column from view only (not deleting whole table column!)
  const handleRemoveColumnFromView = () => {
    if (!targetCol) return;
    const idxToRemove = targetCol.index;
    const colName = targetCol.column.name;

    setGridData((prev) => {
      if (!prev) return null;
      const nextCols = prev.columns.filter((_, i) => i !== idxToRemove);
      const nextRows = prev.rows.map((row) => row.filter((_, i) => i !== idxToRemove));
      return { ...prev, columns: nextCols, rows: nextRows };
    });
    setSelectedCell(null);
    showToast(`Removed column "${colName}" from view`);
  };

  // 6. Rename column in view
  const handleRenameColumnHeader = () => {
    if (!targetCol) return;
    const newName = window.prompt('Enter new column name for view:', targetCol.column.name);
    if (!newName || !newName.trim()) return;

    setGridData((prev) => {
      if (!prev) return null;
      const nextCols = prev.columns.map((col, i) =>
        i === targetCol.index ? { ...col, name: newName.trim() } : col
      );
      return { ...prev, columns: nextCols };
    });
    showToast(`Renamed column to "${newName.trim()}" in view`);
  };

  // Open SQL in Editor
  const handleOpenInEditor = (sql: string) => {
    createTab(sql, 'Edit Action');
    showToast('SQL statement opened in new editor tab');
  };

  const renderCellContent = (cell: unknown, dataType: string) => {
    if (cell === null || cell === undefined) {
      return (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-border-subtle/60 text-tx-muted uppercase tracking-wider">
          NULL
        </span>
      );
    }

    if (typeof cell === 'boolean') {
      return cell ? (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-400 font-semibold">
          TRUE
        </span>
      ) : (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-500/15 text-red-400 font-semibold">
          FALSE
        </span>
      );
    }

    if (typeof cell === 'object') {
      return <span className="font-mono text-[11px] text-amber-300">{JSON.stringify(cell)}</span>;
    }

    const typeLower = dataType.toLowerCase();
    const isNumeric =
      typeLower.includes('int') ||
      typeLower.includes('numeric') ||
      typeLower.includes('decimal') ||
      typeLower.includes('float') ||
      typeLower.includes('double');

    return (
      <span
        className={`truncate text-[12px] font-mono ${
          isNumeric ? 'text-right block w-full text-blue-300' : 'text-tx-primary'
        }`}
      >
        {String(cell)}
      </span>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-bg-base overflow-hidden select-text font-mono relative">
      <Toast message={toastMessage} />

      {/* Sticky Table Header */}
      <div className="flex bg-grid-headerBg border-b border-grid-cellBorder text-grid-headerTx text-xs font-semibold select-none">
        <div className="w-12 px-2 py-1.5 text-center text-tx-muted border-r border-grid-cellBorder flex-shrink-0 text-[11px]">
          #
        </div>
        {gridData.columns.map((col, idx) => {
          const isSelectedCol = selectedCell?.colIndex === idx;
          return (
            <div
              key={col.name}
              onClick={() => {
                if (selectedCell) {
                  setSelectedCell({ ...selectedCell, colIndex: idx });
                }
              }}
              onContextMenu={(e) => handleHeaderContextMenu(e, col, idx)}
              className={`min-w-[160px] max-w-[320px] flex-1 px-3 py-1.5 border-r border-grid-cellBorder truncate flex items-center justify-between cursor-context-menu transition-colors ${
                isSelectedCol ? 'bg-accent-primary/10 text-accent-primary' : 'hover:bg-white/[0.04]'
              }`}
              title="Right click to manage this specific column in view"
            >
              <span className="font-semibold truncate">{col.name}</span>
              <span className="text-[10px] font-mono text-tx-muted uppercase font-normal ml-2 px-1 py-0.2 rounded bg-bg-surface">
                {col.dataType}
              </span>
            </div>
          );
        })}
      </div>

      {/* Virtualized Rows Container */}
      <div ref={parentRef} className="flex-1 overflow-auto">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = gridData.rows[virtualRow.index];
            const isSelectedRow = selectedCell?.rowIndex === virtualRow.index;
            const isEven = virtualRow.index % 2 === 0;

            return (
              <div
                key={virtualRow.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className={`flex border-b border-grid-cellBorder transition-colors items-center cursor-context-menu ${
                  isSelectedRow
                    ? 'bg-accent-primary/10'
                    : isEven
                      ? 'bg-grid-rowEven hover:bg-grid-rowHover'
                      : 'bg-grid-rowOdd hover:bg-grid-rowHover'
                }`}
              >
                <div
                  onClick={() => setSelectedCell({ rowIndex: virtualRow.index, colIndex: 0 })}
                  onContextMenu={(e) => handleCellContextMenu(e, row, virtualRow.index, 0)}
                  className={`w-12 px-2 py-1 text-center border-r border-grid-cellBorder truncate select-none text-[10px] flex-shrink-0 cursor-pointer ${
                    isSelectedRow ? 'text-accent-primary font-bold' : 'text-tx-muted'
                  }`}
                  title="Right click to Update or Delete Row"
                >
                  {virtualRow.index + 1}
                </div>

                {row.map((cell, cellIdx) => {
                  const col = gridData.columns[cellIdx];
                  const isSelectedCell =
                    selectedCell?.rowIndex === virtualRow.index &&
                    selectedCell?.colIndex === cellIdx;

                  return (
                    <div
                      key={col?.name || cellIdx}
                      onClick={() =>
                        setSelectedCell({
                          rowIndex: virtualRow.index,
                          colIndex: cellIdx,
                        })
                      }
                      onContextMenu={(e) =>
                        handleCellContextMenu(e, row, virtualRow.index, cellIdx)
                      }
                      className={`min-w-[160px] max-w-[320px] flex-1 px-3 py-1 border-r border-grid-cellBorder truncate cursor-pointer transition-all ${
                        isSelectedCell
                          ? 'ring-1 ring-accent-primary ring-inset bg-accent-primary/15'
                          : 'hover:bg-white/[0.04]'
                      }`}
                      title="Right click to Update or Delete this specific cell / row"
                    >
                      {renderCellContent(cell, col?.dataType || '')}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Context Menu */}
      {contextMenu && (
        <GridContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          type={contextMenu.type}
          rowIndex={contextMenu.rowIndex}
          columnName={contextMenu.column?.name}
          onClose={() => setContextMenu(null)}
          onUpdateCell={() => {
            if (contextMenu.row && contextMenu.rowIndex !== undefined && contextMenu.column) {
              setTargetRow({ row: contextMenu.row, index: contextMenu.rowIndex });
              setTargetCol({ column: contextMenu.column, index: contextMenu.colIndex || 0 });
              setIsUpdateCellOpen(true);
            }
          }}
          onClearCell={handleClearCell}
          onUpdateRow={() => {
            if (contextMenu.row && contextMenu.rowIndex !== undefined) {
              setTargetRow({ row: contextMenu.row, index: contextMenu.rowIndex });
              setIsUpdateRowOpen(true);
            }
          }}
          onDeleteRow={() => {
            if (contextMenu.row && contextMenu.rowIndex !== undefined) {
              setTargetRow({ row: contextMenu.row, index: contextMenu.rowIndex });
              setIsDeleteRowOpen(true);
            }
          }}
          onRemoveColumnFromView={handleRemoveColumnFromView}
          onRenameColumnHeader={handleRenameColumnHeader}
          onCopyCell={
            contextMenu.row && contextMenu.colIndex !== undefined
              ? () => {
                  const colIdx = contextMenu.colIndex;
                  const val = colIdx !== undefined ? contextMenu.row?.[colIdx] : undefined;
                  navigator.clipboard.writeText(
                    val !== null && val !== undefined ? String(val) : ''
                  );
                  showToast('Copied cell value to clipboard');
                }
              : undefined
          }
          onCopyRow={
            contextMenu.row
              ? () => {
                  const rowObj: Record<string, unknown> = {};
                  gridData.columns.forEach((c, idx) => {
                    rowObj[c.name] = contextMenu.row?.[idx];
                  });
                  navigator.clipboard.writeText(JSON.stringify(rowObj, null, 2));
                  showToast('Copied row as JSON to clipboard');
                }
              : undefined
          }
          onCopyColumn={
            contextMenu.column
              ? () => {
                  const colName = contextMenu.column?.name || '';
                  navigator.clipboard.writeText(colName);
                  showToast(`Copied column "${colName}" to clipboard`);
                }
              : undefined
          }
        />
      )}

      {/* 1. Update Cell Modal (Strict single-cell update) */}
      {targetRow && targetCol && (
        <UpdateCellModal
          isOpen={isUpdateCellOpen}
          onClose={() => setIsUpdateCellOpen(false)}
          column={targetCol.column}
          colIndex={targetCol.index}
          row={targetRow.row}
          rowIndex={targetRow.index}
          columns={gridData.columns}
          tableName={inferredTableName}
          driver={activeConn?.driver}
          onExecuteUpdate={handleExecuteUpdateCell}
          onOpenInEditor={handleOpenInEditor}
        />
      )}

      {/* 2. Update Row Modal (Strict single-row update) */}
      {targetRow && (
        <UpdateRowModal
          isOpen={isUpdateRowOpen}
          onClose={() => setIsUpdateRowOpen(false)}
          columns={gridData.columns}
          row={targetRow.row}
          rowIndex={targetRow.index}
          tableName={inferredTableName}
          driver={activeConn?.driver}
          onExecuteUpdate={handleExecuteUpdateRow}
          onOpenInEditor={handleOpenInEditor}
        />
      )}

      {/* 3. Delete Row Modal (Strict single-row delete) */}
      {targetRow && (
        <DeleteRowModal
          isOpen={isDeleteRowOpen}
          onClose={() => setIsDeleteRowOpen(false)}
          columns={gridData.columns}
          row={targetRow.row}
          rowIndex={targetRow.index}
          tableName={inferredTableName}
          driver={activeConn?.driver}
          onExecuteDelete={handleExecuteDeleteRow}
          onOpenInEditor={handleOpenInEditor}
        />
      )}
    </div>
  );
};
