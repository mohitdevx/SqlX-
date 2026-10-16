import { DATA_EXTENSIONS, type DataExtension } from '@/data/dataExtensions';
import { Blocks, ChevronDown, RotateCcw } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

export interface ExtensionsMenuProps {
  onApplyOption: (optionId: string) => void;
  onReset: () => void;
  hasActiveManipulation: boolean;
}

export const ExtensionsMenu: React.FC<ExtensionsMenuProps> = ({
  onApplyOption,
  onReset,
  hasActiveManipulation,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedExtensionId, setSelectedExtensionId] = useState<string>('transformer');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedExtension: DataExtension =
    DATA_EXTENSIONS.find((e) => e.id === selectedExtensionId) || DATA_EXTENSIONS[0];

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
          isOpen
            ? 'bg-white/[0.1] text-tx-primary'
            : 'bg-white/[0.04] hover:bg-white/[0.08] text-tx-secondary hover:text-tx-primary'
        }`}
        title="Apply Data Manipulation Extensions"
      >
        <Blocks className="w-3.5 h-3.5 text-white" />
        <span>Extensions</span>
        <ChevronDown
          className={`w-3 h-3 text-tx-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-96 rounded-xl bg-bg-surface border border-white/10 shadow-2xl p-3 z-50 space-y-3 animate-fade-in font-sans">
          {/* Popover Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center space-x-1.5">
              <Blocks className="w-4 h-4 text-white" />
              <span className="text-xs font-semibold text-tx-primary">Data Extensions</span>
            </div>
            {hasActiveManipulation && (
              <button
                type="button"
                onClick={() => {
                  onReset();
                  setIsOpen(false);
                }}
                className="flex items-center space-x-1 text-[11px] text-tx-muted hover:text-tx-primary px-1.5 py-0.5 rounded hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* 1. Select Extension */}
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-mono text-tx-muted tracking-wider">
              Select Extension
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {DATA_EXTENSIONS.map((ext) => {
                const Icon = ext.icon;
                const isSel = ext.id === selectedExtensionId;
                return (
                  <button
                    type="button"
                    key={ext.id}
                    onClick={() => setSelectedExtensionId(ext.id)}
                    className={`flex items-center space-x-2 p-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                      isSel
                        ? 'bg-accent-primary/15 text-tx-primary border border-accent-primary/30'
                        : 'bg-bg-surface hover:bg-bg-surface/10 text-tx-secondary hover:text-tx-primary'
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 ${isSel ? 'text-accent-primary' : 'text-tx-muted'}`}
                    />
                    <span className="truncate font-medium text-[11px]">{ext.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Select Option provided by this extension */}
          <div className="space-y-1 pt-1 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono text-tx-muted tracking-wider">
                Select Option to Apply
              </span>
              <span className="text-[10px] text-tx-muted">
                {selectedExtension.options.length} actions
              </span>
            </div>

            <div className="max-h-52 overflow-y-auto custom-scrollbar space-y-1 pr-0.5">
              {selectedExtension.options.map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => {
                    onApplyOption(opt.id);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-bg-surface hover:bg-bg-surface/10 text-left transition-colors cursor-pointer group"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="text-xs font-medium text-tx-primary group-hover:text-accent-primary transition-colors flex items-center space-x-1.5">
                      <span>{opt.name}</span>
                      {opt.badge && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-white/[0.06] text-tx-muted font-mono">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-tx-muted truncate mt-0.5">
                      {opt.description}
                    </div>
                  </div>
                  <span className="text-[11px] text-accent-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium shrink-0">
                    Apply &rarr;
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
