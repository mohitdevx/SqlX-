import type { ColumnMetadata } from '@/types/database';
import type React from 'react';

export interface SchemaViewProps {
  columns: ColumnMetadata[];
}

export const SchemaView: React.FC<SchemaViewProps> = ({ columns }) => {
  return (
    <div className="w-full h-full p-6 overflow-auto bg-bg-base font-mono text-xs">
      <div className="bg-white/[0.04] rounded-xl overflow-hidden">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-white/[0.02] text-tx-secondary text-[11px] uppercase tracking-wider">
              <th className="p-3">Index</th>
              <th className="p-3">Column Name</th>
              <th className="p-3">Data Type</th>
              <th className="p-3">Nullable</th>
            </tr>
          </thead>
          <tbody>
            {columns.map((col, idx) => (
              <tr key={col.name} className="hover:bg-white/[0.03] transition-colors">
                <td className="p-3 text-tx-muted text-[11px]">{idx + 1}</td>
                <td className="p-3 font-bold text-tx-primary">{col.name}</td>
                <td className="p-3 text-tx-secondary uppercase font-mono">{col.dataType}</td>
                <td className="p-3 text-tx-secondary">{col.nullable ? 'YES' : 'NO'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
