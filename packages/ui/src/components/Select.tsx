import React from 'react';
import { cn } from '../lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-slate-200">{label}</label>
        )}
        <select
          ref={ref}
          className={cn(
            'glass w-full rounded-xl px-4 py-3 text-white',
            'transition-all duration-200',
            'focus-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'appearance-none bg-[url("data:svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")] bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat pr-10',
            error && 'border-red-500/50 focus:ring-red-500',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-slate-900">
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
