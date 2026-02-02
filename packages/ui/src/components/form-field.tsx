'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { Input } from './Input';
import { cn } from '../lib/utils';

interface FormFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'url' | 'tel' | 'date' | 'datetime-local';
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function FormField({
  name,
  label,
  placeholder,
  type = 'text',
  description,
  required = false,
  disabled = false,
  className,
}: FormFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

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
          <Input
            {...field}
            id={name}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : description ? `${name}-description` : undefined}
            className={cn(error && 'border-red-500 focus-visible:ring-red-500')}
            value={field.value ?? ''}
            onChange={(e) => {
              const value = type === 'number' ? parseFloat(e.target.value) : e.target.value;
              field.onChange(value);
            }}
          />
        )}
      />
      
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
  );
}
