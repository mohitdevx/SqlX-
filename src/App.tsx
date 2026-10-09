import { CommandPalette } from '@/components/common/CommandPalette';
import { ConnectionModal } from '@/components/connection/ConnectionModal';
import { SqlEditor } from '@/components/editor/SqlEditor';
import { ActivityBar } from '@/components/layout/ActivityBar';
import { StatusBar } from '@/components/layout/StatusBar';
import { TitleBar } from '@/components/layout/TitleBar';
import { ResultsPanel } from '@/components/results/ResultsPanel';
import { SchemaTree } from '@/components/schema-tree/SchemaTree';
import { ThemeManager } from '@/components/theme/ThemeManager';
import { applyTheme } from '@/services/themeEngine';
import { useConnectionStore } from '@/stores/connectionStore';
import { useQueryStore } from '@/stores/queryStore';
import { useThemeStore } from '@/stores/themeStore';
import { Clock, Play, Plus, Terminal, Trash2, X } from 'lucide-react';
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

  const {
    tabs,
    activeTabId,
    selectedSql,
    setSelectedSql,
    setActiveTab,
    createTab,
    closeTab,
    updateSql,
    runActiveQuery,
  } = useQueryStore();
  const { activeConnectionId } = useConnectionStore();
  const { currentTheme } = useThemeStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

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

  const hasSelection = Boolean(selectedSql && selectedSql.trim().length > 0);

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
            <div className="h-9 bg-bg-surface border-b border-border-subtle flex items-center justify-between px-1.5 overflow-x-auto transition-colors duration-150">
              <div className="flex items-center gap-0.5 h-full">
                {tabs.map((tab) => {
                  const isActive = tab.id === activeTabId;
                  return (
                    <div
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative h-full px-3 flex items-center gap-1.5 text-[11px] cursor-pointer transition-all duration-150 ${
                        isActive
                          ? 'text-tx-primary font-medium'
                          : 'text-tx-muted hover:text-tx-secondary'
                      }`}
                    >
                      <Terminal className="w-3 h-3 opacity-60" strokeWidth={1.5} />
                      <span className="truncate max-w-[110px]">{tab.title}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          closeTab(tab.id);
                        }}
                        className="ml-1 opacity-0 group-hover:opacity-100 hover:opacity-100 hover:text-tx-primary p-0.5 rounded transition-all"
                        style={{ opacity: isActive ? 0.6 : undefined }}
                        title="Close Tab (Ctrl+W)"
                      >
                        <X className="w-2.5 h-2.5" strokeWidth={2} />
                      </button>
                      {/* Active indicator line */}
                      {isActive && (
                        <div className="absolute bottom-0 left-3 right-3 h-px bg-accent-primary rounded-full" />
                      )}
                    </div>
                  );
                })}

                <button
                  onClick={() => createTab()}
                  className="w-6 h-6 flex items-center justify-center text-tx-muted hover:text-tx-primary hover:bg-bg-overlay rounded transition-all duration-150 ml-0.5"
                  title="New Tab (Ctrl+T)"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>

              {/* Tab Bar Right: Execution Summary */}
              <div className="flex items-center gap-2 pr-1 shrink-0">
                {activeTab?.result && (
                  <div className="flex items-center gap-1 font-mono text-[10px] text-tx-muted">
                    <Clock className="w-2.5 h-2.5" strokeWidth={1.5} />
                    <span>{activeTab.result.executionTimeMs}ms</span>
                    <span className="text-tx-muted/40">·</span>
                    <span>{activeTab.result.rows.length} rows</span>
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
                <div className="h-7 bg-bg-surface/80 border-b border-border-subtle flex items-center justify-between px-3 text-[10px] select-none transition-colors duration-150">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-tx-muted uppercase tracking-wider text-[9px]">
                      query
                    </span>
                    {hasSelection && (
                      <span className="text-[9px] px-1.5 py-px rounded-sm bg-accent-primary/15 text-accent-primary border border-accent-primary/20 font-medium">
                        selection
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {hasSelection && (
                      <button
                        onClick={() => {
                          if (activeConnectionId) runActiveQuery(activeConnectionId);
                        }}
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-tx-primary text-tx-inverse hover:opacity-90 text-[9px] font-semibold transition-colors shadow-sm"
                      >
                        <Play className="w-2 h-2 fill-current" strokeWidth={0} />
                        <span>Run Selection</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (activeTab) {
                          updateSql(activeTab.id, '');
                          setSelectedSql('');
                        }
                      }}
                      className="w-5 h-5 flex items-center justify-center hover:text-tx-primary text-tx-muted rounded transition-colors"
                      title="Clear Buffer"
                    >
                      <Trash2 className="w-3 h-3" strokeWidth={1.5} />
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
                      onSelectionChange={(sel) => setSelectedSql(sel)}
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
                className="h-px bg-border-subtle hover:h-[3px] hover:bg-accent-primary cursor-row-resize flex items-center justify-center transition-all duration-150 resize-handle z-10"
              />

              {/* Results Panel */}
              <div className="flex-1 overflow-hidden">
                <ResultsPanel
                  result={activeTab?.result || null}
                  error={activeTab?.error || null}
                  isRunning={activeTab?.isRunning}
                />
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
