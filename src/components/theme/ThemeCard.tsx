import type { SqlXTheme } from '@/types/theme';
import { Check, Moon, Sun, Trash2 } from 'lucide-react';
import type React from 'react';

export interface ThemeCardProps {
  theme: SqlXTheme;
  isCustom: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onDelete?: () => void;
}

export const ThemeCard: React.FC<ThemeCardProps> = ({
  theme,
  isCustom,
  isSelected,
  onSelect,
  onDelete,
}) => {
  const ModeIcon = theme.type === 'light' ? Sun : Moon;

  return (
    <div
      onClick={onSelect}
      className={`group relative p-3.5 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 ${
        isSelected
          ? 'bg-white/[0.08] ring-1.5 ring-accent-primary shadow-lg shadow-black/20'
          : 'bg-white/[0.03] hover:bg-white/[0.06] hover:shadow-md'
      }`}
    >
      {/* Modern Visual Palette & Preview Tile */}
      <div
        className="w-full h-32 rounded-xl p-3 flex flex-col justify-between border border-white/5 relative overflow-hidden select-none transition-transform duration-200 group-hover:scale-[1.01]"
        style={{ backgroundColor: theme.colors.background.base }}
      >
        {/* Floating Mini Editor Box */}
        <div
          className="rounded-lg p-2.5 border shadow-xs space-y-1.5"
          style={{
            backgroundColor: theme.colors.background.surface,
            borderColor: theme.colors.border.subtle,
          }}
        >
          {/* Mini Tab Strip */}
          <div
            className="flex items-center justify-between pb-1 border-b"
            style={{ borderColor: theme.colors.border.subtle }}
          >
            <div className="flex items-center space-x-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: theme.colors.accent.primary }}
              />
              <span
                className="text-[9px] font-mono font-medium"
                style={{ color: theme.colors.text.primary }}
              >
                query.sql
              </span>
            </div>
            <span
              className="text-[8px] font-mono px-1 rounded uppercase"
              style={{
                backgroundColor: theme.colors.background.elevated,
                color: theme.colors.text.muted,
              }}
            >
              SQL
            </span>
          </div>

          {/* Realistic Syntax Preview */}
          <div className="font-mono text-[9.5px] leading-relaxed">
            <div className="truncate">
              <span
                style={{
                  color: theme.colors.syntax?.keyword || theme.colors.accent.primary,
                }}
                className="font-semibold"
              >
                SELECT
              </span>{' '}
              <span style={{ color: theme.colors.text.primary }}>*</span>{' '}
              <span
                style={{
                  color: theme.colors.syntax?.keyword || theme.colors.accent.primary,
                }}
                className="font-semibold"
              >
                FROM
              </span>{' '}
              <span
                style={{
                  color: theme.colors.syntax?.string || theme.colors.status.success,
                }}
              >
                users
              </span>
              <span style={{ color: theme.colors.text.muted }}>;</span>
            </div>
            <div className="truncate opacity-90">
              <span
                style={{
                  color: theme.colors.syntax?.keyword || theme.colors.accent.primary,
                }}
                className="font-semibold"
              >
                WHERE
              </span>{' '}
              <span style={{ color: theme.colors.text.primary }}>status</span>{' '}
              <span
                style={{
                  color: theme.colors.syntax?.operator || theme.colors.text.muted,
                }}
              >
                =
              </span>{' '}
              <span
                style={{
                  color: theme.colors.syntax?.number || theme.colors.status.warning,
                }}
              >
                true
              </span>
              <span style={{ color: theme.colors.text.muted }}>;</span>
            </div>
          </div>
        </div>

        {/* Palette Color Swatch Discs */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-1">
            <span
              className="w-2.5 h-2.5 rounded-full border border-white/10 shadow-xs"
              style={{ backgroundColor: theme.colors.background.base }}
              title="Base Background"
            />
            <span
              className="w-2.5 h-2.5 rounded-full border border-white/10 shadow-xs"
              style={{ backgroundColor: theme.colors.background.surface }}
              title="Surface Background"
            />
            <span
              className="w-2.5 h-2.5 rounded-full border border-white/10 shadow-xs"
              style={{ backgroundColor: theme.colors.accent.primary }}
              title="Accent Color"
            />
            <span
              className="w-2.5 h-2.5 rounded-full border border-white/10 shadow-xs"
              style={{ backgroundColor: theme.colors.status.success }}
              title="Status Success"
            />
          </div>

          <span
            className="text-[9px] font-mono px-1.5 py-0.5 rounded-full border capitalize"
            style={{
              backgroundColor: theme.colors.background.surface,
              borderColor: theme.colors.border.subtle,
              color: theme.colors.text.secondary,
            }}
          >
            {theme.type}
          </span>
        </div>
      </div>

      {/* Card Bottom Meta & Actions */}
      <div className="flex items-center justify-between gap-2 px-0.5">
        <div className="min-w-0 flex-1 flex items-center space-x-1.5">
          <ModeIcon className="w-3 h-3 text-tx-muted shrink-0" />
          <h3 className="text-xs font-semibold text-tx-primary truncate">{theme.name}</h3>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          {isSelected ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent-primary/15 text-accent-primary border border-accent-primary/30 flex items-center space-x-1">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
              <span>Active</span>
            </span>
          ) : (
            <span className="text-[10px] text-tx-muted opacity-0 group-hover:opacity-100 transition-opacity font-medium">
              Apply &rarr;
            </span>
          )}

          {isCustom && onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Remove custom theme "${theme.name}"?`)) {
                  onDelete();
                }
              }}
              className="p-1 text-tx-muted hover:text-rose-400 rounded-md hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Delete custom theme"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
