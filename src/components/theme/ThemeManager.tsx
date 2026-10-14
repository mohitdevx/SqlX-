import { BUILTIN_THEMES, type CategoryId } from '@/data/builtinThemes';
import { useThemeStore } from '@/stores/themeStore';
import type { SqlXTheme } from '@/types/theme';
import { Braces, Check, Palette, Plus } from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';
import { ThemeCard } from './ThemeCard';
import { ThemeCategories } from './ThemeCategories';
import { ThemeEditorModal } from './ThemeEditorModal';

export const ThemeManager: React.FC = () => {
  const { currentTheme, customThemes, setTheme, addCustomTheme, removeCustomTheme } =
    useThemeStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [copiedActive, setCopiedActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Combine built-in and user-saved custom themes
  const allThemesList = useMemo(() => {
    const list: { theme: SqlXTheme; isCustom: boolean }[] = BUILTIN_THEMES.map((t) => ({
      theme: t,
      isCustom: false,
    }));
    if (customThemes && customThemes.length > 0) {
      for (const t of customThemes) {
        list.push({ theme: t, isCustom: true });
      }
    }
    return list;
  }, [customThemes]);

  // Filter themes based on search & category ('all' | 'light' | 'dark' | 'custom')
  const filteredThemes = useMemo(() => {
    return allThemesList.filter(({ theme, isCustom }) => {
      const matchesSearch = theme.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'custom') return isCustom;
      if (selectedCategory === 'light') return theme.type === 'light';
      if (selectedCategory === 'dark') return theme.type === 'dark';
      return true;
    });
  }, [allThemesList, searchTerm, selectedCategory]);

  // Export active theme JSON to clipboard
  const handleCopyCurrentTheme = () => {
    navigator.clipboard.writeText(JSON.stringify(currentTheme, null, 2));
    setCopiedActive(true);
    setTimeout(() => setCopiedActive(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-bg-base text-tx-primary font-sans select-none custom-scrollbar p-6 md:p-10">
      <div className="max-w-5xl w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent-primary/10 flex items-center justify-center text-accent-primary">
                <Palette className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-medium tracking-tight text-tx-primary">Appearance</h1>
            </div>
            <p className="text-xs text-tx-muted mt-1">
              Select or create visual themes for SqlX &bull; {allThemesList.length} themes available
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* {} JSON Icon Export Button */}
            <button
              type="button"
              onClick={handleCopyCurrentTheme}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-tx-secondary hover:text-tx-primary transition-all flex items-center space-x-1.5 cursor-pointer"
              title="Export active theme JSON"
            >
              {copiedActive ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Braces className="w-3.5 h-3.5 text-tx-muted" />
              )}
              <span>{copiedActive ? 'Copied' : 'JSON'}</span>
            </button>

            {/* + Add Theme Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-accent-primary hover:bg-accent-primary-hover active:scale-[0.98] text-accent-text text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Theme</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs (Strictly 4: All, Light, Dark, Custom) & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <ThemeCategories
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search themes..."
              className="w-full pl-3 pr-3 py-1.5 rounded-lg bg-white/[0.04] focus:bg-white/[0.07] text-xs text-tx-primary placeholder-tx-muted focus:outline-none transition-colors font-sans"
            />
          </div>
        </div>

        {/* Empty State for Custom Tab */}
        {filteredThemes.length === 0 && selectedCategory === 'custom' && (
          <div className="py-16 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto text-tx-muted">
              <Palette className="w-5 h-5 opacity-60" />
            </div>
            <div>
              <p className="text-xs font-medium text-tx-secondary">No custom themes saved yet</p>
              <p className="text-[11px] text-tx-muted mt-0.5">
                Click &ldquo;Add Theme&rdquo; to paste your own theme JSON palette.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-tx-primary transition-colors cursor-pointer inline-flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Custom Theme</span>
            </button>
          </div>
        )}

        {/* Themes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredThemes.map(({ theme, isCustom }) => (
            <ThemeCard
              key={theme.name}
              theme={theme}
              isCustom={isCustom}
              isSelected={currentTheme.name === theme.name}
              onSelect={() => setTheme(theme)}
              onDelete={isCustom ? () => removeCustomTheme(theme.name) : undefined}
            />
          ))}
        </div>
      </div>

      <ThemeEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentTheme={currentTheme}
        onSaveTheme={addCustomTheme}
      />
    </div>
  );
};
export default ThemeManager;
