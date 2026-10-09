import { executeQuery } from '@/services/tauriBridge';
import type { QueryResult } from '@/types/database';
import { create } from 'zustand';

export interface QueryTab {
  id: string;
  title: string;
  sql: string;
  result: QueryResult | null;
  isRunning: boolean;
  error: string | null;
}

interface QueryStoreState {
  tabs: QueryTab[];
  activeTabId: string;
  selectedSql: string;
  setSelectedSql: (sql: string) => void;
  createTab: (initialSql?: string) => string;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateSql: (id: string, sql: string) => void;
  runActiveQuery: (connectionId: string, customSql?: string) => Promise<void>;
}

export const useQueryStore = create<QueryStoreState>((set, get) => ({
  tabs: [
    {
      id: 'tab-1',
      title: 'Query 1',
      sql: 'SELECT 1 AS id, "SqlX Client Ready" AS message, CURRENT_TIMESTAMP AS timestamp;\n\n-- You can also run multiple queries at once:\nSELECT "User Analytics" AS category, 1420 AS active_sessions;\nSELECT "Server Health" AS status, 99.98 AS uptime_pct;',
      result: null,
      isRunning: false,
      error: null,
    },
  ],
  activeTabId: 'tab-1',
  selectedSql: '',

  setSelectedSql: (selectedSql) => {
    set({ selectedSql });
  },

  createTab: (initialSql = '') => {
    const id = `tab-${Date.now()}`;
    const newTab: QueryTab = {
      id,
      title: `Query ${get().tabs.length + 1}`,
      sql: initialSql,
      result: null,
      isRunning: false,
      error: null,
    };
    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: id,
    }));
    return id;
  },

  closeTab: (id) => {
    set((state) => {
      const remaining = state.tabs.filter((t) => t.id !== id);
      if (remaining.length === 0) {
        const fallback: QueryTab = {
          id: `tab-${Date.now()}`,
          title: 'Query 1',
          sql: '',
          result: null,
          isRunning: false,
          error: null,
        };
        return { tabs: [fallback], activeTabId: fallback.id };
      }
      const newActive =
        state.activeTabId === id ? remaining[remaining.length - 1].id : state.activeTabId;
      return { tabs: remaining, activeTabId: newActive };
    });
  },

  setActiveTab: (id) => {
    set({ activeTabId: id, selectedSql: '' });
  },

  updateSql: (id, sql) => {
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === id ? { ...t, sql } : t)),
    }));
  },

  runActiveQuery: async (connectionId: string, customSql?: string) => {
    const { tabs, activeTabId, selectedSql } = get();
    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (!activeTab) return;

    // Use customSql, or highlighted selection, or entire tab buffer
    const sqlToRun = (customSql || selectedSql.trim() || activeTab.sql).trim();
    if (!sqlToRun) return;

    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === activeTabId ? { ...t, isRunning: true, error: null } : t
      ),
    }));

    try {
      const result = await executeQuery(connectionId, sqlToRun);
      set((state) => ({
        tabs: state.tabs.map((t) =>
          t.id === activeTabId ? { ...t, result, isRunning: false, error: null } : t
        ),
      }));
    } catch (err: unknown) {
      set((state) => ({
        tabs: state.tabs.map((t) =>
          t.id === activeTabId ? { ...t, result: null, isRunning: false, error: String(err) } : t
        ),
      }));
    }
  },
}));
