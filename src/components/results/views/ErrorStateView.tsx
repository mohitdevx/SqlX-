import { AlertCircle } from 'lucide-react';
import type React from 'react';

export interface ErrorStateViewProps {
  error: string;
}

export const ErrorStateView: React.FC<ErrorStateViewProps> = ({ error }) => {
  return (
    <div className="w-full h-full p-6 bg-status-error/5 border-t border-status-error/20 text-status-error font-mono text-xs overflow-auto space-y-2">
      <div className="flex items-center space-x-2 font-bold text-sm">
        <AlertCircle className="w-4 h-4 text-status-error flex-shrink-0" strokeWidth={1.5} />
        <span>Execution Failed</span>
      </div>
      <div className="p-3 bg-bg-surface border border-status-error/30 rounded-md whitespace-pre-wrap text-white font-mono text-xs leading-relaxed">
        {error}
      </div>
    </div>
  );
};
