import type { QueryResult } from '@/types/database';
import type { QueryRow } from '@/utils/dataTransforms';
import type React from 'react';
import { useState } from 'react';

export interface ChartViewProps {
  result: QueryResult;
  effectiveResult: QueryResult;
}

export const ChartView: React.FC<ChartViewProps> = ({ result, effectiveResult }) => {
  const [chartXCol, setChartXCol] = useState<number>(0);
  const [chartYCol, setChartYCol] = useState<number>(1);

  return (
    <div className="w-full h-full p-6 flex flex-col space-y-4 overflow-auto bg-bg-base font-sans">
      <div className="flex items-center space-x-6 text-xs bg-white/[0.03] border border-white/[0.06] p-3 rounded-xl">
        <div className="flex items-center space-x-2">
          <span className="text-tx-secondary font-medium">Category (X):</span>
          <select
            value={chartXCol}
            onChange={(e) => setChartXCol(Number(e.target.value))}
            className="bg-[#141416] border border-white/10 rounded-lg px-2.5 py-1 text-tx-primary text-xs font-mono focus:outline-none focus:border-accent-primary/50 cursor-pointer"
          >
            {result.columns.map((c, i) => (
              <option key={c.name} value={i} className="bg-[#141416] text-tx-primary">
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
            className="bg-[#141416] border border-white/10 rounded-lg px-2.5 py-1 text-tx-primary text-xs font-mono focus:outline-none focus:border-accent-primary/50 cursor-pointer"
          >
            {result.columns.map((c, i) => (
              <option key={c.name} value={i} className="bg-[#141416] text-tx-primary">
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
              key={`${label}-${idx}`}
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
  );
};
