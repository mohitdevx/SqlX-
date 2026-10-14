import { CATEGORIES, type CategoryId } from '@/data/builtinThemes';
import type React from 'react';

export interface ThemeCategoriesProps {
  selectedCategory: CategoryId;
  onSelectCategory: (category: CategoryId) => void;
}

export const ThemeCategories: React.FC<ThemeCategoriesProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex items-center space-x-5 self-start overflow-x-auto max-w-full">
      {CATEGORIES.map((cat) => {
        const isActive = selectedCategory === cat.id;
        return (
          <button
            type="button"
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`py-1.5 px-1 text-xs font-medium transition-all cursor-pointer border-b-2 ${
              isActive
                ? 'border-accent-primary text-accent-primary'
                : 'border-transparent text-tx-muted hover:text-tx-primary'
            }`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
};
