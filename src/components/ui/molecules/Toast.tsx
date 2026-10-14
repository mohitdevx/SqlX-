import { Sparkles } from 'lucide-react';
import type React from 'react';

export interface ToastProps {
  message: string | null;
  icon?: React.ReactNode;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  icon = <Sparkles className="w-3.5 h-3.5 text-accent-primary" />,
  className = '',
}) => {
  if (!message) return null;

  return (
    <div
      className={`fixed top-12 right-6 z-50 bg-bg-overlay border border-white/10 px-3.5 py-1.5 rounded-lg shadow-xl text-xs text-tx-primary font-mono flex items-center space-x-2 animate-fade-in ${className}`}
    >
      {icon}
      <span>{message}</span>
    </div>
  );
};
