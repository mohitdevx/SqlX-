import { applyTheme } from '@/services/themeEngine';
import type { SqlXTheme } from '@/types/theme';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const defaultDarkTheme: SqlXTheme = {
  name: 'Obsidian Solid (Default)',
  type: 'dark',
  colors: {
    background: {
      base: '#090a0c',
      surface: '#0f1013',
      overlay: '#15171c',
      elevated: '#1c1f26',
    },
    border: {
      subtle: '#1e2229',
      default: '#282c35',
      strong: '#3b404d',
    },
    text: {
      primary: '#f3f4f6',
      secondary: '#9ca3af',
      muted: '#6b7280',
      inverse: '#090a0c',
    },
    accent: {
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      primaryActive: '#1d4ed8',
      text: '#ffffff',
    },
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#06b6d4',
    },
    editor: {
      background: '#0b0c0f',
      cursor: '#60a5fa',
      selection: '#1e3a5f',
      lineHighlight: '#12141a',
      gutterBackground: '#0b0c0f',
      gutterForeground: '#4b5563',
    },
    grid: {
      headerBackground: '#121418',
      headerText: '#e5e7eb',
      rowEven: '#0b0c0f',
      rowOdd: '#0f1014',
      rowHover: '#181b22',
      rowSelected: '#1e293b',
      cellBorder: '#1a1d24',
      nullValue: '#6b7280',
    },
  },
};

interface ThemeState {
  currentTheme: SqlXTheme;
  setTheme: (theme: SqlXTheme) => void;
  loadCustomThemeJson: (jsonString: string) => boolean;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      currentTheme: defaultDarkTheme,
      setTheme: (theme) => {
        applyTheme(theme);
        set({ currentTheme: theme });
      },
      loadCustomThemeJson: (jsonString) => {
        try {
          const parsed = JSON.parse(jsonString) as SqlXTheme;
          if (parsed?.colors && parsed?.name) {
            applyTheme(parsed);
            set({ currentTheme: parsed });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'sqlx-theme-storage-v1',
      onRehydrateStorage: () => (state) => {
        if (state?.currentTheme) {
          applyTheme(state.currentTheme);
        }
      },
    }
  )
);
