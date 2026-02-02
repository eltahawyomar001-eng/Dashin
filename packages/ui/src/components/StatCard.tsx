import React from 'react';
import { cn } from '../lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  className,
}) => {
  const variantStyles = {
    default: 'glass',
    primary: 'glass border-l-4 border-l-primary-500',
    success: 'glass border-l-4 border-l-green-500',
    warning: 'glass border-l-4 border-l-amber-500',
    error: 'glass border-l-4 border-l-red-500',
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value === 0) return <Minus className="h-4 w-4" />;
    return trend.isPositive ? (
      <TrendingUp className="h-4 w-4" />
    ) : (
      <TrendingDown className="h-4 w-4" />
    );
  };

  const getTrendColor = () => {
    if (!trend) return '';
    if (trend.value === 0) return 'text-slate-400';
    return trend.isPositive ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className={cn('rounded-xl p-6 transition-all hover:shadow-glass-lg', variantStyles[variant], className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
        </div>
        {icon && (
          <div className="flex-shrink-0 glass-strong rounded-xl p-3">
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div className={cn('mt-4 flex items-center gap-1.5 text-sm font-medium', getTrendColor())}>
          {getTrendIcon()}
          <span>
            {trend.value > 0 ? '+' : ''}
            {trend.value}%
          </span>
          {trend.label && <span className="text-slate-400">{trend.label}</span>}
        </div>
      )}
    </div>
  );
};

export interface MetricsGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  children,
  columns = 3,
  className,
}) => {
  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-6', gridClasses[columns], className)}>
      {children}
    </div>
  );
};
