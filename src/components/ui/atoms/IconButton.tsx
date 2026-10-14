import type React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  active = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <button
      type="button"
      className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center select-none ${
        active
          ? 'bg-white/[0.1] text-tx-primary'
          : 'text-tx-muted hover:text-tx-primary hover:bg-white/[0.04]'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
