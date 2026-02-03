/**
 * ARIA Utilities
 * Components and utilities for accessible rich internet applications
 */

'use client';

import { ReactNode } from 'react';

// ARIA Label wrapper
interface AriaLabelProps {
  children: ReactNode;
  label: string;
  description?: string;
}

export function AriaLabel({ children, label, description }: AriaLabelProps) {
  const labelId = `aria-label-${Math.random().toString(36).substr(2, 9)}`;
  const descId = description ? `aria-desc-${Math.random().toString(36).substr(2, 9)}` : undefined;

  return (
    <div
      aria-labelledby={labelId}
      aria-describedby={descId}
    >
      <span id={labelId} className="sr-only">
        {label}
      </span>
      {description && (
        <span id={descId} className="sr-only">
          {description}
        </span>
      )}
      {children}
    </div>
  );
}

// Loading indicator with ARIA
interface AccessibleLoadingProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AccessibleLoading({ label = 'Loading', size = 'md' }: AccessibleLoadingProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <div className={`animate-spin rounded-full border-2 border-primary border-t-transparent ${sizes[size]}`} />
      <span className="sr-only">{label}</span>
    </div>
  );
}

// Accessible button (handles both click and keyboard)
interface AccessibleButtonProps {
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

export function AccessibleButton({
  onClick,
  children,
  disabled = false,
  ariaLabel,
  className = '',
}: AccessibleButtonProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) {
        onClick();
      }
    }
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      onKeyPress={handleKeyPress}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      className={className}
    >
      {children}
    </button>
  );
}

// Accessible dialog/modal
interface AccessibleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}

export function AccessibleDialog({
  isOpen,
  onClose,
  title,
  description,
  children,
}: AccessibleDialogProps) {
  const titleId = `dialog-title-${Math.random().toString(36).substr(2, 9)}`;
  const descId = description ? `dialog-desc-${Math.random().toString(36).substr(2, 9)}` : undefined;

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background rounded-lg shadow-lg p-6 max-w-md w-full">
        <h2 id={titleId} className="text-xl font-semibold mb-2">
          {title}
        </h2>
        {description && (
          <p id={descId} className="text-sm text-muted-foreground mb-4">
            {description}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}

// Accessible tabs
interface TabItem {
  id: string;
  label: string;
  panel: ReactNode;
}

interface AccessibleTabsProps {
  tabs: TabItem[];
  defaultTab?: string;
}

export function AccessibleTabs({ tabs, defaultTab }: AccessibleTabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab || tabs[0]?.id || '');

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex = index;

    if (e.key === 'ArrowRight') {
      newIndex = (index + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      newIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      newIndex = 0;
    } else if (e.key === 'End') {
      newIndex = tabs.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    setActiveTab(tabs[newIndex]?.id || '');
  };

  return (
    <div>
      <div role="tablist" aria-label="Tabs" className="flex border-b">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== tab.id}
          className="py-4"
        >
          {tab.panel}
        </div>
      ))}
    </div>
  );
}

// Accessible tooltip
interface AccessibleTooltipProps {
  content: string;
  children: ReactNode;
}

export function AccessibleTooltip({ content, children }: AccessibleTooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const tooltipId = `tooltip-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="relative inline-block">
      <div
        aria-describedby={isVisible ? tooltipId : undefined}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div
          id={tooltipId}
          role="tooltip"
          className="absolute z-50 px-2 py-1 text-xs bg-gray-900 text-white rounded shadow-lg -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
        >
          {content}
        </div>
      )}
    </div>
  );
}

// Accessible progress bar
interface AccessibleProgressProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
}

export function AccessibleProgress({
  value,
  max = 100,
  label = 'Progress',
  showValue = true,
}: AccessibleProgressProps) {
  const percentage = Math.round((value / max) * 100);

  return (
    <div>
      {showValue && (
        <div className="flex justify-between text-sm mb-1">
          <span>{label}</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        className="w-full h-2 bg-muted rounded-full overflow-hidden"
      >
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="sr-only">
        {label}: {percentage}% complete
      </span>
    </div>
  );
}

// Accessible alert
interface AccessibleAlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: ReactNode;
}

export function AccessibleAlert({ type, title, children }: AccessibleAlertProps) {
  const roleMap = {
    info: 'status',
    success: 'status',
    warning: 'alert',
    error: 'alert',
  } as const;

  const ariaLive = {
    info: 'polite',
    success: 'polite',
    warning: 'assertive',
    error: 'assertive',
  } as const;

  return (
    <div
      role={roleMap[type]}
      aria-live={ariaLive[type]}
      aria-atomic="true"
      className={`p-4 rounded-lg ${
        type === 'error'
          ? 'bg-red-50 text-red-900'
          : type === 'warning'
          ? 'bg-yellow-50 text-yellow-900'
          : type === 'success'
          ? 'bg-green-50 text-green-900'
          : 'bg-blue-50 text-blue-900'
      }`}
    >
      {title && <div className="font-semibold mb-1">{title}</div>}
      <div>{children}</div>
    </div>
  );
}

// Import React for useState
import * as React from 'react';
