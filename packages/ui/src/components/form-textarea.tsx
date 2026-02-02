'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { cn } from '../lib/utils';

interface FormTextareaProps {
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
  className?: string;
}

export function FormTextarea({
  name,
  label,
  placeholder,
  description,
  required = false,
  disabled = false,
  rows = 4,
  maxLength,
  className,
}: FormTextareaProps) {
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext();

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;
  const value = watch(name) || '';
  const charCount = value.length;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label htmlFor={name} className="flex items-center gap-1 text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <textarea
            {...field}
            id={name}
            rows={rows}
            maxLength={maxLength}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : description ? `${name}-description` : undefined}
            className={cn(
              'w-full px-3 py-2 border rounded-md shadow-sm',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
              'resize-vertical',
              error && 'border-red-500 focus:ring-red-500 focus:border-red-500'
            )}
            value={field.value ?? ''}
          />
        )}
      />
      
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {description && !error && (
            <p id={`${name}-description`} className="text-sm text-gray-500">
              {description}
            </p>
          )}
          
          {error && (
            <p id={`${name}-error`} className="text-sm text-red-600 flex items-center gap-1">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {errorMessage}
            </p>
          )}
        </div>
        
        {maxLength && (
          <span className={cn(
            'text-sm',
            charCount > maxLength * 0.9 ? 'text-orange-600' : 'text-gray-500'
          )}>
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
