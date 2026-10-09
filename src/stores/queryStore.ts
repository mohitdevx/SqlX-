import { create } from 'zustand';
import type { QueryResult } from '@/types/database';
import { executeQuery } from '@/services/tauriBridge';

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
  createTab: (initialSql?: string) => string;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateSql: (id: string, sql: string) => void;
  runActiveQuery: (connectionId: string) => Promise<void>;
}

export const useQueryStore = create<QueryStoreState>((set, get) => ({
  tabs: [
    {
      id: 'tab-1',
      title: 'Query 1',
      sql: 'SELECT 1 AS status, "SqlX Desktop Ready" AS message;',
      result: null,
      isRunning: false,
      error: null,
    },
  ],
  activeTabId: 'tab-1',

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
      const newActive = state.activeTabId === id ? remaining[remaining.length - 1].id : state.activeTabId;
      return { tabs: remaining, activeTabId: newActive };
    });
  },

  setActiveTab: (id) => {
    set({ activeTabId: id });
  },

  updateSql: (id, sql) => {
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === id ? { ...t, sql } : t)),
    }));
  },

  runActiveQuery: async (connectionId: string) => {
    const { tabs, activeTabId } = get();
    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (!activeTab || !activeTab.sql.trim()) return;

    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === activeTabId ? { ...t, isRunning: true, error: null } : t
      ),
    }));

    try {
      const result = await executeQuery(connectionId, activeTab.sql);
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
