'use client';

import { cn } from '../lib/utils';

interface FormErrorProps {
  message?: string;
  className?: string;
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md',
        className
      )}
      role="alert"
    >
      <svg
        className="h-5 w-5 text-red-600 flex-shrink-0"
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
      <p className="text-sm text-red-800">{message}</p>
    </div>
  );
}

interface FormSuccessProps {
  message?: string;
  className?: string;
}

export function FormSuccess({ message, className }: FormSuccessProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md',
        className
      )}
      role="status"
    >
      <svg
        className="h-5 w-5 text-green-600 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
      <p className="text-sm text-green-800">{message}</p>
    </div>
  );
}
