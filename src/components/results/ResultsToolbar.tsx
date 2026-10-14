import { UnderlineTab } from '@/components/ui/atoms/UnderlineTab';
import { SearchInput } from '@/components/ui/molecules/SearchInput';
import { BarChart3, Braces, Columns, Sparkles, Table, X } from 'lucide-react';
import type React from 'react';
import { ExportDropdown } from './ExportDropdown';
import { ExtensionsMenu } from './ExtensionsMenu';

export type ResultsTab = 'grid' | 'json' | 'chart' | 'structure';

export interface ResultsToolbarProps {
  activeTab: ResultsTab;
  setActiveTab: (tab: ResultsTab) => void;
  rowCount: number;
  columnCount: number;
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
  columnCount,
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
  return (
    <div className="h-10 bg-bg-surface/90 border-b border-border-subtle flex items-center justify-between px-3 text-xs select-none relative z-30">
      {/* Left Side: Mode Tabs & Meta */}
      <div className="flex items-center space-x-3 min-w-0 h-full">
        {/* Mode Selector Tabs (Grid, JSON, Chart, Schema) */}
        <div className="flex items-center space-x-4 h-full">
          <UnderlineTab
            isActive={activeTab === 'grid'}
            onClick={() => setActiveTab('grid')}
            icon={<Table className="w-3.5 h-3.5" strokeWidth={1.5} />}
          >
            Grid ({rowCount})
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
            isActive={activeTab === 'structure'}
            onClick={() => setActiveTab('structure')}
            icon={<Columns className="w-3.5 h-3.5" strokeWidth={1.5} />}
          >
            Schema ({columnCount})
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

      {/* Right Side: Search, Extensions Menu, Export Dropdown */}
      <div className="flex items-center space-x-2 shrink-0">
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
