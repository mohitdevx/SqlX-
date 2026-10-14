import { executeQuery } from '@/services/tauriBridge';
import type { QueryResult } from '@/types/database';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface QueryTab {
  id: string;
  title: string;
  sql: string;
  lastExecutedSql?: string;
  result: QueryResult | null;
  isRunning: boolean;
  error: string | null;
  page?: number;
  pageSize?: number;
}

export interface HistoryItem {
  id: string;
  sql: string;
  timestamp: number;
  executionTimeMs?: number;
  rowsCount?: number;
  success: boolean;
  status: 'success' | 'error';
  error?: string;
}

export interface SavedQuery {
  id: string;
  title: string;
  sql: string;
  tags: string[];
  createdAt: number;
}

interface QueryStoreState {
  tabs: QueryTab[];
  activeTabId: string;
  selectedSql: string;
  history: HistoryItem[];
  savedQueries: SavedQuery[];

  setSelectedSql: (sql: string) => void;
  createTab: (initialSql?: string, title?: string) => string;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateSql: (id: string, sql: string) => void;
  renameTab: (id: string, newTitle: string) => void;
  runActiveQuery: (
    connectionId: string,
    customSql?: string,
    page?: number,
    pageSize?: number
  ) => Promise<void>;
  nextPage: (connectionId: string) => Promise<void>;
  prevPage: (connectionId: string) => Promise<void>;
  changePageSize: (connectionId: string, newSize: number) => Promise<void>;
  saveQuery: (title: string, sql: string, tags?: string[]) => void;
  removeSavedQuery: (id: string) => void;
  clearHistory: () => void;
}

export const useQueryStore = create<QueryStoreState>()(
  persist(
    (set, get) => ({
      tabs: [
        {
          id: 'tab-1',
          title: 'Query 1',
          sql: 'SELECT 1 AS id, "SqlX Ready" AS status, CURRENT_TIMESTAMP AS connected_at;',
          result: null,
          isRunning: false,
          error: null,
          page: 1,
          pageSize: 1000,
        },
      ],
      activeTabId: 'tab-1',
      selectedSql: '',
      history: [],
      savedQueries: [],

      setSelectedSql: (selectedSql) => {
        set({ selectedSql });
      },

      createTab: (initialSql = '', title?: string) => {
        const id = `tab-${Date.now()}`;
        const newTab: QueryTab = {
          id,
          title: title || `Query ${get().tabs.length + 1}`,
          sql: initialSql,
          result: null,
          isRunning: false,
          error: null,
          page: 1,
          pageSize: 1000,
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
              page: 1,
              pageSize: 1000,
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

      renameTab: (id, newTitle) => {
        if (!newTitle.trim()) return;
        set((state) => ({
          tabs: state.tabs.map((t) => (t.id === id ? { ...t, title: newTitle.trim() } : t)),
        }));
      },

      runActiveQuery: async (
        connectionId: string,
        customSql?: string,
        pageOverride?: number,
        pageSizeOverride?: number
      ) => {
        const { tabs, activeTabId, selectedSql } = get();
        const activeTab = tabs.find((t) => t.id === activeTabId);
        if (!activeTab) return;

        const isPaging = pageOverride !== undefined;
        const page = isPaging ? pageOverride : 1;
        const pageSize =
          pageSizeOverride !== undefined ? pageSizeOverride : activeTab.pageSize || 1000;
        const offset = (page - 1) * pageSize;

        // If paging, prefer lastExecutedSql so user edits in editor don't alter the paging query
        const sqlToRun =
          isPaging && activeTab.lastExecutedSql
            ? activeTab.lastExecutedSql
            : (customSql || selectedSql.trim() || activeTab.sql).trim();

        if (!sqlToRun) return;

        set((state) => ({
          tabs: state.tabs.map((t) =>
            t.id === activeTabId
              ? {
                  ...t,
                  isRunning: true,
                  error: null,
                  page,
                  pageSize,
                  lastExecutedSql: sqlToRun,
                }
              : t
          ),
        }));

        const startTime = Date.now();

        try {
          const result = await executeQuery(connectionId, sqlToRun, pageSize, offset);
          const historyEntry: HistoryItem = {
            id: `hist-${Date.now()}`,
            sql: sqlToRun,
            timestamp: startTime,
            executionTimeMs: result.executionTimeMs,
            rowsCount: result.rows.length,
            success: true,
            status: 'success',
          };

          set((state) => ({
            tabs: state.tabs.map((t) =>
              t.id === activeTabId
                ? {
                    ...t,
                    result,
                    isRunning: false,
                    error: null,
                    page,
                    pageSize,
                  }
                : t
            ),
            history: !isPaging ? [historyEntry, ...state.history].slice(0, 200) : state.history,
          }));
        } catch (err: unknown) {
          const errMsg = String(err);
          const historyEntry: HistoryItem = {
            id: `hist-${Date.now()}`,
            sql: sqlToRun,
            timestamp: startTime,
            success: false,
            status: 'error',
            error: errMsg,
          };

          set((state) => ({
            tabs: state.tabs.map((t) =>
              t.id === activeTabId ? { ...t, result: null, isRunning: false, error: errMsg } : t
            ),
            history: !isPaging ? [historyEntry, ...state.history].slice(0, 200) : state.history,
          }));
        }
      },

      nextPage: async (connectionId: string) => {
        const { tabs, activeTabId, runActiveQuery } = get();
        const tab = tabs.find((t) => t.id === activeTabId);
        if (!tab || !tab.result?.hasMore) return;
        const nextPageNum = (tab.page || 1) + 1;
        await runActiveQuery(connectionId, undefined, nextPageNum, tab.pageSize || 1000);
      },

      prevPage: async (connectionId: string) => {
        const { tabs, activeTabId, runActiveQuery } = get();
        const tab = tabs.find((t) => t.id === activeTabId);
        if (!tab || (tab.page || 1) <= 1) return;
        const prevPageNum = Math.max(1, (tab.page || 1) - 1);
        await runActiveQuery(connectionId, undefined, prevPageNum, tab.pageSize || 1000);
      },

      changePageSize: async (connectionId: string, newSize: number) => {
        const { tabs, activeTabId, runActiveQuery } = get();
        const tab = tabs.find((t) => t.id === activeTabId);
        if (!tab) return;
        await runActiveQuery(connectionId, undefined, 1, newSize);
      },

      saveQuery: (title: string, sql: string, tags: string[] = ['saved']) => {
        const newQuery: SavedQuery = {
          id: `saved-${Date.now()}`,
          title,
          sql,
          tags,
          createdAt: Date.now(),
        };
        set((state) => ({
          savedQueries: [newQuery, ...state.savedQueries],
        }));
      },

      removeSavedQuery: (id: string) => {
        set((state) => ({
          savedQueries: state.savedQueries.filter((q) => q.id !== id),
        }));
      },

      clearHistory: () => {
        set({ history: [] });
      },
    }),
    {
      name: 'sqlx-queries-state-v1',
      partialize: (state) => ({
        history: state.history,
        savedQueries: state.savedQueries,
      }),
    }
  )
);
