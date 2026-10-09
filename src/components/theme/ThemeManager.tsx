import { useThemeStore } from '@/stores/themeStore';
import type { SqlXTheme } from '@/types/theme';
import { Check, Copy, FileJson, Palette, Upload } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

const presetThemes: SqlXTheme[] = [
  {
    name: 'Dark Solid',
    type: 'dark',
    colors: {
      background: { base: '#0e0e11', surface: '#141418', overlay: '#1c1c22', elevated: '#23232b' },
      border: { subtle: '#25252e', default: '#33333f', strong: '#474757' },
      text: { primary: '#f4f4f6', secondary: '#a1a1aa', muted: '#71717a', inverse: '#09090b' },
      accent: {
        primary: '#3b82f6',
        primaryHover: '#2563eb',
        primaryActive: '#1d4ed8',
        text: '#ffffff',
      },
      status: { success: '#10b981', warning: '#f59e0b', error: '#ef4444', info: '#06b6d4' },
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
  },
  {
    name: 'Light Solid',
    type: 'light',
    colors: {
      background: { base: '#f8f9fa', surface: '#ffffff', overlay: '#f1f3f5', elevated: '#e9ecef' },
      border: { subtle: '#e2e8f0', default: '#cbd5e1', strong: '#94a3b8' },
      text: { primary: '#0f172a', secondary: '#475569', muted: '#94a3b8', inverse: '#ffffff' },
      accent: {
        primary: '#2563eb',
        primaryHover: '#1d4ed8',
        primaryActive: '#1e40af',
        text: '#ffffff',
      },
      status: { success: '#059669', warning: '#d97706', error: '#dc2626', info: '#0284c7' },
      editor: {
        background: '#ffffff',
        cursor: '#0f172a',
        selection: '#bfdbfe',
        lineHighlight: '#f8fafc',
        gutterBackground: '#f8fafc',
        gutterForeground: '#94a3b8',
      },
      grid: {
        headerBackground: '#f1f5f9',
        headerText: '#1e293b',
        rowEven: '#ffffff',
        rowOdd: '#f8fafc',
        rowHover: '#e2e8f0',
        rowSelected: '#dbeafe',
        cellBorder: '#e2e8f0',
        nullValue: '#94a3b8',
      },
    },
  },
  {
    name: 'Midnight Slate',
    type: 'dark',
    colors: {
      background: { base: '#0b0f19', surface: '#111827', overlay: '#1f2937', elevated: '#374151' },
      border: { subtle: '#1f2937', default: '#374151', strong: '#4b5563' },
      text: { primary: '#f9fafb', secondary: '#9ca3af', muted: '#6b7280', inverse: '#111827' },
      accent: {
        primary: '#6366f1',
        primaryHover: '#4f46e5',
        primaryActive: '#4338ca',
        text: '#ffffff',
      },
      status: { success: '#10b981', warning: '#f59e0b', error: '#ef4444', info: '#06b6d4' },
      editor: {
        background: '#0d131f',
        cursor: '#f9fafb',
        selection: '#283548',
        lineHighlight: '#131b2c',
        gutterBackground: '#0d131f',
        gutterForeground: '#4b5563',
      },
      grid: {
        headerBackground: '#151d2c',
        headerText: '#e5e7eb',
        rowEven: '#0d131f',
        rowOdd: '#111827',
        rowHover: '#1e293b',
        rowSelected: '#2d3c52',
        cellBorder: '#1f2937',
        nullValue: '#6b7280',
      },
    },
  },
  {
    name: 'Nord Solid',
    type: 'dark',
    colors: {
      background: { base: '#242933', surface: '#2e3440', overlay: '#3b4252', elevated: '#434c5e' },
      border: { subtle: '#3b4252', default: '#4c566a', strong: '#d8dee9' },
      text: { primary: '#eceff4', secondary: '#d8dee9', muted: '#4c566a', inverse: '#2e3440' },
      accent: {
        primary: '#88c0d0',
        primaryHover: '#81a1c1',
        primaryActive: '#5e81ac',
        text: '#2e3440',
      },
      status: { success: '#a3be8c', warning: '#ebcb8b', error: '#bf616a', info: '#88c0d0' },
      editor: {
        background: '#2e3440',
        cursor: '#eceff4',
        selection: '#434c5e',
        lineHighlight: '#3b4252',
        gutterBackground: '#2e3440',
        gutterForeground: '#4c566a',
      },
      grid: {
        headerBackground: '#3b4252',
        headerText: '#eceff4',
        rowEven: '#2e3440',
        rowOdd: '#292e39',
        rowHover: '#434c5e',
        rowSelected: '#4c566a',
        cellBorder: '#3b4252',
        nullValue: '#4c566a',
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
      setStatusMsg({ text: 'Theme loaded and applied successfully!' });
    } else {
      setStatusMsg({
        text: 'Invalid JSON format or missing required theme tokens.',
        isError: true,
      });
    }
  };

  const handleCopyCurrentTheme = () => {
    navigator.clipboard.writeText(JSON.stringify(currentTheme, null, 2));
    setStatusMsg({ text: 'Current theme JSON copied to clipboard!' });
  };

  return (
    <div className="w-full h-full p-6 overflow-y-auto bg-bg-base font-sans text-tx-primary">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Title Header */}
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Palette className="w-5 h-5 text-accent-primary" />
            <h1 className="text-lg font-bold">Theme & Visual Customizer</h1>
          </div>
          <p className="text-xs text-tx-secondary">
            SqlX strictly enforces clean, solid-color palettes without tacky glows or slow
            gradients. Configure or import custom JSON themes below.
          </p>
        </div>

        {/* Preset Cards Grid */}
        <div>
          <h2 className="text-xs font-semibold text-tx-secondary uppercase tracking-wider mb-3">
            Preset Solid Themes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {presetThemes.map((theme) => {
              const isSelected = currentTheme.name === theme.name;
              return (
                <div
                  key={theme.name}
                  onClick={() => setTheme(theme)}
                  className={`p-3 rounded border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-accent-primary bg-bg-surface ring-1 ring-accent-primary'
                      : 'border-border-subtle bg-bg-surface hover:border-border-default'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-xs text-tx-primary">{theme.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-accent-primary" />}
                  </div>

                  {/* Swatches */}
                  <div className="flex items-center space-x-1.5 pt-2 border-t border-border-subtle">
                    <div
                      className="w-5 h-5 rounded border border-border-subtle"
                      style={{ backgroundColor: theme.colors.background.base }}
                      title="Base Background"
                    />
                    <div
                      className="w-5 h-5 rounded border border-border-subtle"
                      style={{ backgroundColor: theme.colors.background.surface }}
                      title="Surface"
                    />
                    <div
                      className="w-5 h-5 rounded border border-border-subtle"
                      style={{ backgroundColor: theme.colors.accent.primary }}
                      title="Accent"
                    />
                    <div
                      className="w-5 h-5 rounded border border-border-subtle"
                      style={{ backgroundColor: theme.colors.border.default }}
                      title="Border"
                    />
                    <div
                      className="w-5 h-5 rounded border border-border-subtle"
                      style={{ backgroundColor: theme.colors.status.success }}
                      title="Success"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom JSON Theme Importer */}
        <div className="bg-bg-surface border border-border-subtle rounded p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileJson className="w-4 h-4 text-accent-primary" />
              <h2 className="text-xs font-semibold text-tx-primary uppercase tracking-wider">
                Custom JSON Theme Configuration
              </h2>
            </div>
            <button
              onClick={handleCopyCurrentTheme}
              className="flex items-center space-x-1 px-2 py-1 text-xs rounded bg-bg-elevated hover:bg-bg-overlay border border-border-subtle text-tx-secondary hover:text-tx-primary transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Active Theme JSON</span>
            </button>
          </div>

          <p className="text-xs text-tx-secondary">
            Paste any custom <span className="font-mono text-tx-primary">theme.json</span> compliant
            with the SqlX schema to apply it dynamically to the entire desktop window in real-time.
          </p>

          <textarea
            rows={8}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='{ "name": "Custom Solid", "type": "dark", "colors": { "background": { "base": "#101014", ... } } }'
            className="w-full bg-editor-bg border border-border-subtle rounded p-3 font-mono text-xs text-tx-primary focus:outline-none focus:border-accent-primary"
          />

          {statusMsg && (
            <div
              className={`p-2 rounded text-xs font-mono ${
                statusMsg.isError
                  ? 'bg-status-error/10 text-status-error border border-status-error/30'
                  : 'bg-status-success/10 text-status-success border border-status-success/30'
              }`}
            >
              {statusMsg.text}
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-1">
            <button
              onClick={handleApplyJson}
              className="px-4 py-1.5 rounded bg-accent-primary text-accent-text text-xs font-medium hover:bg-accent-hover active:bg-accent-active transition-colors flex items-center space-x-1.5"
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
