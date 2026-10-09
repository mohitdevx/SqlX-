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
import { Plus, Terminal, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'explorer' | 'query' | 'theme'>('query');
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const { tabs, activeTabId, setActiveTab, createTab, closeTab, updateSql, runActiveQuery } =
    useQueryStore();
  const { activeConnectionId } = useConnectionStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);

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
      {/* Top Title & Quick Actions Header */}
      <TitleBar
        onOpenNewConnection={() => setIsConnectionModalOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenThemeManager={() => setActiveView('theme')}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex flex-row overflow-hidden">
        <ActivityBar activeView={activeView} setActiveView={setActiveView} />

        {/* Schema Tree Sidebar */}
        {activeView === 'explorer' && <SchemaTree />}

        {/* Theme Manager View */}
        {activeView === 'theme' && <ThemeManager />}

        {/* SQL Query Workspace View */}
        {activeView === 'query' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tab Strip */}
            <div className="h-9 bg-bg-surface border-b border-border-subtle flex items-center px-2 space-x-1 overflow-x-auto">
              {tabs.map((tab) => {
                const isActive = tab.id === activeTabId;
                return (
                  <div
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`h-7 px-3 flex items-center space-x-2 text-xs font-mono rounded cursor-pointer border transition-colors ${
                      isActive
                        ? 'bg-bg-base text-tx-primary border-border-default font-medium'
                        : 'text-tx-secondary hover:text-tx-primary border-transparent hover:bg-bg-overlay'
                    }`}
                  >
                    <Terminal className="w-3 h-3 text-tx-muted" />
                    <span>{tab.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(tab.id);
                      }}
                      className="hover:text-status-error p-0.5 rounded text-tx-muted transition-colors"
                      title="Close Tab (Ctrl+W)"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}

              <button
                onClick={() => createTab()}
                className="p-1 text-tx-secondary hover:text-tx-primary hover:bg-bg-overlay rounded transition-colors"
                title="New Query Tab (Ctrl+T)"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Split View: Editor (Top 42%) + Results Panel (Bottom 58%) */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="h-[42%] border-b border-border-subtle overflow-hidden">
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
