import { CommandPalette } from '@/components/common/CommandPalette';
import { ConnectionModal } from '@/components/connection/ConnectionModal';
import { SqlEditor } from '@/components/editor/SqlEditor';
import { ActivityBar } from '@/components/layout/ActivityBar';
import { StatusBar } from '@/components/layout/StatusBar';
import { TitleBar } from '@/components/layout/TitleBar';
import { ResultsPanel } from '@/components/results/ResultsPanel';
import { SchemaTree } from '@/components/schema-tree/SchemaTree';
import { ThemeManager } from '@/components/theme/ThemeManager';
import { useConnectionStore } from '@/stores/connectionStore';
import { useQueryStore } from '@/stores/queryStore';
import { Clock, Plus, Terminal, Trash2, X } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'explorer' | 'query' | 'theme'>('query');
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Resizable Split Pane State (percentage height for editor, default 38%)
  const [editorHeightPct, setEditorHeightPct] = useState(38);
  const isDraggingRef = useRef(false);
  const splitContainerRef = useRef<HTMLDivElement>(null);

  const { tabs, activeTabId, setActiveTab, createTab, closeTab, updateSql, runActiveQuery } =
    useQueryStore();
  const { activeConnectionId } = useConnectionStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);

  // Dragging logic for resizable divider
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

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F5 or Ctrl+Enter -> Run query
      if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && e.key === 'Enter')) {
        e.preventDefault();
        if (activeConnectionId) {
          runActiveQuery(activeConnectionId);
        }
      }
      // Ctrl+T -> New Query Tab
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        createTab();
        setActiveView('query');
      }
      // Ctrl+W -> Close active tab
      if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault();
        if (activeTabId) {
          closeTab(activeTabId);
        }
      }
      // Ctrl+K -> Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeConnectionId, activeTabId, runActiveQuery, createTab, closeTab]);

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-bg-base overflow-hidden select-none font-sans">
      {/* Top TitleBar */}
      <TitleBar
        onOpenNewConnection={() => setIsConnectionModalOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenThemeManager={() => setActiveView('theme')}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-row overflow-hidden">
        {/* Left Activity Rail */}
        <ActivityBar
          activeView={activeView}
          setActiveView={setActiveView}
          onOpenNewConnection={() => setIsConnectionModalOpen(true)}
        />

        {/* Left Schema Explorer */}
        {activeView === 'explorer' && <SchemaTree />}

        {/* Theme Manager View */}
        {activeView === 'theme' && <ThemeManager />}

        {/* SQL Query Workspace */}
        {activeView === 'query' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-bg-base">
            {/* Tab Bar */}
            <div className="h-10 bg-bg-surface border-b border-border-subtle flex items-center justify-between px-2 overflow-x-auto">
              <div className="flex items-center space-x-1">
                {tabs.map((tab) => {
                  const isActive = tab.id === activeTabId;
                  return (
                    <div
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`h-8 px-3 flex items-center space-x-2 text-xs font-mono rounded-md cursor-pointer transition-all border ${
                        isActive
                          ? 'bg-bg-base text-white border-border-default font-medium shadow-sm'
                          : 'text-tx-secondary hover:text-white border-transparent hover:bg-bg-overlay'
                      }`}
                    >
                      <Terminal className="w-3.5 h-3.5 text-white/80" strokeWidth={1.5} />
                      <span className="truncate max-w-[120px]">{tab.title}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          closeTab(tab.id);
                        }}
                        className="hover:text-white p-0.5 rounded text-tx-muted hover:bg-bg-overlay transition-colors"
                        title="Close Tab (Ctrl+W)"
                      >
                        <X className="w-3 h-3" strokeWidth={1.5} />
                      </button>
                    </div>
                  );
                })}

                <button
                  onClick={() => createTab()}
                  className="p-1 text-tx-muted hover:text-white hover:bg-bg-overlay rounded-md transition-colors"
                  title="New Tab (Ctrl+T)"
                >
                  <Plus className="w-4 h-4 text-white/80" strokeWidth={1.5} />
                </button>
              </div>

              {/* Tab Bar Right Summary */}
              <div className="flex items-center space-x-2 text-xs text-tx-muted">
                {activeTab?.result && (
                  <div className="flex items-center space-x-1 font-mono text-[11px] px-2 py-0.5 rounded bg-bg-base border border-border-subtle text-tx-secondary">
                    <Clock className="w-3 h-3 text-tx-muted" strokeWidth={1.5} />
                    <span>{activeTab.result.executionTimeMs}ms</span>
                  </div>
                )}
              </div>
            </div>

            {/* Split Container: Resizable Editor (Top) + Results Panel (Bottom) */}
            <div ref={splitContainerRef} className="flex-1 flex flex-col overflow-hidden relative">
              {/* Editor Workspace */}
              <div
                style={{ height: `${editorHeightPct}%` }}
                className="flex flex-col overflow-hidden bg-editor-bg"
              >
                {/* Editor Action Toolbar */}
                <div className="h-8 bg-bg-surface/60 border-b border-border-subtle flex items-center justify-between px-3 text-[11px] font-mono select-none">
                  <div className="flex items-center space-x-3">
                    <span className="text-tx-muted uppercase font-semibold text-[10px]">
                      SQL Query Buffer
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        if (activeTab) {
                          updateSql(activeTab.id, '');
                        }
                      }}
                      className="p-1 hover:text-white text-tx-muted rounded transition-colors"
                      title="Clear Editor"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                {/* CodeMirror SQL Editor */}
                <div className="flex-1 overflow-hidden">
                  {activeTab && (
                    <SqlEditor
                      key={activeTab.id}
                      value={activeTab.sql}
                      onChange={(sql) => updateSql(activeTab.id, sql)}
                      onExecute={() => {
                        if (activeConnectionId) {
                          runActiveQuery(activeConnectionId);
                        }
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Resizable Divider Handle */}
              <div
                onMouseDown={handleMouseDown}
                className="h-1.5 bg-border-subtle hover:bg-border-strong cursor-row-resize flex items-center justify-center transition-colors resize-handle z-10"
              >
                <div className="w-8 h-0.5 bg-white/20 rounded-full" />
              </div>

              {/* Results Panel */}
              <div className="flex-1 overflow-hidden">
                <ResultsPanel result={activeTab?.result || null} error={activeTab?.error || null} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <StatusBar />

      {/* Modals & Dialogs */}
      <ConnectionModal
        isOpen={isConnectionModalOpen}
        onClose={() => setIsConnectionModalOpen(false)}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenNewConnection={() => setIsConnectionModalOpen(true)}
        onOpenThemeManager={() => setActiveView('theme')}
      />
    </div>
  );
};
export default App;
