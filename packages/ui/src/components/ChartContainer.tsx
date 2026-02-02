import React from 'react';
import { cn } from '../lib/utils';

export interface ChartContainerProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  height?: number | string;
  variant?: 'glass' | 'glass-strong' | 'glass-subtle';
  className?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  description,
  actions,
  children,
  height = 300,
  variant = 'glass',
  className,
}) => {
  const variantClasses = {
    glass: 'glass',
    'glass-strong': 'glass-strong',
    'glass-subtle': 'glass-subtle',
  };

  return (
    <div className={cn('rounded-xl p-6', variantClasses[variant], className)}>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-slate-400">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div style={{ height: typeof height === 'number' ? `${height}px` : height }}>
        {children}
      </div>
    </div>
  );
};

export interface TimeRangeOption {
  label: string;
  value: string;
}

export interface ChartTimeRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options?: TimeRangeOption[];
}

export const ChartTimeRangeSelector: React.FC<ChartTimeRangeSelectorProps> = ({
  value,
  onChange,
  options = [
    { label: '7D', value: '7d' },
    { label: '30D', value: '30d' },
    { label: '90D', value: '90d' },
    { label: '1Y', value: '1y' },
  ],
}) => {
  return (
    <div className="flex items-center gap-1 glass-strong rounded-lg p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
            value === option.value
              ? 'bg-primary-500 text-white'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export interface ChartLegendItem {
  label: string;
  color: string;
  value?: string | number;
}

export interface ChartLegendProps {
  items: ChartLegendItem[];
  layout?: 'horizontal' | 'vertical';
  className?: string;
}

export const ChartLegend: React.FC<ChartLegendProps> = ({
  items,
  layout = 'horizontal',
  className,
}) => {
  const layoutClasses = {
    horizontal: 'flex flex-wrap items-center gap-4',
    vertical: 'flex flex-col gap-2',
  };

  return (
    <div className={cn(layoutClasses[layout], className)}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-sm text-slate-300">{item.label}</span>
          {item.value !== undefined && (
            <span className="text-sm font-semibold text-white">{item.value}</span>
          )}
        </div>
      ))}
    </div>
  );
};
