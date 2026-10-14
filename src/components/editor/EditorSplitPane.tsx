import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface EditorSplitPaneProps {
  editor: React.ReactNode;
  results: React.ReactNode;
  defaultHeightPct?: number;
}

export const EditorSplitPane: React.FC<EditorSplitPaneProps> = ({
  editor,
  results,
  defaultHeightPct = 38,
}) => {
  const [editorHeightPct, setEditorHeightPct] = useState(defaultHeightPct);
  const isDraggingRef = useRef(false);
  const splitContainerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(() => {
    isDraggingRef.current = true;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !splitContainerRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
      const newHeight = ((e.clientY - rect.top) / rect.height) * 100;
      if (newHeight >= 15 && newHeight <= 85) {
        setEditorHeightPct(newHeight);
      }
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div ref={splitContainerRef} className="flex-1 flex flex-col overflow-hidden relative">
      {/* Editor Workspace */}
      <div
        style={{ height: `${editorHeightPct}%` }}
        className="flex flex-col overflow-hidden bg-editor-bg"
      >
        <div className="flex-1 overflow-hidden">{editor}</div>
      </div>

      {/* Resizable Divider Handle */}
      <div
        onMouseDown={handleMouseDown}
        className="h-px bg-border-subtle hover:h-[3px] hover:bg-accent-primary cursor-row-resize flex items-center justify-center transition-all duration-150 resize-handle z-10"
      />

      {/* Results Panel */}
      <div className="flex-1 overflow-hidden">{results}</div>
    </div>
  );
};
