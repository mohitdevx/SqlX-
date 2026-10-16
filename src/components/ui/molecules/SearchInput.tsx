import { Search, X } from 'lucide-react';
import type React from 'react';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  autoFocus = false,
}) => {
  return (
    <div className={`relative flex items-center min-w-0 ${className}`}>
      <Search
        className="w-3.5 h-3.5 absolute left-2 text-tx-muted pointer-events-none"
        strokeWidth={1.5}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full bg-white/[0.04] focus:bg-white/[0.07] rounded-lg pl-7 pr-6 py-1 text-xs text-tx-primary placeholder:text-tx-muted focus:outline-none font-sans transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2 text-tx-muted hover:text-tx-primary transition-colors cursor-pointer"
          title="Clear search"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
