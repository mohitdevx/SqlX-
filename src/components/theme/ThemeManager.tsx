import { useThemeStore } from '@/stores/themeStore';
import type { SqlXTheme } from '@/types/theme';
import { Check, Copy, FileJson, Palette, Upload } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

const presetThemes: SqlXTheme[] = [
  {
    name: 'Obsidian Solid (Default)',
    type: 'dark',
    colors: {
      background: { base: '#090a0c', surface: '#0f1013', overlay: '#15171c', elevated: '#1c1f26' },
      border: { subtle: '#1e2229', default: '#282c35', strong: '#3b404d' },
      text: { primary: '#f3f4f6', secondary: '#9ca3af', muted: '#6b7280', inverse: '#090a0c' },
      accent: {
        primary: '#3b82f6',
        primaryHover: '#2563eb',
        primaryActive: '#1d4ed8',
        text: '#ffffff',
      },
      status: { success: '#10b981', warning: '#f59e0b', error: '#ef4444', info: '#06b6d4' },
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
  },
  {
    name: 'Midnight Zinc',
    type: 'dark',
    colors: {
      background: { base: '#09090b', surface: '#121215', overlay: '#18181b', elevated: '#27272a' },
      border: { subtle: '#27272a', default: '#3f3f46', strong: '#52525b' },
      text: { primary: '#fafafa', secondary: '#a1a1aa', muted: '#71717a', inverse: '#09090b' },
      accent: {
        primary: '#6366f1',
        primaryHover: '#4f46e5',
        primaryActive: '#4338ca',
        text: '#ffffff',
      },
      status: { success: '#10b981', warning: '#f59e0b', error: '#ef4444', info: '#06b6d4' },
      editor: {
        background: '#0d0d11',
        cursor: '#a5b4fc',
        selection: '#312e81',
        lineHighlight: '#14141a',
        gutterBackground: '#0d0d11',
        gutterForeground: '#52525b',
      },
      grid: {
        headerBackground: '#14141a',
        headerText: '#f4f4f5',
        rowEven: '#0d0d11',
        rowOdd: '#121216',
        rowHover: '#1f1f26',
        rowSelected: '#2e2d42',
        cellBorder: '#27272a',
        nullValue: '#71717a',
      },
    },
  },
  {
    name: 'Tokyo Night Solid',
    type: 'dark',
    colors: {
      background: { base: '#13141f', surface: '#1a1b26', overlay: '#24283b', elevated: '#2f3549' },
      border: { subtle: '#23283b', default: '#2f3549', strong: '#414868' },
      text: { primary: '#c0caf5', secondary: '#9aa5ce', muted: '#565f89', inverse: '#1a1b26' },
      accent: {
        primary: '#7aa2f7',
        primaryHover: '#628eec',
        primaryActive: '#4a7ad6',
        text: '#1a1b26',
      },
      status: { success: '#9ece6a', warning: '#e0af68', error: '#f7768e', info: '#7dcfff' },
      editor: {
        background: '#161622',
        cursor: '#c0caf5',
        selection: '#283457',
        lineHighlight: '#1c1d2e',
        gutterBackground: '#161622',
        gutterForeground: '#565f89',
      },
      grid: {
        headerBackground: '#1c1d2e',
        headerText: '#c0caf5',
        rowEven: '#161622',
        rowOdd: '#1a1b2a',
        rowHover: '#24283b',
        rowSelected: '#2e385e',
        cellBorder: '#23283b',
        nullValue: '#565f89',
      },
    },
  },
  {
    name: 'Monokai Charcoal',
    type: 'dark',
    colors: {
      background: { base: '#19181a', surface: '#221f22', overlay: '#2d2a2e', elevated: '#3a373b' },
      border: { subtle: '#2d2a2e', default: '#3a373b', strong: '#5b585c' },
      text: { primary: '#fcfcfa', secondary: '#c1c0c0', muted: '#727072', inverse: '#19181a' },
      accent: {
        primary: '#ffd866',
        primaryHover: '#f5cc56',
        primaryActive: '#e6be47',
        text: '#19181a',
      },
      status: { success: '#a9dc76', warning: '#ffd866', error: '#ff6188', info: '#78dce8' },
      editor: {
        background: '#1e1c1f',
        cursor: '#ffd866',
        selection: '#403e41',
        lineHighlight: '#262427',
        gutterBackground: '#1e1c1f',
        gutterForeground: '#727072',
      },
      grid: {
        headerBackground: '#262427',
        headerText: '#fcfcfa',
        rowEven: '#1e1c1f',
        rowOdd: '#221f22',
        rowHover: '#2d2a2e',
        rowSelected: '#403e41',
        cellBorder: '#2d2a2e',
        nullValue: '#727072',
      },
    },
  },
  {
    name: 'Alabaster Light',
    type: 'light',
    colors: {
      background: { base: '#fbfbfb', surface: '#ffffff', overlay: '#f4f4f5', elevated: '#e4e4e7' },
      border: { subtle: '#e4e4e7', default: '#d4d4d8', strong: '#a1a1aa' },
      text: { primary: '#09090b', secondary: '#52525b', muted: '#a1a1aa', inverse: '#ffffff' },
      accent: {
        primary: '#2563eb',
        primaryHover: '#1d4ed8',
        primaryActive: '#1e40af',
        text: '#ffffff',
      },
      status: { success: '#059669', warning: '#d97706', error: '#dc2626', info: '#0284c7' },
      editor: {
        background: '#ffffff',
        cursor: '#09090b',
        selection: '#bfdbfe',
        lineHighlight: '#f8fafc',
        gutterBackground: '#f8fafc',
        gutterForeground: '#94a3b8',
      },
      grid: {
        headerBackground: '#f1f5f9',
        headerText: '#0f172a',
        rowEven: '#ffffff',
        rowOdd: '#f8fafc',
        rowHover: '#e2e8f0',
        rowSelected: '#dbeafe',
        cellBorder: '#e2e8f0',
        nullValue: '#94a3b8',
      },
    },
  },
];

export const ThemeManager: React.FC = () => {
  const { currentTheme, setTheme, loadCustomThemeJson } = useThemeStore();
  const [jsonInput, setJsonInput] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  const handleApplyJson = () => {
    if (!jsonInput.trim()) return;
    const ok = loadCustomThemeJson(jsonInput);
    if (ok) {
      setStatusMsg({ text: 'Custom JSON theme loaded and hot-reloaded successfully!' });
    } else {
      setStatusMsg({
        text: 'Invalid JSON schema. Ensure all required color keys exist.',
        isError: true,
      });
    }
  };

  const handleCopyCurrentTheme = () => {
    navigator.clipboard.writeText(JSON.stringify(currentTheme, null, 2));
    setStatusMsg({ text: 'Active theme JSON copied to clipboard!' });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  return (
    <div className="w-full h-full p-8 overflow-y-auto bg-bg-base font-sans text-tx-primary">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Title Header */}
        <div>
          <div className="flex items-center space-x-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary">
              <Palette className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">Theme & Visual Palette Engine</h1>
          </div>
          <p className="text-xs text-tx-secondary">
            SqlX strictly enforces calibrated, distraction-free solid color tokens without visual
            noise. Choose a theme below or load a custom JSON palette.
          </p>
        </div>

        {/* Preset Theme Cards */}
        <div>
          <h2 className="text-xs font-semibold text-tx-muted uppercase tracking-wider mb-3">
            Solid Themes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {presetThemes.map((theme) => {
              const isSelected = currentTheme.name === theme.name;
              return (
                <div
                  key={theme.name}
                  onClick={() => setTheme(theme)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'border-accent-primary bg-bg-surface ring-1 ring-accent-primary shadow-sm'
                      : 'border-border-subtle bg-bg-surface hover:border-border-default hover:bg-bg-overlay'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-tx-primary block">{theme.name}</span>
                      <span className="text-[10px] font-mono text-tx-muted uppercase">
                        {theme.type} mode
                      </span>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-accent-primary flex items-center justify-center text-white">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Swatches */}
                  <div className="flex items-center space-x-2 pt-2 border-t border-border-subtle">
                    <div
                      className="w-6 h-6 rounded-md border border-border-subtle shadow-inner"
                      style={{ backgroundColor: theme.colors.background.base }}
                      title="Base"
                    />
                    <div
                      className="w-6 h-6 rounded-md border border-border-subtle shadow-inner"
                      style={{ backgroundColor: theme.colors.background.surface }}
                      title="Surface"
                    />
                    <div
                      className="w-6 h-6 rounded-md border border-border-subtle shadow-inner"
                      style={{ backgroundColor: theme.colors.accent.primary }}
                      title="Accent"
                    />
                    <div
                      className="w-6 h-6 rounded-md border border-border-subtle shadow-inner"
                      style={{ backgroundColor: theme.colors.border.default }}
                      title="Border"
                    />
                    <div
                      className="w-6 h-6 rounded-md border border-border-subtle shadow-inner"
                      style={{ backgroundColor: theme.colors.status.success }}
                      title="Success"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom JSON Theme Config */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <FileJson className="w-4 h-4 text-accent-primary" />
              <h2 className="text-xs font-bold text-tx-primary uppercase tracking-wider">
                Manual JSON Theme Config
              </h2>
            </div>
            <button
              onClick={handleCopyCurrentTheme}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-md bg-bg-base hover:bg-bg-overlay border border-border-subtle text-tx-secondary hover:text-tx-primary transition-colors font-mono"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Active Theme JSON</span>
            </button>
          </div>

          <p className="text-xs text-tx-secondary">
            Paste any custom JSON configuration below to hot-reload the UI instantly.
          </p>

          <textarea
            rows={7}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='{ "name": "Custom Obsidian", "type": "dark", "colors": { "background": { "base": "#0c0d0e", ... } } }'
            className="w-full bg-editor-bg border border-border-subtle rounded-lg p-3.5 font-mono text-xs text-tx-primary focus:outline-none focus:border-accent-primary transition-colors"
          />

          {statusMsg && (
            <div
              className={`p-3 rounded-md text-xs font-mono ${
                statusMsg.isError
                  ? 'bg-status-error/10 text-status-error border border-status-error/30'
                  : 'bg-status-success/10 text-status-success border border-status-success/30'
              }`}
            >
              {statusMsg.text}
            </div>
          )}

          <div className="flex items-center justify-end">
            <button
              onClick={handleApplyJson}
              className="px-4 py-2 rounded-md bg-accent-primary text-accent-text text-xs font-semibold hover:bg-accent-hover active:bg-accent-active transition-all flex items-center space-x-2 shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Apply & Hot-Reload Theme</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
