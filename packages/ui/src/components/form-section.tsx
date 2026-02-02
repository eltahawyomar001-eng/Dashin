'use client';

import { cn } from '../lib/utils';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  collapsible = false,
  defaultOpen = true,
  className,
}: FormSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  const content = (
    <div className={cn('space-y-4 p-6 border-t first:border-t-0', className)}>
      {children}
    </div>
  );

  if (!collapsible) {
    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
        {content}
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between p-4',
          'hover:bg-gray-50 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500'
        )}
      >
        <div className="text-left space-y-1">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
        <svg
          className={cn(
            'h-5 w-5 text-gray-500 transition-transform',
            isOpen && 'transform rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      
      {isOpen && content}
    </div>
  );
}

// Import React for useState
import React from 'react';
