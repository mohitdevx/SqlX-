import { CommandPalette } from '@/components/common/CommandPalette';
import { ConnectionsDashboard } from '@/components/connection/ConnectionsDashboard';
import { EditorSplitPane } from '@/components/editor/EditorSplitPane';
import { EditorTabBar } from '@/components/editor/EditorTabBar';
import { SqlEditor } from '@/components/editor/SqlEditor';
import { Rightbar } from '@/components/layout/Rightbar';
import { type NavView, Sidebar } from '@/components/layout/Sidebar';
import { TitleBar } from '@/components/layout/TitleBar';
import { ResultsPanel } from '@/components/results/ResultsPanel';
import { ThemeManager } from '@/components/theme/ThemeManager';
import { ExtensionsView } from '@/components/views/ExtensionsView';
import { HistoryView } from '@/components/views/HistoryView';
import { HomeView } from '@/components/views/HomeView';
import { SavedQueriesView } from '@/components/views/SavedQueriesView';
import { applyTheme } from '@/services/themeEngine';
import { useConnectionStore } from '@/stores/connectionStore';
import { useQueryStore } from '@/stores/queryStore';
import { useThemeStore } from '@/stores/themeStore';
import type React from 'react';
import { useEffect, useState } from 'react';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<NavView>('query');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isRightbarOpen, setIsRightbarOpen] = useState(true);

  const {
    tabs,
    activeTabId,
    setSelectedSql,
    setActiveTab,
    createTab,
    closeTab,
    updateSql,
    renameTab,
    runActiveQuery,
    nextPage,
    prevPage,
    changePageSize,
  } = useQueryStore();
  const { activeConnectionId } = useConnectionStore();
  const { currentTheme } = useThemeStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F5 or Ctrl+Enter -> Run query
      const isEnter =
        e.key === 'Enter' ||
        e.key === 'Return' ||
        e.code === 'Enter' ||
        e.code === 'NumpadEnter' ||
        e.keyCode === 13 ||
        e.which === 13;
      const isModifier = e.ctrlKey || e.metaKey;
      if (e.key === 'F5' || (isModifier && isEnter)) {
        e.preventDefault();
        if (!document.activeElement?.closest('.cm-editor')) {
          if (activeConnectionId) {
            runActiveQuery(activeConnectionId);
          }
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
      // Ctrl+I -> Toggle Rightbar (Table Inspector)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setIsRightbarOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeConnectionId, activeTabId, runActiveQuery, createTab, closeTab]);

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-bg-base overflow-hidden select-none font-sans">
      {/* Top TitleBar */}
      <TitleBar
        onOpenNewConnection={() => setActiveView('home')}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenThemeManager={() => setActiveView('theme')}
        isRightbarOpen={isRightbarOpen}
        onToggleRightbar={() => setIsRightbarOpen((prev) => !prev)}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-row overflow-hidden">
        {/* Mouse-Resizable Side Panel */}
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          onOpenNewConnectionModal={() => setActiveView('home')}
          onTableSelected={() => setIsRightbarOpen(true)}
        />

        {/* Home / Add Database Setup View */}
        {activeView === 'home' && <HomeView onNavigate={(v) => setActiveView(v)} />}

        {/* Connections Management Dashboard View */}
        {activeView === 'connections' && (
          <ConnectionsDashboard
            onOpenNewConnectionModal={() => setActiveView('home')}
            onNavigateToEditor={() => setActiveView('query')}
          />
        )}

        {/* Query History View */}
        {activeView === 'history' && (
          <HistoryView onNavigateToEditor={() => setActiveView('query')} />
        )}

        {/* Saved Queries View */}
        {activeView === 'saved-queries' && (
          <SavedQueriesView onNavigateToEditor={() => setActiveView('query')} />
        )}

        {/* Extensions View */}
        {activeView === 'extensions' && <ExtensionsView />}

        {/* Theme Manager View */}
        {activeView === 'theme' && <ThemeManager />}

        {/* SQL Query Workspace (Default) */}
        {activeView === 'query' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-bg-base">
            <EditorTabBar
              tabs={tabs}
              activeTabId={activeTabId}
              onSelectTab={setActiveTab}
              onCreateTab={createTab}
              onCloseTab={closeTab}
              onRenameTab={renameTab}
              activeResult={activeTab?.result}
            />

            <EditorSplitPane
              editor={
                activeTab && (
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
                )
              }
              results={
                <ResultsPanel
                  result={activeTab?.result || null}
                  error={activeTab?.error || null}
                  isRunning={activeTab?.isRunning}
                  page={activeTab?.page || 1}
                  pageSize={activeTab?.pageSize || 1000}
                  onNextPage={() => {
                    if (activeConnectionId) nextPage(activeConnectionId);
                  }}
                  onPrevPage={() => {
                    if (activeConnectionId) prevPage(activeConnectionId);
                  }}
                  onChangePageSize={(size) => {
                    if (activeConnectionId) changePageSize(activeConnectionId, size);
                  }}
                />
              }
            />
          </div>
        )}

        {/* Mouse-Resizable Right Panel (Table Schema Inspector) */}
        <Rightbar isOpen={isRightbarOpen} onClose={() => setIsRightbarOpen(false)} />
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenNewConnection={() => setActiveView('home')}
        onOpenThemeManager={() => setActiveView('theme')}
      />
    </div>
  );
};
export default App;
