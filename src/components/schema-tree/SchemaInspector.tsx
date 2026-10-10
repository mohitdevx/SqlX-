import { useConnectionStore } from '@/stores/connectionStore';
import { useQueryStore } from '@/stores/queryStore';
import type { ColumnSchema } from '@/types/database';
import { Calendar, Hash, KeyRound, Search, Table as TableIcon, Type, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';

interface SchemaInspectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchemaInspector: React.FC<SchemaInspectorProps> = ({ isOpen, onClose }) => {
  const { schemaTree, tableColumns, fetchTableColumns } = useConnectionStore();
  const { tabs, activeTabId, updateSql } = useQueryStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);

  const [activeTabName, setActiveTabName] = useState<'columns' | 'indexes' | 'details'>('columns');
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedTableOverride, setSelectedTableOverride] = useState<string | null>(null);

  // Derive active table from SQL query or first table in schema
  const allTables = useMemo(() => {
    if (!schemaTree) return [];
    return schemaTree.tables || [];
  }, [schemaTree]);

  const activeTable = useMemo(() => {
    if (selectedTableOverride) {
      const found = allTables.find((t) => t.name === selectedTableOverride);
      if (found) return found;
    }
    // Try to find table name in active SQL (e.g. from users / FROM users)
    if (activeTab?.sql) {
      for (const t of allTables) {
        const regex = new RegExp(`\\b${t.name}\\b`, 'i');
        if (regex.test(activeTab.sql)) {
          return t;
        }
      }
    }
    return allTables[0] || null;
  }, [allTables, selectedTableOverride, activeTab?.sql]);

  useEffect(() => {
    if (activeTable?.name) {
      fetchTableColumns(activeTable.name);
    }
  }, [activeTable?.name, fetchTableColumns]);

  const currentColumns: ColumnSchema[] = useMemo(() => {
    if (!activeTable) return [];
    return tableColumns[activeTable.name] || [];
  }, [activeTable, tableColumns]);

  const filteredColumns = useMemo(() => {
    return currentColumns.filter(
      (col) =>
        col.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
        col.dataType.toLowerCase().includes(filterQuery.toLowerCase())
    );
  }, [currentColumns, filterQuery]);

  if (!isOpen) return null;

  const handleInsertColumnQuery = (colName: string) => {
    if (!activeTab || !activeTable) return;
    const appendText = `SELECT ${colName} FROM ${activeTable.name} LIMIT 50;\n`;
    updateSql(activeTab.id, activeTab.sql ? `${activeTab.sql}\n\n${appendText}` : appendText);
  };

  const getDataTypeIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('int') || t.includes('serial') || t.includes('numeric') || t.includes('float')) {
      return <Hash className="w-3 h-3 text-blue-400" />;
    }
    if (t.includes('date') || t.includes('time')) {
      return <Calendar className="w-3 h-3 text-purple-400" />;
    }
    return <Type className="w-3 h-3 text-emerald-400" />;
  };

  return (
    <aside className="w-72 border-l border-border-subtle bg-bg-surface flex flex-col h-full select-none text-xs shrink-0 z-10 transition-all duration-200">
      {/* Header */}
      <div className="h-10 px-3 border-b border-border-subtle flex items-center justify-between bg-bg-overlay/40">
        <div className="flex items-center space-x-2 min-w-0">
          <TableIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="font-semibold text-white truncate text-xs">
            {activeTable ? activeTable.name : 'Table Inspector'}
          </span>
          {activeTable && (
            <span className="px-1.5 py-0.2 rounded bg-bg-elevated text-tx-muted font-mono text-[10px]">
              {currentColumns.length} cols
            </span>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-1 text-tx-muted hover:text-white rounded hover:bg-bg-overlay transition-colors"
          title="Close Inspector"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Table Selector Dropdown if multiple tables */}
      {allTables.length > 1 && (
        <div className="p-2 border-b border-border-subtle bg-bg-base/40">
          <select
            value={activeTable?.name || ''}
            onChange={(e) => setSelectedTableOverride(e.target.value)}
            className="w-full px-2 py-1 rounded bg-bg-surface border border-border-subtle text-[11px] text-white focus:outline-none focus:border-blue-500 font-mono"
          >
            {allTables.map((t) => (
              <option key={t.name} value={t.name}>
                table: {t.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border-subtle bg-bg-base/60">
        <button
          onClick={() => setActiveTabName('columns')}
          className={`flex-1 py-1.5 text-center text-[11px] font-medium transition-colors border-b-2 ${
            activeTabName === 'columns'
              ? 'border-blue-500 text-white bg-bg-surface'
              : 'border-transparent text-tx-muted hover:text-tx-secondary'
          }`}
        >
          Columns
        </button>
        <button
          onClick={() => setActiveTabName('details')}
          className={`flex-1 py-1.5 text-center text-[11px] font-medium transition-colors border-b-2 ${
            activeTabName === 'details'
              ? 'border-blue-500 text-white bg-bg-surface'
              : 'border-transparent text-tx-muted hover:text-tx-secondary'
          }`}
        >
          Details
        </button>
      </div>

      {/* Columns Tab Content */}
      {activeTabName === 'columns' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Column Search */}
          <div className="p-2 border-b border-border-subtle">
            <div className="relative">
              <Search className="w-3 h-3 text-tx-muted absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter columns..."
                className="w-full pl-7 pr-2 py-1 rounded bg-bg-base border border-border-subtle text-[11px] text-white placeholder-tx-muted focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Columns List */}
          <div className="flex-1 overflow-y-auto divide-y divide-border-subtle/50">
            {filteredColumns.length === 0 ? (
              <div className="p-6 text-center text-tx-muted text-[11px]">No columns found.</div>
            ) : (
              filteredColumns.map((col) => (
                <div
                  key={col.name}
                  onClick={() => handleInsertColumnQuery(col.name)}
                  className="px-3 py-2 flex items-center justify-between hover:bg-bg-overlay/60 cursor-pointer group transition-colors"
                  title="Click to insert into SQL query"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    {col.isPrimaryKey ? (
                      <KeyRound className="w-3 h-3 text-amber-400 shrink-0" />
                    ) : (
                      getDataTypeIcon(col.dataType)
                    )}
                    <span className="font-mono text-[11px] text-white group-hover:text-blue-400 truncate">
                      {col.name}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <span className="font-mono text-[10px] text-tx-muted">{col.dataType}</span>
                    {col.isPrimaryKey && (
                      <span className="px-1 py-0.2 rounded bg-amber-500/10 text-amber-400 font-mono text-[9px] font-bold">
                        PK
                      </span>
                    )}
                    {!col.isNullable && !col.isPrimaryKey && (
                      <span className="px-1 py-0.2 rounded bg-blue-500/10 text-blue-400 font-mono text-[9px]">
                        REQ
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Details Tab Content */}
      {activeTabName === 'details' && (
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {activeTable ? (
            <>
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-tx-muted">Table Name</span>
                <div className="font-mono text-white text-xs">{activeTable.name}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-tx-muted">Columns Count</span>
                <div className="font-mono text-white text-xs">{currentColumns.length} fields</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-tx-muted">Primary Keys</span>
                <div className="font-mono text-amber-400 text-xs">
                  {currentColumns
                    .filter((c) => c.isPrimaryKey)
                    .map((c) => c.name)
                    .join(', ') || 'None'}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-bg-base border border-border-subtle space-y-2">
                <span className="text-[10px] font-semibold text-white uppercase tracking-wider block">
                  Quick Actions
                </span>
                <button
                  onClick={() => {
                    if (!activeTab || !activeTable) return;
                    updateSql(activeTab.id, `SELECT * FROM ${activeTable.name} LIMIT 100;\n`);
                  }}
                  className="w-full py-1.5 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-[11px] font-semibold transition-colors"
                >
                  SELECT * (First 100)
                </button>
                <button
                  onClick={() => {
                    if (!activeTab || !activeTable) return;
                    updateSql(activeTab.id, `SELECT COUNT(*) FROM ${activeTable.name};\n`);
                  }}
                  className="w-full py-1.5 rounded bg-bg-surface hover:bg-bg-elevated text-tx-secondary text-[11px] font-medium border border-border-subtle transition-colors"
                >
                  Count Records
                </button>
              </div>
            </>
          ) : (
            <div className="text-tx-muted text-center py-6">No table selected.</div>
          )}
        </div>
      )}
    </aside>
  );
};
