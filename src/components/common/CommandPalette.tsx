import { useConnectionStore } from '@/stores/connectionStore';
import { useQueryStore } from '@/stores/queryStore';
import { Database, Palette, Play, Plus, RefreshCw, Search, X } from 'lucide-react';
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
      label: 'Execute Query (F5)',
      icon: Play,
      action: () => {
        if (activeConnectionId) runActiveQuery(activeConnectionId);
      },
    },
    {
      id: 'new-tab',
      label: 'New SQL Query Tab (Ctrl+T)',
      icon: Plus,
      action: () => {
        createTab();
      },
    },
    {
      id: 'new-conn',
      label: 'New Database Connection',
      icon: Database,
      action: () => {
        onOpenNewConnection();
      },
    },
    {
      id: 'refresh-schema',
      label: 'Refresh Database Schema Tree',
      icon: RefreshCw,
      action: () => {
        refreshSchema();
      },
    },
    {
      id: 'switch-theme',
      label: 'Open Theme & Palette Manager',
      icon: Palette,
      action: () => {
        onOpenThemeManager();
      },
    },
  ];

  const filtered = actions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center pt-24 p-4">
      <div className="bg-bg-surface border border-border-default rounded-lg w-full max-w-lg shadow-2xl overflow-hidden font-sans text-tx-primary">
        <div className="p-3 border-b border-border-subtle flex items-center space-x-2">
          <Search className="w-4 h-4 text-tx-muted" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or action..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-tx-primary focus:outline-none placeholder:text-tx-muted font-mono"
          />
          <button onClick={onClose} className="text-tx-muted hover:text-tx-primary p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-2 max-h-64 overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xs text-tx-muted font-mono">
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
                  className="flex items-center space-x-2.5 p-2 rounded hover:bg-bg-overlay cursor-pointer text-xs font-mono text-tx-secondary hover:text-tx-primary transition-colors"
                >
                  <Icon className="w-4 h-4 text-accent-primary flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
