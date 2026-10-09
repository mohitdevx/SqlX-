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
    { id: 'query', icon: Terminal, label: 'SQL Editor (Ctrl+T)' },
    { id: 'explorer', icon: Database, label: 'Schema Explorer' },
    { id: 'theme', icon: Palette, label: 'Theme Manager' },
  ] as const;

  return (
    <aside className="w-10 bg-[#0a0b0e] border-r border-white/[0.04] flex flex-col items-center justify-between py-2.5 select-none z-10">
      {/* Top Nav Items */}
      <div className="flex flex-col items-center gap-0.5 w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <div key={item.id} className="relative w-full flex items-center justify-center">
              {isActive && (
                <div className="absolute left-0 w-[2px] h-3.5 rounded-r-full bg-white/50" />
              )}
              <button
                onClick={() => setActiveView(item.id)}
                title={item.label}
                className={`w-7 h-7 rounded-md flex items-center justify-center transition-all duration-150 ${
                  isActive
                    ? 'text-white/70'
                    : 'text-white/20 hover:text-white/40 hover:bg-white/[0.03]'
                }`}
              >
                <Icon className="w-[15px] h-[15px]" strokeWidth={1.5} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom Nav Items */}
      <div className="flex flex-col items-center gap-1 w-full">
        <button
          onClick={onOpenNewConnection}
          title="New Connection"
          className="w-7 h-7 rounded-md flex items-center justify-center text-white/15 hover:text-white/35 hover:bg-white/[0.03] transition-all duration-150"
        >
          <Plus className="w-[15px] h-[15px]" strokeWidth={1.5} />
        </button>
      </div>
    </aside>
  );
};
