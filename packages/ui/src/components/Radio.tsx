import React from 'react';
import { cn } from '../lib/utils';

export interface RadioGroupProps {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string; description?: string }>;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  name: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  error,
  options,
  value,
  onChange,
  disabled,
  name,
}) => {
  return (
    <div className="w-full">
      {label && <div className="mb-3 text-sm font-medium text-slate-200">{label}</div>}
      <div className="space-y-2">
        {options.map((option) => (
          <Radio
            key={option.value}
            name={name}
            value={option.value}
            label={option.label}
            description={option.description}
            checked={value === option.value}
            onChange={() => onChange?.(option.value)}
            disabled={disabled}
            error={error}
          />
        ))}
      </div>
      {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
    </div>
  );
};

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
  error?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, error, ...props }, ref) => {
    return (
      <label className="flex items-start gap-3 cursor-pointer group glass rounded-xl p-3 transition-all duration-200 hover:bg-white/5">
        <div className="relative flex items-center justify-center pt-0.5">
          <input
            type="radio"
            ref={ref}
            className={cn(
              'peer h-5 w-5 cursor-pointer appearance-none rounded-full',
              'glass transition-all duration-200',
              'focus-ring',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-red-500/50 focus:ring-red-500',
              className
            )}
            {...props}
          />
          <div className="pointer-events-none absolute h-2.5 w-2.5 rounded-full bg-primary-500 opacity-0 transition-opacity peer-checked:opacity-100" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
            {label}
          </div>
          {description && (
            <div className="mt-1 text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
              {description}
            </div>
          )}
        </div>
      </label>
    );
  }
);

Radio.displayName = 'Radio';
