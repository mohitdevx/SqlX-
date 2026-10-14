import type React from 'react';

export interface UnderlineTabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive: boolean;
  icon?: React.ReactNode;
}

export const UnderlineTab: React.FC<UnderlineTabProps> = ({
  isActive,
  icon,
  children,
  className = '',
  ...props
}) => {
  return (
    <button
      type="button"
      className={`flex items-center space-x-1.5 px-1 h-full text-xs font-medium transition-all cursor-pointer border-b-2 ${
        isActive
          ? 'border-accent-primary text-accent-primary'
          : 'border-transparent text-tx-muted hover:text-tx-primary'
      } ${className}`}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
};
