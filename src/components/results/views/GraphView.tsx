import type { QueryResult } from '@/types/database';
import type { QueryRow } from '@/utils/dataTransforms';
import type React from 'react';
import { useMemo, useState } from 'react';

export interface GraphViewProps {
  result: QueryResult;
  effectiveResult: QueryResult;
}

export const GraphView: React.FC<GraphViewProps> = ({ result, effectiveResult }) => {
  // Find first numeric column for Y axis default
  const defaultYIndex = useMemo(() => {
    const idx = result.columns.findIndex((c) => {
      const t = c.dataType.toLowerCase();
      return (
        t.includes('int') ||
        t.includes('float') ||
        t.includes('double') ||
        t.includes('num') ||
        t.includes('dec') ||
        t.includes('real')
      );
    });
    return idx >= 0 ? idx : Math.min(1, result.columns.length - 1);
  }, [result.columns]);

  const [graphXCol, setGraphXCol] = useState<number>(0);
  const [graphYCol, setGraphYCol] = useState<number>(defaultYIndex);
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    label: string;
    value: number;
  } | null>(null);

  // Take up to 50 data points for clean visualization
  const dataPoints = useMemo(() => {
    const rows = effectiveResult.rows.slice(0, 50);
    return rows.map((row: QueryRow, idx: number) => {
      const label = String(row[graphXCol] ?? `Row ${idx + 1}`);
      const rawVal = Number(row[graphYCol]);
      const value = Number.isNaN(rawVal) ? 0 : rawVal;
      return { label, value, index: idx };
    });
  }, [effectiveResult.rows, graphXCol, graphYCol]);

  // Compute scale boundaries
  const { minVal, maxVal } = useMemo(() => {
    if (dataPoints.length === 0) return { minVal: 0, maxVal: 100 };
    const values = dataPoints.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return {
      minVal: min >= 0 ? 0 : min,
      maxVal: max === min ? max + 10 : max,
    };
  }, [dataPoints]);

  const svgWidth = 800;
  const svgHeight = 320;
  const padding = { top: 30, right: 30, bottom: 40, left: 60 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  // Calculate coordinates for points
  const pointsWithCoords = useMemo(() => {
    if (dataPoints.length === 0) return [];
    const valRange = maxVal - minVal || 1;
    const stepX = dataPoints.length > 1 ? graphWidth / (dataPoints.length - 1) : graphWidth / 2;

    return dataPoints.map((dp, i) => {
      const cx = padding.left + (dataPoints.length > 1 ? i * stepX : graphWidth / 2);
      const normalizedY = (dp.value - minVal) / valRange;
      const cy = padding.top + graphHeight - normalizedY * graphHeight;
      return { ...dp, cx, cy };
    });
  }, [dataPoints, minVal, maxVal, graphWidth, graphHeight]);

  // SVG Line path and Area path
  const { linePath, areaPath } = useMemo(() => {
    if (pointsWithCoords.length === 0) return { linePath: '', areaPath: '' };
    if (pointsWithCoords.length === 1) {
      const p = pointsWithCoords[0];
      return {
        linePath: `M ${p.cx - 20} ${p.cy} L ${p.cx + 20} ${p.cy}`,
        areaPath: `M ${p.cx - 20} ${p.cy} L ${p.cx + 20} ${p.cy} L ${p.cx + 20} ${padding.top + graphHeight} L ${p.cx - 20} ${padding.top + graphHeight} Z`,
      };
    }

    let d = `M ${pointsWithCoords[0].cx} ${pointsWithCoords[0].cy}`;
    for (let i = 1; i < pointsWithCoords.length; i++) {
      const p0 = pointsWithCoords[i - 1];
      const p1 = pointsWithCoords[i];
      const cpX = (p0.cx + p1.cx) / 2;
      d += ` C ${cpX} ${p0.cy}, ${cpX} ${p1.cy}, ${p1.cx} ${p1.cy}`;
    }

    const last = pointsWithCoords[pointsWithCoords.length - 1];
    const first = pointsWithCoords[0];
    const bottomY = padding.top + graphHeight;
    const a = `${d} L ${last.cx} ${bottomY} L ${first.cx} ${bottomY} Z`;

    return { linePath: d, areaPath: a };
  }, [pointsWithCoords, graphHeight]);

  return (
    <div className="w-full h-full p-6 flex flex-col space-y-4 overflow-auto bg-bg-base font-sans select-none">
      {/* Controls Bar */}
      <div className="flex items-center space-x-6 text-xs bg-white/[0.03] border border-white/[0.06] p-3 rounded-xl shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-tx-secondary font-medium">X Axis (Category):</span>
          <select
            value={graphXCol}
            onChange={(e) => setGraphXCol(Number(e.target.value))}
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
          <span className="text-tx-secondary font-medium">Y Axis (Metric):</span>
          <select
            value={graphYCol}
            onChange={(e) => setGraphYCol(Number(e.target.value))}
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

      {/* SVG Trend Graph Viewport */}
      <div className="flex-1 min-h-[340px] bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 flex flex-col justify-center relative overflow-hidden">
        {dataPoints.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-tx-muted text-xs font-mono">
            No numeric rows to plot
          </div>
        ) : (
          <div className="w-full h-full relative">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
              role="img"
              aria-label="Query Result Trend Graph"
            >
              <title>Query Result Trend Graph</title>
              <defs>
                <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = padding.top + graphHeight * (1 - ratio);
                const val = minVal + (maxVal - minVal) * ratio;
                return (
                  <g key={ratio}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={padding.left + graphWidth}
                      y2={y}
                      stroke="rgba(255, 255, 255, 0.06)"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 3}
                      textAnchor="end"
                      fill="rgba(255, 255, 255, 0.35)"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {val.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                    </text>
                  </g>
                );
              })}

              {/* Area fill */}
              {areaPath && <path d={areaPath} fill="url(#graphGradient)" />}

              {/* Connected Line */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data points */}
              {pointsWithCoords.map((pt) => (
                <g key={pt.index}>
                  <circle
                    cx={pt.cx}
                    cy={pt.cy}
                    r="4"
                    fill="#0f172a"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    className="cursor-pointer transition-transform hover:scale-150"
                    onMouseEnter={() =>
                      setHoveredPoint({
                        x: pt.cx,
                        y: pt.cy,
                        label: pt.label,
                        value: pt.value,
                      })
                    }
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              ))}

              {/* X Axis Labels */}
              {pointsWithCoords.map((pt, i) => {
                // Show label every few items if many
                const shouldShow =
                  pointsWithCoords.length <= 15 ||
                  i % Math.ceil(pointsWithCoords.length / 12) === 0;
                if (!shouldShow) return null;
                return (
                  <text
                    key={`label-${pt.index}`}
                    x={pt.cx}
                    y={padding.top + graphHeight + 18}
                    textAnchor="middle"
                    fill="rgba(255, 255, 255, 0.45)"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {pt.label.length > 8 ? `${pt.label.slice(0, 7)}…` : pt.label}
                  </text>
                );
              })}
            </svg>

            {/* Interactive Tooltip */}
            {hoveredPoint && (
              <div
                className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 bg-[#141416] border border-white/15 px-2 py-1 rounded-md shadow-xl text-[10px] font-mono text-tx-primary z-30"
                style={{
                  left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                  top: `${(hoveredPoint.y / svgHeight) * 100}%`,
                }}
              >
                <div className="text-tx-secondary">{hoveredPoint.label}</div>
                <div className="text-[#38bdf8] font-bold">
                  {hoveredPoint.value.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
