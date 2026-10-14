import { renderHighlightedJson } from '@/utils/jsonHighlight';
import type React from 'react';

export interface JsonViewProps {
  jsonObjects: Record<string, unknown>[];
}

export const JsonView: React.FC<JsonViewProps> = ({ jsonObjects }) => {
  return (
    <div className="w-full h-full flex flex-col bg-editor-bg overflow-hidden select-text">
      {jsonObjects.length > 300 && (
        <div className="px-4 py-1.5 bg-white/[0.02] border-b border-white/5 text-[11px] font-mono text-tx-muted flex items-center justify-between">
          <span>Displaying first 300 rows of {jsonObjects.length} total rows.</span>
          <span className="text-tx-secondary">Full dataset copied via Clipboard</span>
        </div>
      )}
      <div className="flex-1 overflow-auto p-4 custom-scrollbar text-tx-primary">
        {renderHighlightedJson(jsonObjects)}
      </div>
    </div>
  );
};
