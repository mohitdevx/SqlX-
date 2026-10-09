import { useConnectionStore } from '@/stores/connectionStore';
import { useQueryStore } from '@/stores/queryStore';
import { ArrowRight, Database, Palette, Play, Plus, RefreshCw, Search, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewConnection: () => void;
  onOpenThemeManager: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenNewConnection,
  onOpenThemeManager,
}) => {
  const [query, setQuery] = useState('');
  const { createTab, runActiveQuery } = useQueryStore();
  const { activeConnectionId, refreshSchema } = useConnectionStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'run-query',
      label: 'Execute Active Query',
      shortcut: 'F5',
      icon: Play,
      action: () => {
        if (activeConnectionId) runActiveQuery(activeConnectionId);
      },
    },
    {
      id: 'new-tab',
      label: 'New SQL Query Tab',
      shortcut: 'Ctrl+T',
      icon: Plus,
      action: () => {
        createTab();
      },
    },
    {
      id: 'new-conn',
      label: 'New Database Connection',
      shortcut: 'Ctrl+N',
      icon: Database,
      action: () => {
        onOpenNewConnection();
      },
    },
    {
      id: 'refresh-schema',
      label: 'Refresh Database Schema Tree',
      shortcut: 'Ctrl+R',
      icon: RefreshCw,
      action: () => {
        refreshSchema();
      },
    },
    {
      id: 'switch-theme',
      label: 'Open Theme & Palette Manager',
      shortcut: '',
      icon: Palette,
      action: () => {
        onOpenThemeManager();
      },
    },
  ];

  const filtered = actions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-start justify-center pt-24 p-4">
      <div className="bg-bg-surface border border-border-default rounded-xl w-full max-w-lg shadow-2xl overflow-hidden font-sans text-tx-primary">
        <div className="p-3.5 border-b border-border-subtle flex items-center space-x-2.5 bg-bg-surface">
          <Search className="w-4 h-4 text-tx-muted flex-shrink-0" strokeWidth={1.5} />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or action..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-white focus:outline-none placeholder:text-tx-muted font-mono"
          />
          <button
            onClick={onClose}
            className="text-tx-muted hover:text-white p-1 rounded hover:bg-bg-overlay transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-2 max-h-72 overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-tx-muted font-mono">
              No matching commands found.
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-bg-overlay cursor-pointer text-xs transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 rounded-md bg-bg-base border border-border-subtle flex items-center justify-center text-white/80 group-hover:text-white transition-colors">
                      <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </div>
                    <span className="font-medium text-white tracking-tight">{item.label}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {item.shortcut && (
                      <kbd className="text-[10px] font-mono bg-bg-base px-2 py-0.5 rounded border border-border-subtle text-tx-muted">
                        {item.shortcut}
                      </kbd>
                    )}
                    <ArrowRight
                      className="w-3.5 h-3.5 text-tx-muted opacity-0 group-hover:opacity-100 transition-opacity"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
