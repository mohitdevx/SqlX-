import React, { useState } from 'react';
import { TitleBar } from '@/components/layout/TitleBar';
import { ActivityBar } from '@/components/layout/ActivityBar';
import { StatusBar } from '@/components/layout/StatusBar';
import { SchemaTree } from '@/components/schema-tree/SchemaTree';
import { SqlEditor } from '@/components/editor/SqlEditor';
import { DataGrid } from '@/components/grid/DataGrid';
import { useQueryStore } from '@/stores/queryStore';
import { useThemeStore } from '@/stores/themeStore';
import { Plus, X } from 'lucide-react';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'explorer' | 'query' | 'visualizer' | 'theme'>('query');
  const { tabs, activeTabId, setActiveTab, createTab, closeTab, updateSql } = useQueryStore();
  const { currentTheme, loadCustomThemeJson } = useThemeStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-bg-base overflow-hidden">
      <TitleBar />

      <div className="flex-1 flex flex-row overflow-hidden">
        <ActivityBar activeView={activeView} setActiveView={setActiveView} />

        {activeView === 'explorer' && <SchemaTree />}

        {activeView === 'theme' ? (
          <div className="flex-1 p-6 overflow-auto bg-bg-base">
            <h2 className="text-base font-bold text-tx-primary mb-2">Theme Manager</h2>
            <p className="text-xs text-tx-secondary mb-4">
              Current Active Theme: <span className="font-mono text-accent-primary">{currentTheme.name}</span> ({currentTheme.type})
            </p>
            <div className="border border-border-default rounded p-4 bg-bg-surface max-w-xl">
              <label className="block text-xs font-semibold text-tx-secondary mb-2">
                Paste Custom Theme JSON:
              </label>
              <textarea
                id="theme-paste-area"
                rows={10}
                className="w-full bg-editor-bg border border-border-subtle rounded p-2 text-xs font-mono text-tx-primary focus:outline-none focus:border-accent-primary"
                placeholder='{"name": "My Custom Theme", "type": "dark", "colors": { ... }}'
              />
              <button
                onClick={() => {
                  const area = document.getElementById('theme-paste-area') as HTMLTextAreaElement;
                  if (area && area.value) {
                    const ok = loadCustomThemeJson(area.value);
                    if (ok) {
                      alert('Custom theme applied successfully!');
                    } else {
                      alert('Invalid theme JSON schema.');
                    }
                  }
                }}
                className="mt-3 px-3 py-1.5 bg-accent-primary text-accent-text text-xs font-medium rounded hover:bg-accent-hover transition-colors"
              >
                Apply JSON Theme
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tab Bar */}
            <div className="h-9 bg-bg-surface border-b border-border-subtle flex items-center px-2 space-x-1 overflow-x-auto select-none">
              {tabs.map((tab) => {
                const isActive = tab.id === activeTabId;
                return (
                  <div
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`h-7 px-3 flex items-center space-x-2 text-xs font-mono rounded cursor-pointer border transition-colors ${
                      isActive
                        ? 'bg-bg-base text-tx-primary border-border-default'
                        : 'text-tx-secondary hover:text-tx-primary border-transparent hover:bg-bg-overlay'
                    }`}
                  >
                    <span>{tab.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(tab.id);
                      }}
                      className="hover:text-status-error p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
              <button
                onClick={() => createTab()}
                className="p-1 text-tx-secondary hover:text-tx-primary hover:bg-bg-overlay rounded"
                title="New Query Tab"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Split View: Editor (Top 45%) + DataGrid (Bottom 55%) */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="h-[45%] border-b border-border-subtle overflow-hidden">
                {activeTab && (
                  <SqlEditor
                    key={activeTab.id}
                    value={activeTab.sql}
                    onChange={(sql) => updateSql(activeTab.id, sql)}
                  />
                )}
              </div>

              <div className="flex-1 overflow-hidden">
                {activeTab?.error ? (
                  <div className="w-full h-full p-4 bg-status-error/10 border-t border-status-error/20 text-status-error font-mono text-xs overflow-auto">
                    <strong>Error:</strong> {activeTab.error}
                  </div>
                ) : (
                  <DataGrid data={activeTab?.result || null} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <StatusBar />
    </div>
  );
};
export default App;
