import type { QueryResult } from '@/types/database';
import { useVirtualizer } from '@tanstack/react-virtual';
import type React from 'react';
import { useRef } from 'react';

interface DataGridProps {
  data: QueryResult | null;
}

export const DataGrid: React.FC<DataGridProps> = ({ data }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowCount = data?.rows.length || 0;
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 30,
    overscan: 25,
  });

  if (!data || data.columns.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-tx-muted text-xs font-mono select-none space-y-1">
        <p className="font-medium text-tx-secondary">No Results to Display</p>
        <p className="text-[11px] text-tx-muted">
          Execute a query using F5 or Ctrl+Enter to view results.
        </p>
      </div>
    );
  }

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
        className={`truncate text-[12px] font-mono ${isNumeric ? 'text-right block w-full text-blue-300' : 'text-tx-primary'}`}
      >
        {String(cell)}
      </span>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-bg-base overflow-hidden select-text font-mono">
      {/* Sticky Table Header */}
      <div className="flex bg-grid-headerBg border-b border-grid-cellBorder text-grid-headerTx text-xs font-semibold select-none">
        <div className="w-12 px-2 py-1.5 text-center text-tx-muted border-r border-grid-cellBorder flex-shrink-0 text-[11px]">
          #
        </div>
        {data.columns.map((col) => (
          <div
            key={col.name}
            className="min-w-[160px] max-w-[320px] flex-1 px-3 py-1.5 border-r border-grid-cellBorder truncate flex items-center justify-between"
          >
            <span className="font-semibold text-tx-primary truncate">{col.name}</span>
            <span className="text-[10px] font-mono text-tx-muted uppercase font-normal ml-2 px-1 py-0.2 rounded bg-bg-surface">
              {col.dataType}
            </span>
          </div>
        ))}
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
            const row = data.rows[virtualRow.index];
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
                className={`flex border-b border-grid-cellBorder hover:bg-grid-rowHover transition-colors items-center ${
                  isEven ? 'bg-grid-rowEven' : 'bg-grid-rowOdd'
                }`}
              >
                <div className="w-12 px-2 py-1 text-center text-tx-muted border-r border-grid-cellBorder truncate select-none text-[10px] flex-shrink-0">
                  {virtualRow.index + 1}
                </div>
                {row.map((cell, cellIdx) => {
                  const col = data.columns[cellIdx];
                  return (
                    <div
                      key={col?.name || cellIdx}
                      className="min-w-[160px] max-w-[320px] flex-1 px-3 py-1 border-r border-grid-cellBorder truncate"
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
    </div>
  );
};
