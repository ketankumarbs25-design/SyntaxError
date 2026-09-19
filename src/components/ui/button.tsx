import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none',
          variant === 'default' &&
            'bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-700/60 shadow-sm',
          variant === 'outline' &&
            'border border-slate-700/60 bg-transparent hover:bg-slate-800/60 text-slate-200',
          variant === 'ghost' &&
            'hover:bg-slate-800/50 text-slate-200',
          size === 'default' && 'h-9 px-4 py-2',
          size === 'sm' && 'h-8 rounded-lg px-3 text-xs',
          size === 'lg' && 'h-11 rounded-xl px-8',
          size === 'icon' && 'h-9 w-9',
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
