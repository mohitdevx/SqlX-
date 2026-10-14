import type React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input: React.FC<InputProps> = ({ className = '', hasError = false, ...props }) => {
  return (
    <input
      className={`w-full bg-white/[0.04] focus:bg-white/[0.07] border rounded-lg px-2.5 py-1.5 text-xs text-tx-primary placeholder:text-tx-muted focus:outline-none font-sans transition-colors ${
        hasError
          ? 'border-status-error/50 focus:border-status-error'
          : 'border-white/10 focus:border-accent-primary/60'
      } ${className}`}
      {...props}
    />
  );
};
