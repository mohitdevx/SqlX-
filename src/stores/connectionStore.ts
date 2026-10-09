import { create } from 'zustand';
import type { ConnectionConfig, DatabaseTree } from '@/types/database';
import { connectDatabase, disconnectDatabase, getSchemaTree } from '@/services/tauriBridge';

interface ConnectionState {
  connections: ConnectionConfig[];
  activeConnectionId: string | null;
  schemaTree: DatabaseTree | null;
  isLoading: boolean;
  error: string | null;

  addConnection: (config: ConnectionConfig) => void;
  removeConnection: (id: string) => void;
  connect: (config: ConnectionConfig) => Promise<boolean>;
  disconnect: () => Promise<void>;
  refreshSchema: () => Promise<void>;
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  connections: [],
  activeConnectionId: null,
  schemaTree: null,
  isLoading: false,
  error: null,

  addConnection: (config) => {
    set((state) => ({ connections: [...state.connections, config] }));
  },

  removeConnection: (id) => {
    set((state) => ({ connections: state.connections.filter((c) => c.id !== id) }));
  },

  connect: async (config) => {
    set({ isLoading: true, error: null });
    try {
      const connId = await connectDatabase(config);
      set({ activeConnectionId: connId });
      const tree = await getSchemaTree(connId);
      set({ schemaTree: tree, isLoading: false });
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
}));
