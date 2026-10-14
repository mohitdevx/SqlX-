import type React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'xs' | 'sm' | 'md';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-accent-primary hover:bg-accent-primaryHover active:bg-accent-primaryActive text-white shadow-sm',
  secondary:
    'bg-white/[0.05] hover:bg-white/[0.1] active:bg-white/[0.15] text-tx-primary border border-white/10',
  ghost:
    'bg-transparent hover:bg-white/[0.06] active:bg-white/[0.1] text-tx-secondary hover:text-tx-primary',
  danger:
    'bg-status-error/10 hover:bg-status-error/20 active:bg-status-error/30 text-status-error border border-status-error/20',
  outline:
    'bg-transparent border border-border-default hover:border-border-strong text-tx-primary hover:bg-white/[0.04]',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-[11px] rounded-md gap-1',
  sm: 'px-2.5 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-3.5 py-2 text-xs rounded-lg gap-2',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'sm',
  isLoading = false,
  className = '',
  disabled,
  children,
  ...props
}) => {
  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
