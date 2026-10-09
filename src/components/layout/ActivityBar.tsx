import { Database, Palette, Plus, Terminal } from 'lucide-react';
import type React from 'react';

interface ActivityBarProps {
  activeView: 'explorer' | 'query' | 'theme';
  setActiveView: (view: 'explorer' | 'query' | 'theme') => void;
  onOpenNewConnection: () => void;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({
  activeView,
  setActiveView,
  onOpenNewConnection,
}) => {
  const navItems = [
    { id: 'query', icon: Terminal, label: 'SQL Query Workspace (Ctrl+T)' },
    { id: 'explorer', icon: Database, label: 'Schema Explorer' },
    { id: 'theme', icon: Palette, label: 'Theme & Palette Customizer' },
  ] as const;

  return (
    <aside className="w-11 bg-bg-surface border-r border-border-subtle flex flex-col items-center justify-between py-3 select-none z-10">
      {/* Top Nav Items */}
      <div className="flex flex-col items-center space-y-2 w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <div key={item.id} className="relative w-full flex items-center justify-center">
              {isActive && (
                <div className="absolute left-0 w-[3px] h-5 rounded-r bg-accent-primary" />
              )}
              <button
                onClick={() => setActiveView(item.id)}
                title={item.label}
                className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-bg-elevated text-accent-primary font-bold shadow-sm'
                    : 'text-tx-secondary hover:text-tx-primary hover:bg-bg-overlay'
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom Nav Items */}
      <div className="flex flex-col items-center space-y-2 w-full">
        <button
          onClick={onOpenNewConnection}
          title="New Connection"
          className="w-8 h-8 rounded-md flex items-center justify-center text-tx-secondary hover:text-tx-primary hover:bg-bg-overlay transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
