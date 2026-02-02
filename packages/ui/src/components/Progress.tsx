'use client';

import { cn } from '../lib/utils';

export interface ProgressProps {
  value: number; // 0-100
  className?: string;
  indicatorClassName?: string;
  showLabel?: boolean;
}

export function Progress({ 
  value, 
  className, 
  indicatorClassName,
  showLabel = false 
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('relative w-full overflow-hidden rounded-full bg-slate-800/50', className)}>
      <div
        className={cn(
          'h-full transition-all duration-300 ease-out rounded-full',
          'bg-gradient-to-r from-primary-500 to-primary-400',
          indicatorClassName
        )}
        style={{ width: `${percentage}%` }}
      >
        {showLabel && (
          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
            {percentage}%
          </span>
        )}
      </div>
    </div>
  );
}
