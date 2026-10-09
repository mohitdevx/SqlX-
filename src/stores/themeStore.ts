import { create } from 'zustand';
import type { SqlXTheme } from '@/types/theme';
import { applyTheme } from '@/services/themeEngine';

const defaultDarkTheme: SqlXTheme = {
  name: 'Dark Solid',
  type: 'dark',
  colors: {
    background: {
      base: '#0e0e11',
      surface: '#141418',
      overlay: '#1c1c22',
      elevated: '#23232b',
    },
    border: {
      subtle: '#25252e',
      default: '#33333f',
      strong: '#474757',
    },
    text: {
      primary: '#f4f4f6',
      secondary: '#a1a1aa',
      muted: '#71717a',
      inverse: '#09090b',
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
      background: '#111115',
      cursor: '#f4f4f6',
      selection: '#1e3a5f',
      lineHighlight: '#17171e',
      gutterBackground: '#111115',
      gutterForeground: '#52525b',
    },
    grid: {
      headerBackground: '#17171e',
      headerText: '#e4e4e7',
      rowEven: '#111115',
      rowOdd: '#141418',
      rowHover: '#1f1f28',
      rowSelected: '#1e3a5f',
      cellBorder: '#25252e',
      nullValue: '#71717a',
    },
  },
};

interface ThemeState {
  currentTheme: SqlXTheme;
  setTheme: (theme: SqlXTheme) => void;
  loadCustomThemeJson: (jsonString: string) => boolean;
}

export const useThemeStore = create<ThemeState>((set) => ({
  currentTheme: defaultDarkTheme,
  setTheme: (theme) => {
    applyTheme(theme);
    set({ currentTheme: theme });
  },
  loadCustomThemeJson: (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString) as SqlXTheme;
      if (parsed && parsed.colors && parsed.name) {
        applyTheme(parsed);
        set({ currentTheme: parsed });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
}));
