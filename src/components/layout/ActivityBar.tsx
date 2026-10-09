import { Database, Palette, Terminal } from 'lucide-react';
import type React from 'react';

interface ActivityBarProps {
  activeView: 'explorer' | 'query' | 'theme';
  setActiveView: (view: 'explorer' | 'query' | 'theme') => void;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({ activeView, setActiveView }) => {
  const items = [
    { id: 'query', icon: Terminal, label: 'SQL Query Workspace' },
    { id: 'explorer', icon: Database, label: 'Database & Schema Explorer' },
    { id: 'theme', icon: Palette, label: 'Solid Themes & JSON Engine' },
  ] as const;

  return (
    <aside className="w-12 bg-bg-surface border-r border-border-subtle flex flex-col items-center py-2 space-y-1 select-none">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            title={item.label}
            className={`w-9 h-9 flex items-center justify-center rounded transition-colors ${
              isActive
                ? 'bg-accent-primary text-accent-text'
                : 'text-tx-secondary hover:text-tx-primary hover:bg-bg-overlay'
            }`}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}
    </aside>
  );
};
