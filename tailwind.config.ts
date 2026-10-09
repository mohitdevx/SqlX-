import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          base: 'var(--color-bg-base)',
          surface: 'var(--color-bg-surface)',
          overlay: 'var(--color-bg-overlay)',
          elevated: 'var(--color-bg-elevated)',
        },
        border: {
          subtle: 'var(--color-border-subtle)',
          default: 'var(--color-border-default)',
          strong: 'var(--color-border-strong)',
        },
        tx: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
          inverse: 'var(--color-text-inverse)',
        },
        accent: {
          primary: 'var(--color-accent-primary)',
          hover: 'var(--color-accent-primary-hover)',
          active: 'var(--color-accent-primary-active)',
          text: 'var(--color-accent-text)',
        },
        status: {
          success: 'var(--color-status-success)',
          warning: 'var(--color-status-warning)',
          error: 'var(--color-status-error)',
          info: 'var(--color-status-info)',
        },
        editor: {
          bg: 'var(--color-editor-bg)',
          cursor: 'var(--color-editor-cursor)',
          selection: 'var(--color-editor-selection)',
          highlight: 'var(--color-editor-highlight)',
          gutterBg: 'var(--color-editor-gutter-bg)',
          gutterFg: 'var(--color-editor-gutter-fg)',
        },
        grid: {
          headerBg: 'var(--color-grid-header-bg)',
          headerTx: 'var(--color-grid-header-tx)',
          rowEven: 'var(--color-grid-row-even)',
          rowOdd: 'var(--color-grid-row-odd)',
          rowHover: 'var(--color-grid-row-hover)',
          rowSelected: 'var(--color-grid-row-selected)',
          cellBorder: 'var(--color-grid-cell-border)',
          nullVal: 'var(--color-grid-null-val)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Geist', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
