import { Database, Loader2 } from 'lucide-react';
import type React from 'react';

export interface RunningStateViewProps {
  elapsedSeconds: number;
}

export const RunningStateView: React.FC<RunningStateViewProps> = ({ elapsedSeconds }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-bg-base select-none p-6 space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 animate-ping absolute" />
        <div className="w-12 h-12 rounded-xl bg-bg-surface border border-border-default flex items-center justify-center text-white shadow-lg relative z-10">
          <Database className="w-5 h-5 text-white/90 animate-pulse" strokeWidth={1.5} />
        </div>
      </div>

      <div className="text-center space-y-1.5">
        <div className="flex items-center justify-center space-x-2 text-white text-xs font-semibold tracking-tight">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-white/80" strokeWidth={2} />
          <span>Executing SQL Query...</span>
        </div>
        <p className="text-[11px] font-mono text-tx-muted">
          Transmitting stream buffers &bull; Elapsed:{' '}
          <span className="text-white font-medium">{elapsedSeconds.toFixed(1)}s</span>
        </p>
      </div>

      <div className="w-48 h-1 bg-bg-surface border border-border-subtle rounded-full overflow-hidden">
        <div className="w-full h-full bg-white/40 animate-pulse rounded-full" />
      </div>
    </div>
  );
};
