import React from 'react';
import { Database, Terminal, Table2, Layers, Palette } from 'lucide-react';

interface ActivityBarProps {
  activeView: 'explorer' | 'query' | 'visualizer' | 'theme';
  setActiveView: (view: 'explorer' | 'query' | 'visualizer' | 'theme') => void;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({ activeView, setActiveView }) => {
  const items = [
    { id: 'explorer', icon: Database, label: 'Schema Explorer' },
    { id: 'query', icon: Terminal, label: 'SQL Query Tabs' },
    { id: 'visualizer', icon: Table2, label: 'Table Visualizer' },
    { id: 'theme', icon: Palette, label: 'JSON Theme Switcher' },
  ] as const;

  return (
    <aside className="w-12 bg-bg-surface border-r border-border-subtle flex flex-col items-center py-2 space-y-1">
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
