import { Terminal } from 'lucide-react';
import type React from 'react';

export const EmptyStateView: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-tx-muted text-xs font-mono select-none space-y-1.5 bg-bg-base">
      <div className="w-8 h-8 rounded-lg bg-bg-surface border border-border-subtle flex items-center justify-center text-tx-muted">
        <Terminal className="w-4 h-4 text-white/60" strokeWidth={1.5} />
      </div>
      <p className="font-medium text-white/80 text-xs">Ready to Query</p>
      <p className="text-tx-muted text-[11px]">Select text or press F5 to execute statements.</p>
    </div>
  );
};
