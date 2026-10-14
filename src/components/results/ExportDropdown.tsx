import {
  Braces,
  ChevronDown,
  Clipboard,
  ClipboardCheck,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

export interface ExportDropdownProps {
  onExportJson: () => void;
  onExportCsv: () => void;
  onCopyJson: () => void;
  copied: boolean;
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({
  onExportJson,
  onExportCsv,
  onCopyJson,
  copied,
}) => {
  const [isOpen, setIsOpen] = useState(false);
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
        title="Export options"
      >
        <Download className="w-3.5 h-3.5 text-tx-muted" strokeWidth={1.5} />
        <span>Export</span>
        <ChevronDown
          className={`w-3 h-3 text-tx-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl bg-bg-surface border border-white/10 shadow-2xl p-1.5 z-50 animate-fade-in font-sans space-y-0.5">
          <button
            type="button"
            onClick={() => {
              onExportJson();
              setIsOpen(false);
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs text-tx-secondary hover:text-tx-primary hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
          >
            <Braces className="w-3.5 h-3.5 text-tx-muted" strokeWidth={1.5} />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onExportCsv();
              setIsOpen(false);
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs text-tx-secondary hover:text-tx-primary hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-tx-muted" strokeWidth={1.5} />
            <span>Export CSV</span>
          </button>

          <div className="my-1 border-t border-white/10" />

          <button
            type="button"
            onClick={() => {
              onCopyJson();
              setIsOpen(false);
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs text-tx-secondary hover:text-tx-primary hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
          >
            {copied ? (
              <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
            ) : (
              <Clipboard className="w-3.5 h-3.5 text-tx-muted" strokeWidth={1.5} />
            )}
            <span className={copied ? 'text-emerald-400 font-medium' : ''}>
              {copied ? 'Copied JSON!' : 'Copy JSON'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
