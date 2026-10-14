import { UnderlineTab } from '@/components/ui/atoms/UnderlineTab';
import { SearchInput } from '@/components/ui/molecules/SearchInput';
import {
  BarChart3,
  Braces,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LineChart,
  Sparkles,
  Table,
  X,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { ExportDropdown } from './ExportDropdown';
import { ExtensionsMenu } from './ExtensionsMenu';

export type ResultsTab = 'grid' | 'json' | 'chart' | 'graph';

export interface ResultsToolbarProps {
  activeTab: ResultsTab;
  setActiveTab: (tab: ResultsTab) => void;
  rowCount: number;
  columnCount: number;
  hasMore?: boolean;
  page?: number;
  pageSize?: number;
  onNextPage?: () => void;
  onPrevPage?: () => void;
  onChangePageSize?: (newSize: number) => void;
  activeManipulationLabel: string | null;
  onResetManipulation: () => void;
  filterText: string;
  setFilterText: (text: string) => void;
  onApplyExtensionOption: (optionId: string) => void;
  onExportJson: () => void;
  onExportCsv: () => void;
  onCopyJson: () => void;
  copied: boolean;
}

export const ResultsToolbar: React.FC<ResultsToolbarProps> = ({
  activeTab,
  setActiveTab,
  rowCount,
  hasMore = false,
  page = 1,
  pageSize = 1000,
  onNextPage,
  onPrevPage,
  onChangePageSize,
  activeManipulationLabel,
  onResetManipulation,
  filterText,
  setFilterText,
  onApplyExtensionOption,
  onExportJson,
  onExportCsv,
  onCopyJson,
  copied,
}) => {
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const pageSizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pageSizeRef.current && !pageSizeRef.current.contains(e.target as Node)) {
        setIsPageSizeOpen(false);
      }
    };
    if (isPageSizeOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPageSizeOpen]);

  return (
    <div className="h-10 bg-bg-surface/90 border-b border-border-subtle flex items-center justify-between px-3 text-xs select-none relative z-30">
      {/* Left Side: Mode Tabs (Grid, JSON, Chart, Graph) & Meta */}
      <div className="flex items-center space-x-3 min-w-0 h-full">
        <div className="flex items-center space-x-4 h-full">
          <UnderlineTab
            isActive={activeTab === 'grid'}
            onClick={() => setActiveTab('grid')}
            icon={<Table className="w-3.5 h-3.5" strokeWidth={1.5} />}
          >
            Grid ({rowCount.toLocaleString()})
          </UnderlineTab>

          <UnderlineTab
            isActive={activeTab === 'json'}
            onClick={() => setActiveTab('json')}
            icon={<Braces className="w-3.5 h-3.5" strokeWidth={1.5} />}
          >
            JSON
          </UnderlineTab>

          <UnderlineTab
            isActive={activeTab === 'chart'}
            onClick={() => setActiveTab('chart')}
            icon={<BarChart3 className="w-3.5 h-3.5" strokeWidth={1.5} />}
          >
            Chart
          </UnderlineTab>

          <UnderlineTab
            isActive={activeTab === 'graph'}
            onClick={() => setActiveTab('graph')}
            icon={<LineChart className="w-3.5 h-3.5" strokeWidth={1.5} />}
          >
            Graph
          </UnderlineTab>
        </div>

        {/* Active Data Manipulation Badge */}
        {activeManipulationLabel && (
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-[11px] font-mono">
            <Sparkles className="w-3 h-3 shrink-0" />
            <span>{activeManipulationLabel}</span>
            <button
              type="button"
              onClick={onResetManipulation}
              className="hover:text-tx-primary ml-1 text-tx-muted p-0.5 transition-colors cursor-pointer"
              title="Reset to original query output"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        )}
      </div>

      {/* Right Side: Pagination, Search, Extensions Menu, Export Dropdown */}
      <div className="flex items-center space-x-2 shrink-0">
        {/* Pagination Controls */}
        {(hasMore || page > 1) && (
          <div className="flex items-center space-x-1 bg-white/[0.04] border border-white/[0.08] rounded-md px-1 py-0.5">
            <button
              type="button"
              onClick={onPrevPage}
              disabled={page <= 1}
              className="p-1 rounded hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none text-tx-muted hover:text-tx-primary transition-colors cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-tx-secondary px-1">Page {page}</span>
            <button
              type="button"
              onClick={onNextPage}
              disabled={!hasMore}
              className="p-1 rounded hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none text-tx-muted hover:text-tx-primary transition-colors cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Custom Dark Dropdown for Page Size */}
            {onChangePageSize && (
              <div className="relative border-l border-white/10 pl-1" ref={pageSizeRef}>
                <button
                  type="button"
                  onClick={() => setIsPageSizeOpen((prev) => !prev)}
                  className="flex items-center space-x-1 px-1.5 py-0.5 rounded text-[11px] font-mono text-tx-muted hover:text-tx-primary hover:bg-white/[0.06] transition-colors cursor-pointer"
                  title="Rows per page"
                >
                  <span>{pageSize >= 1000 ? `${pageSize / 1000}k` : pageSize} / p</span>
                  <ChevronDown
                    className={`w-2.5 h-2.5 transition-transform ${isPageSizeOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isPageSizeOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-24 rounded-lg bg-[#141416] border border-white/10 shadow-2xl p-1 z-50 font-mono text-xs space-y-0.5">
                    {[500, 1000, 5000, 10000, 50000].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          onChangePageSize(size);
                          setIsPageSizeOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                          pageSize === size
                            ? 'bg-accent-primary/15 text-accent-primary font-medium'
                            : 'text-tx-secondary hover:text-tx-primary hover:bg-white/[0.06]'
                        }`}
                      >
                        <span>{size >= 1000 ? `${size / 1000}k` : size} / p</span>
                        {pageSize === size && <Check className="w-3 h-3 text-accent-primary" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <SearchInput
          value={filterText}
          onChange={setFilterText}
          placeholder="Search rows..."
          className="w-32 sm:w-40"
        />

        <div className="h-4 w-[1px] bg-white/10" />

        <ExtensionsMenu
          onApplyOption={onApplyExtensionOption}
          onReset={onResetManipulation}
          hasActiveManipulation={Boolean(activeManipulationLabel)}
        />

        <ExportDropdown
          onExportJson={onExportJson}
          onExportCsv={onExportCsv}
          onCopyJson={onCopyJson}
          copied={copied}
        />
      </div>
    </div>
  );
};
