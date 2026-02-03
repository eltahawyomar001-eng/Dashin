/**
 * Mobile-Responsive Utilities
 * Components and utilities for mobile optimization
 */

'use client';

import { ReactNode, useState } from 'react';
import { FadeIn } from '@/components/animations';
import { ChevronDown, ChevronRight } from 'lucide-react';

// Responsive table wrapper (horizontal scroll on mobile)
interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveTable({ children, className = '' }: ResponsiveTableProps) {
  return (
    <div className="w-full overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
      <div className="inline-block min-w-full align-middle">
        <div className={`overflow-hidden ${className}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

// Mobile card view for table data
interface MobileCardProps {
  children: ReactNode;
  className?: string;
}

export function MobileCard({ children, className = '' }: MobileCardProps) {
  return (
    <div className={`lg:hidden rounded-lg border bg-card p-4 space-y-3 ${className}`}>
      {children}
    </div>
  );
}

// Mobile card field (label + value)
interface MobileCardFieldProps {
  label: string;
  value: ReactNode;
  className?: string;
}

export function MobileCardField({ label, value, className = '' }: MobileCardFieldProps) {
  return (
    <div className={`flex justify-between items-start gap-2 ${className}`}>
      <span className="text-sm text-muted-foreground font-medium">{label}:</span>
      <span className="text-sm font-medium text-right flex-1">{value}</span>
    </div>
  );
}

// Collapsible section for mobile
interface MobileCollapsibleProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function MobileCollapsible({ title, children, defaultOpen = false }: MobileCollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 text-left hover:bg-accent/50 transition-colors"
      >
        <span className="font-medium">{title}</span>
        {isOpen ? (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <FadeIn className="pb-4">
          {children}
        </FadeIn>
      )}
    </div>
  );
}

// Horizontal scroll container with fade indicators
interface HorizontalScrollProps {
  children: ReactNode;
  className?: string;
}

export function HorizontalScroll({ children, className = '' }: HorizontalScrollProps) {
  return (
    <div className="relative -mx-4 px-4 lg:mx-0 lg:px-0">
      {/* Left fade indicator */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10 lg:hidden" />
      
      {/* Scrollable content */}
      <div className={`overflow-x-auto scrollbar-hide ${className}`}>
        <div className="inline-flex gap-4 pb-2">
          {children}
        </div>
      </div>

      {/* Right fade indicator */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10 lg:hidden" />
    </div>
  );
}

// Mobile-optimized tabs (horizontal scroll)
interface MobileTabsProps {
  tabs: { id: string; label: string; count?: number }[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export function MobileTabs({ tabs, activeTab, onChange }: MobileTabsProps) {
  return (
    <div className="relative -mx-4 lg:mx-0">
      <div className="overflow-x-auto scrollbar-hide px-4 lg:px-0">
        <div className="inline-flex gap-2 border-b min-w-full lg:min-w-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`px-4 py-2 whitespace-nowrap font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-muted">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Touch-friendly checkbox/radio
interface TouchCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

export function TouchCheckbox({ checked, onChange, label, description }: TouchCheckboxProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left min-h-[44px]"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <div className={`mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
        checked ? 'bg-primary border-primary' : 'border-muted-foreground'
      }`}>
        {checked && (
          <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <div className="flex-1">
        <div className="font-medium">{label}</div>
        {description && <div className="text-sm text-muted-foreground mt-0.5">{description}</div>}
      </div>
    </button>
  );
}

// Mobile-optimized select/dropdown
interface MobileSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label?: string;
}

export function MobileSelect({ value, onChange, options, label }: MobileSelectProps) {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 px-4 rounded-lg border bg-background text-foreground appearance-none"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Mobile-optimized search input
interface MobileSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export function MobileSearch({ value, onChange, placeholder = 'Search...', onClear }: MobileSearchProps) {
  return (
    <div className="relative">
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-12 pl-4 pr-10 rounded-lg border bg-background text-foreground"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      />
      {value && onClear && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded"
          aria-label="Clear search"
        >
          <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

// Swipeable card (for delete, archive actions)
interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  swipeLeftLabel?: string;
  swipeRightLabel?: string;
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  swipeLeftLabel = 'Delete',
  swipeRightLabel = 'Archive',
}: SwipeableCardProps) {
  // Note: Full swipe implementation would require touch event handlers
  // This is a simplified version showing the structure
  return (
    <div className="relative overflow-hidden">
      {/* Left action */}
      {onSwipeLeft && (
        <div className="absolute left-0 top-0 bottom-0 bg-red-500 text-white flex items-center px-4">
          {swipeLeftLabel}
        </div>
      )}
      
      {/* Right action */}
      {onSwipeRight && (
        <div className="absolute right-0 top-0 bottom-0 bg-blue-500 text-white flex items-center px-4">
          {swipeRightLabel}
        </div>
      )}

      {/* Main content */}
      <div className="relative bg-card">
        {children}
      </div>
    </div>
  );
}

// Pull to refresh indicator
export function PullToRefresh({ onRefresh }: { onRefresh: () => void }) {
  // Note: Full implementation would require touch event handlers
  // This is a placeholder showing the structure
  return (
    <div className="hidden lg:hidden" onClick={onRefresh}>
      {/* Pull to refresh UI would go here */}
    </div>
  );
}

// Mobile spacing utility
export function MobileSpacer({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8',
  };

  return <div className={`lg:hidden ${sizes[size]}`} />;
}
