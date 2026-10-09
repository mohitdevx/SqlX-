import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { QueryResult } from '@/types/database';

interface DataGridProps {
  data: QueryResult | null;
}

export const DataGrid: React.FC<DataGridProps> = ({ data }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowCount = data?.rows.length || 0;
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 28,
    overscan: 20,
  });

  if (!data || data.columns.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-tx-muted text-xs font-mono">
        <p>No active result set. Execute a query (F5) to view data.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-bg-base overflow-hidden select-text">
      {/* Grid Header */}
      <div className="flex bg-grid-headerBg border-b border-grid-cellBorder text-grid-headerTx text-xs font-medium font-mono">
        <div className="w-12 px-2 py-1.5 text-center text-tx-muted border-r border-grid-cellBorder">#</div>
        {data.columns.map((col, idx) => (
          <div
            key={idx}
            className="min-w-[150px] max-w-[300px] flex-1 px-3 py-1.5 border-r border-grid-cellBorder truncate flex items-center justify-between"
          >
            <span className="font-semibold">{col.name}</span>
            <span className="text-[10px] text-tx-muted font-normal uppercase">{col.dataType}</span>
          </div>
        ))}
      </div>

      {/* Virtualized Rows */}
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
                className={`flex text-xs font-mono border-b border-grid-cellBorder hover:bg-grid-rowHover transition-colors ${
                  isEven ? 'bg-grid-rowEven' : 'bg-grid-rowOdd'
                }`}
              >
                <div className="w-12 px-2 py-1 text-center text-tx-muted border-r border-grid-cellBorder truncate select-none">
                  {virtualRow.index + 1}
                </div>
                {row.map((cell, cellIdx) => (
                  <div
                    key={cellIdx}
                    className="min-w-[150px] max-w-[300px] flex-1 px-3 py-1 border-r border-grid-cellBorder truncate text-tx-primary"
                  >
                    {cell === null ? (
                      <span className="text-grid-nullVal italic">NULL</span>
                    ) : typeof cell === 'object' ? (
                      JSON.stringify(cell)
                    ) : (
                      String(cell)
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
