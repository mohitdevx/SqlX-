import { connectDatabase, disconnectDatabase, getSchemaTree } from '@/services/tauriBridge';
import type { ConnectionConfig, DatabaseTree } from '@/types/database';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const defaultPresetConnections: ConnectionConfig[] = [
  {
    id: 'conn-local-postgres',
    name: 'Local PostgreSQL',
    driver: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    username: 'postgres',
    password: '',
    ssl: false,
    environment: 'development',
  },
  {
    id: 'conn-local-mysql',
    name: 'Local MySQL',
    driver: 'mysql',
    host: 'localhost',
    port: 3306,
    database: 'mysql',
    username: 'root',
    password: '',
    ssl: false,
    environment: 'development',
  },
  {
    id: 'conn-local-sqlite',
    name: 'Local SQLite',
    driver: 'sqlite',
    filePath: 'sqlx_dev.sqlite',
    environment: 'development',
  },
];

interface ConnectionState {
  connections: ConnectionConfig[];
  activeConnectionId: string | null;
  schemaTree: DatabaseTree | null;
  isLoading: boolean;
  error: string | null;

  addConnection: (config: ConnectionConfig) => void;
  updateConnection: (config: ConnectionConfig) => void;
  removeConnection: (id: string) => void;
  connect: (config: ConnectionConfig) => Promise<boolean>;
  disconnect: () => Promise<void>;
  refreshSchema: () => Promise<void>;
}

export const useConnectionStore = create<ConnectionState>()(
  persist(
    (set, get) => ({
      connections: defaultPresetConnections,
      activeConnectionId: 'conn-local-postgres',
      schemaTree: null,
      isLoading: false,
      error: null,

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
        }));
      },

      connect: async (config) => {
        set({ isLoading: true, error: null });
        try {
          // Save or update connection in persisted list
          get().addConnection(config);

          const connId = await connectDatabase(config);
          set({ activeConnectionId: connId, error: null });
          try {
            const tree = await getSchemaTree(connId);
            set({ schemaTree: tree, isLoading: false });
          } catch {
            set({ isLoading: false });
          }
          return true;
        } catch (err: unknown) {
          set({ error: String(err), isLoading: false });
          return false;
        }
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
        set({ activeConnectionId: null, schemaTree: null });
      },

      refreshSchema: async () => {
        const { activeConnectionId } = get();
        if (!activeConnectionId) return;
        try {
          const tree = await getSchemaTree(activeConnectionId);
          set({ schemaTree: tree });
        } catch (err: unknown) {
          set({ error: String(err) });
        }
      },
    }),
    {
      name: 'sqlx-saved-connections-v1',
      partialize: (state) => ({
        connections: state.connections,
        activeConnectionId: state.activeConnectionId,
      }),
    }
  )
);
