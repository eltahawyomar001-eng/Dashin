'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';
import type { MetricData, KPI } from '@dashin/shared-types';

/**
 * Trend Indicator Component
 */
export interface TrendIndicatorProps {
  change: number;
  direction?: 'up' | 'down' | 'neutral';
  isGoodDirectionUp?: boolean;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  change,
  direction,
  isGoodDirectionUp = true,
  showIcon = true,
  size = 'md',
}) => {
  const absChange = Math.abs(change);
  const computedDirection = direction || (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral');
  
  // Determine color based on direction and whether it's good or bad
  const isPositive = (computedDirection === 'up' && isGoodDirectionUp) || 
                    (computedDirection === 'down' && !isGoodDirectionUp);
  
  const colorClasses = {
    positive: 'text-green-600 bg-green-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50',
  };

  const color = computedDirection === 'neutral' 
    ? 'neutral' 
    : isPositive 
    ? 'positive' 
    : 'negative';

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-2.5 py-1.5',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  const Icon = computedDirection === 'up' 
    ? TrendingUp 
    : computedDirection === 'down' 
    ? TrendingDown 
    : Minus;

  return (
    <div className={`inline-flex items-center gap-1 rounded-full font-medium ${colorClasses[color]} ${sizeClasses[size]}`}>
      {showIcon && <Icon size={iconSizes[size]} />}
      <span>{absChange.toFixed(1)}%</span>
    </div>
  );
};

/**
 * Sparkline Component (Mini line chart)
 */
export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showDots?: boolean;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 80,
  height = 24,
  color = '#8b5cf6',
  showDots = false,
}) => {
  if (data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Generate SVG path
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  });

  const path = `M ${points.join(' L ')}`;

  return (
    <svg width={width} height={height} className="inline-block">
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showDots && data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r={1.5}
            fill={color}
          />
        );
      })}
    </svg>
  );
};

/**
 * Metric Card Component
 */
export interface MetricCardProps extends MetricData {
  icon?: React.ReactNode;
  loading?: boolean;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  change,
  changeDirection,
  trend,
  target,
  unit = '',
  icon,
  loading = false,
  onClick,
}) => {
  const formatValue = (val: number): string => {
    if (unit === '%') return `${val.toFixed(1)}%`;
    if (unit === '$') return `$${val.toLocaleString()}`;
    if (unit === 'currency') return `$${val.toLocaleString()}`;
    return val.toLocaleString();
  };

  const targetProgress = target ? (value / target) * 100 : undefined;

  return (
    <div
      className={`bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      {loading ? (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              {icon && (
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                  {icon}
                </div>
              )}
              <span className="text-sm font-medium text-gray-600">{label}</span>
            </div>
            {change !== undefined && (
              <TrendIndicator
                change={change}
                direction={changeDirection}
                size="sm"
              />
            )}
          </div>

          {/* Value */}
          <div className="mb-2">
            <span className="text-3xl font-bold text-gray-900">
              {formatValue(value)}
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            {trend && trend.length > 0 ? (
              <Sparkline data={trend} color="#8b5cf6" />
            ) : (
              <div className="w-20" />
            )}
            
            {target !== undefined && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Target size={12} />
                <span>
                  {targetProgress !== undefined && targetProgress.toFixed(0)}% of {formatValue(target)}
                </span>
              </div>
            )}
          </div>

          {/* Progress Bar (if target exists) */}
          {target !== undefined && targetProgress !== undefined && (
            <div className="mt-3">
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all"
                  style={{ width: `${Math.min(targetProgress, 100)}%` }}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

/**
 * KPI Card Component (Enhanced Metric Card)
 */
export interface KPICardProps extends KPI {
  loading?: boolean;
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  name,
  description,
  value,
  previousValue,
  change,
  changeDirection,
  target,
  format,
  isGoodDirectionUp,
  trend,
  updatedAt,
  loading = false,
  onClick,
}) => {
  const formatValue = (val: number): string => {
    switch (format) {
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'currency':
        return `$${val.toLocaleString()}`;
      case 'duration':
        if (val < 60) return `${val.toFixed(0)}s`;
        if (val < 3600) return `${(val / 60).toFixed(1)}m`;
        return `${(val / 3600).toFixed(1)}h`;
      default:
        return val.toLocaleString();
    }
  };

  const targetProgress = target ? (value / target) * 100 : undefined;
  const hasComparison = previousValue !== undefined && change !== undefined;

  return (
    <div
      className={`bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      {loading ? (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
          <div className="h-10 bg-gray-200 rounded w-full mb-4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{name}</h3>
              {description && (
                <p className="text-xs text-gray-500 mt-1">{description}</p>
              )}
            </div>
            {hasComparison && (
              <TrendIndicator
                change={change}
                direction={changeDirection}
                isGoodDirectionUp={isGoodDirectionUp}
                size="md"
              />
            )}
          </div>

          {/* Value */}
          <div className="mb-4">
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {formatValue(value)}
            </div>
            {hasComparison && previousValue !== undefined && (
              <div className="text-sm text-gray-500">
                vs {formatValue(previousValue)} previous period
              </div>
            )}
          </div>

          {/* Sparkline */}
          {trend && trend.length > 0 && (
            <div className="mb-3">
              <Sparkline data={trend} width={120} height={32} color="#8b5cf6" />
            </div>
          )}

          {/* Target Progress */}
          {target !== undefined && targetProgress !== undefined && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Progress to target</span>
                <span className="font-medium">{targetProgress.toFixed(0)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    targetProgress >= 100 
                      ? 'bg-green-500' 
                      : targetProgress >= 75 
                      ? 'bg-blue-500' 
                      : targetProgress >= 50 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(targetProgress, 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Target: {formatValue(target)}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-xs text-gray-400">
            Updated {new Date(updatedAt).toLocaleString()}
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Stat Card Component (Simpler version for dashboards)
 */
export interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  color?: 'purple' | 'blue' | 'green' | 'yellow' | 'red';
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  icon,
  color = 'purple',
  loading = false,
}) => {
  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-5">
      {loading ? (
        <div className="animate-pulse">
          <div className="h-10 w-10 bg-gray-200 rounded-lg mb-3" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-6 bg-gray-200 rounded w-3/4" />
        </div>
      ) : (
        <>
          {icon && (
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorClasses[color]}`}>
              {icon}
            </div>
          )}
          
          <div className="text-sm text-gray-600 mb-1">{label}</div>
          
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-gray-900">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            
            {change !== undefined && (
              <TrendIndicator change={change} size="sm" showIcon={false} />
            )}
          </div>
        </>
      )}
    </div>
  );
};
