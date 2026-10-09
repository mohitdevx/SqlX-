import type { SqlXTheme } from '@/types/theme';

export function applyTheme(theme: SqlXTheme) {
  const root = document.documentElement;
  const { colors } = theme;

  // Backgrounds
  root.style.setProperty('--color-bg-base', colors.background.base);
  root.style.setProperty('--color-bg-surface', colors.background.surface);
  root.style.setProperty('--color-bg-overlay', colors.background.overlay);
  root.style.setProperty('--color-bg-elevated', colors.background.elevated);

  // Borders
  root.style.setProperty('--color-border-subtle', colors.border.subtle);
  root.style.setProperty('--color-border-default', colors.border.default);
  root.style.setProperty('--color-border-strong', colors.border.strong);

  // Text
  root.style.setProperty('--color-text-primary', colors.text.primary);
  root.style.setProperty('--color-text-secondary', colors.text.secondary);
  root.style.setProperty('--color-text-muted', colors.text.muted);
  root.style.setProperty('--color-text-inverse', colors.text.inverse);

  // Accent
  root.style.setProperty('--color-accent-primary', colors.accent.primary);
  root.style.setProperty('--color-accent-primary-hover', colors.accent.primaryHover);
  root.style.setProperty('--color-accent-primary-active', colors.accent.primaryActive);
  root.style.setProperty('--color-accent-text', colors.accent.text);

  // Status
  root.style.setProperty('--color-status-success', colors.status.success);
  root.style.setProperty('--color-status-warning', colors.status.warning);
  root.style.setProperty('--color-status-error', colors.status.error);
  root.style.setProperty('--color-status-info', colors.status.info);

  // Editor
  root.style.setProperty('--color-editor-bg', colors.editor.background);
  root.style.setProperty('--color-editor-cursor', colors.editor.cursor);
  root.style.setProperty('--color-editor-selection', colors.editor.selection);
  root.style.setProperty('--color-editor-highlight', colors.editor.lineHighlight);
  root.style.setProperty('--color-editor-gutter-bg', colors.editor.gutterBackground);
  root.style.setProperty('--color-editor-gutter-fg', colors.editor.gutterForeground);

  // Grid
  root.style.setProperty('--color-grid-header-bg', colors.grid.headerBackground);
  root.style.setProperty('--color-grid-header-tx', colors.grid.headerText);
  root.style.setProperty('--color-grid-row-even', colors.grid.rowEven);
  root.style.setProperty('--color-grid-row-odd', colors.grid.rowOdd);
  root.style.setProperty('--color-grid-row-hover', colors.grid.rowHover);
  root.style.setProperty('--color-grid-row-selected', colors.grid.rowSelected);
  root.style.setProperty('--color-grid-cell-border', colors.grid.cellBorder);
  root.style.setProperty('--color-grid-null-val', colors.grid.nullValue);

  if (theme.type === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}
