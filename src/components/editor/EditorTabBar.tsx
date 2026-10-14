import type { QueryResult } from '@/types/database';
import { Clock, Pencil, Plus, Terminal, X } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

export interface TabItem {
  id: string;
  title: string;
  sql: string;
  result?: QueryResult | null;
  error?: string | null;
  isRunning?: boolean;
}

export interface EditorTabBarProps {
  tabs: TabItem[];
  activeTabId: string | null;
  onSelectTab: (id: string) => void;
  onCreateTab: () => void;
  onCloseTab: (id: string) => void;
  onRenameTab: (id: string, title: string) => void;
  activeResult?: QueryResult | null;
}

export const EditorTabBar: React.FC<EditorTabBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCreateTab,
  onCloseTab,
  onRenameTab,
  activeResult,
}) => {
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleStartRename = (tabId: string, currentTitle: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingTabId(tabId);
    setEditingTitle(currentTitle);
  };

  const handleSaveRename = (tabId: string) => {
    if (editingTitle.trim()) {
      onRenameTab(tabId, editingTitle.trim());
    }
    setEditingTabId(null);
  };

  return (
    <div className="h-9 bg-bg-surface border-b border-border-subtle flex items-center justify-between px-1.5 overflow-x-auto transition-colors duration-150">
      <div className="flex items-center gap-0.5 h-full">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const isEditing = editingTabId === tab.id;
          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`group relative h-full px-2.5 flex items-center gap-1.5 text-[11px] cursor-pointer transition-all duration-150 ${
                isActive ? 'text-tx-primary font-medium' : 'text-tx-muted hover:text-tx-secondary'
              }`}
            >
              <Terminal className="w-3 h-3 opacity-60 shrink-0" strokeWidth={1.5} />
              {isEditing ? (
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveRename(tab.id);
                    if (e.key === 'Escape') setEditingTabId(null);
                  }}
                  onBlur={() => handleSaveRename(tab.id)}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                  className="bg-bg-base border border-accent-primary rounded px-1.5 py-0.2 text-[11px] text-tx-primary font-sans focus:outline-none w-20 max-w-[120px]"
                />
              ) : (
                <span
                  onDoubleClick={(e) => handleStartRename(tab.id, tab.title, e)}
                  title="Double-click to rename"
                  className="truncate max-w-[110px]"
                >
                  {tab.title}
                </span>
              )}

              {!isEditing && (
                <button
                  type="button"
                  onClick={(e) => handleStartRename(tab.id, tab.title, e)}
                  className="opacity-0 group-hover:opacity-60 hover:!opacity-100 p-0.5 rounded text-tx-muted hover:text-tx-primary transition-opacity"
                  title="Rename Tab"
                >
                  <Pencil className="w-2.5 h-2.5" />
                </button>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
                className="opacity-0 group-hover:opacity-100 hover:opacity-100 hover:text-tx-primary p-0.5 rounded transition-all"
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
          type="button"
          onClick={onCreateTab}
          className="w-6 h-6 flex items-center justify-center text-tx-muted hover:text-tx-primary hover:bg-bg-overlay rounded transition-all duration-150 ml-0.5 cursor-pointer"
          title="New Tab (Ctrl+T)"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Tab Bar Right: Execution Summary */}
      <div className="flex items-center gap-2 pr-1 shrink-0">
        {activeResult && (
          <div className="flex items-center gap-1 font-mono text-[10px] text-tx-muted">
            <Clock className="w-2.5 h-2.5" strokeWidth={1.5} />
            <span>{activeResult.executionTimeMs}ms</span>
            <span className="text-tx-muted/40">·</span>
            <span>{activeResult.rows.length} rows</span>
          </div>
        )}
      </div>
    </div>
  );
};
