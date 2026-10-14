import {
  connectDatabase,
  disconnectDatabase,
  getSchemaTree,
  getTableColumns,
} from '@/services/tauriBridge';
import type { ColumnSchema, ConnectionConfig, DatabaseTree } from '@/types/database';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Clean legacy localStorage keys that may contain dummy default connections
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const legacy = window.localStorage.getItem('sqlx-saved-connections-v1');
    if (legacy && (legacy.includes('conn-local-postgres') || legacy.includes('Local PostgreSQL'))) {
      window.localStorage.removeItem('sqlx-saved-connections-v1');
    }
  }
} catch {
  // ignore storage errors
}

interface ConnectionState {
  connections: ConnectionConfig[];
  activeConnectionId: string | null;
  schemaTree: DatabaseTree | null;
  tableColumns: Record<string, ColumnSchema[]>;
  isLoading: boolean;
  error: string | null;

  addConnection: (config: ConnectionConfig) => void;
  updateConnection: (config: ConnectionConfig) => void;
  removeConnection: (id: string) => void;
  connect: (config: ConnectionConfig) => Promise<boolean>;
  disconnect: () => Promise<void>;
  refreshSchema: () => Promise<void>;
  switchDatabase: (databaseName: string) => Promise<boolean>;
  fetchTableColumns: (tableName: string) => Promise<ColumnSchema[]>;
  selectedTable: string | null;
  setSelectedTable: (table: string | null) => void;
}

export const useConnectionStore = create<ConnectionState>()(
  persist(
    (set, get) => ({
      connections: [],
      activeConnectionId: null,
      schemaTree: null,
      tableColumns: {},
      selectedTable: null,
      isLoading: false,
      error: null,

      setSelectedTable: (table) => set({ selectedTable: table }),

      addConnection: (config) => {
        set((state) => {
          const exists = state.connections.some((c) => c.id === config.id);
          if (exists) {
            return {
              connections: state.connections.map((c) => (c.id === config.id ? config : c)),
            };
          }
          return { connections: [config, ...state.connections] };
        });
      },

      updateConnection: (config) => {
        set((state) => ({
          connections: state.connections.map((c) => (c.id === config.id ? config : c)),
        }));
      },

      removeConnection: (id) => {
        set((state) => ({
          connections: state.connections.filter((c) => c.id !== id),
          activeConnectionId: state.activeConnectionId === id ? null : state.activeConnectionId,
          schemaTree: state.activeConnectionId === id ? null : state.schemaTree,
          tableColumns: state.activeConnectionId === id ? {} : state.tableColumns,
        }));
      },

      connect: async (config) => {
        set({ isLoading: true, error: null });
        try {
          // Save or update connection in persisted list
          get().addConnection(config);

          const connId = await connectDatabase(config);
          set({ activeConnectionId: connId, error: null, tableColumns: {} });
          try {
            const tree = await getSchemaTree(connId);
            set({ schemaTree: tree, isLoading: false });
          } catch {
            set({ isLoading: false });
          }
          return true;
        } catch (err: unknown) {
          // Clear zombie activeConnectionId if connection failed to prevent broken state
          set({ activeConnectionId: null, schemaTree: null, error: String(err), isLoading: false });
          return false;
        }
      },

      switchDatabase: async (databaseName: string) => {
        const { activeConnectionId, connections, connect } = get();
        if (!activeConnectionId) return false;
        const currentConn = connections.find((c) => c.id === activeConnectionId);
        if (!currentConn) return false;

        const updatedConfig: ConnectionConfig = {
          ...currentConn,
          database: databaseName,
        };

        return await connect(updatedConfig);
      },

      disconnect: async () => {
        const { activeConnectionId } = get();
        if (activeConnectionId) {
          try {
            await disconnectDatabase(activeConnectionId);
          } catch {
            // ignore disconnect error
          }
        }
        set({ activeConnectionId: null, schemaTree: null, tableColumns: {}, selectedTable: null });
      },

      refreshSchema: async () => {
        const { activeConnectionId } = get();
        if (!activeConnectionId) return;
        set({ isLoading: true });
        try {
          const tree = await getSchemaTree(activeConnectionId);
          set({ schemaTree: tree, isLoading: false });
        } catch (err: unknown) {
          set({ error: String(err), isLoading: false });
        }
      },

      fetchTableColumns: async (tableName: string) => {
        const { activeConnectionId, tableColumns } = get();
        if (!activeConnectionId) return [];
        if (tableColumns[tableName]) return tableColumns[tableName];

        try {
          const cols = await getTableColumns(activeConnectionId, tableName);
          set((state) => ({
            tableColumns: {
              ...state.tableColumns,
              [tableName]: cols,
            },
          }));
          return cols;
        } catch (err: unknown) {
          console.error(`Failed to load columns for table ${tableName}:`, err);
          return [];
        }
      },
    }),
    {
      name: 'sqlx-connections-store-v2',
      partialize: (state) => ({
        connections: state.connections.filter(
          (c) =>
            !c.id.startsWith('conn-local-') &&
            c.name !== 'Local PostgreSQL' &&
            c.name !== 'Local MySQL' &&
            c.name !== 'Local SQLite'
        ),
        activeConnectionId: state.activeConnectionId,
      }),
    }
  )
);
