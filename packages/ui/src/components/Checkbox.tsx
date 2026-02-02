import React from 'react';
import { cn } from '../lib/utils';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative flex items-center justify-center">
            <input
              type="checkbox"
              ref={ref}
              className={cn(
                'peer h-5 w-5 cursor-pointer appearance-none rounded-lg',
                'glass transition-all duration-200',
                'focus-ring',
                'checked:bg-primary-500 checked:border-primary-500',
                'disabled:cursor-not-allowed disabled:opacity-50',
                error && 'border-red-500/50 focus:ring-red-500',
                className
              )}
              {...props}
            />
            <Check
              className="pointer-events-none absolute h-3.5 w-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100"
              strokeWidth={3}
            />
          </div>
          {label && (
            <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
              {label}
            </span>
          )}
        </label>
        {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
