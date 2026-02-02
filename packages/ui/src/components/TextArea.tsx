import React from 'react';
import { cn } from '../lib/utils';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharCount?: boolean;
  maxLength?: number;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, helperText, showCharCount, maxLength, value, ...props }, ref) => {
    const charCount = value?.toString().length || 0;

    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-slate-200">{label}</label>
        )}
        <textarea
          ref={ref}
          value={value}
          maxLength={maxLength}
          className={cn(
            'glass w-full rounded-xl px-4 py-3 text-white placeholder-slate-400',
            'transition-all duration-200 resize-y',
            'focus-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'min-h-[100px]',
            error && 'border-red-500/50 focus:ring-red-500',
            className
          )}
          {...props}
        />
        <div className="mt-1.5 flex items-center justify-between">
          <div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            {!error && helperText && <p className="text-xs text-slate-400">{helperText}</p>}
          </div>
          {showCharCount && maxLength && (
            <p className={cn(
              'text-xs transition-colors',
              charCount > maxLength * 0.9 ? 'text-amber-400' : 'text-slate-400',
              charCount >= maxLength && 'text-red-400'
            )}>
              {charCount} / {maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
