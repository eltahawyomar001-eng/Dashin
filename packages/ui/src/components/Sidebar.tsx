import React from 'react';
import { cn } from '../lib/utils';

export interface SidebarProps {
  children: React.ReactNode;
  className?: string;
}

export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ children, className }, ref) => {
    return (
      <aside
        ref={ref}
        className={cn(
          'glass-strong fixed left-0 top-0 z-40 h-screen w-64',
          'border-r border-white/10',
          'flex flex-col',
          'transition-transform duration-300',
          className
        )}
      >
        {children}
      </aside>
    );
  }
);

Sidebar.displayName = 'Sidebar';

export interface SidebarHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const SidebarHeader = React.forwardRef<HTMLDivElement, SidebarHeaderProps>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('border-b border-white/10 p-6', className)}
      >
        {children}
      </div>
    );
  }
);

SidebarHeader.displayName = 'SidebarHeader';

export interface SidebarContentProps {
  children: React.ReactNode;
  className?: string;
}

export const SidebarContent = React.forwardRef<HTMLDivElement, SidebarContentProps>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex-1 overflow-y-auto p-4', className)}
      >
        {children}
      </div>
    );
  }
);

SidebarContent.displayName = 'SidebarContent';

export interface SidebarFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const SidebarFooter = React.forwardRef<HTMLDivElement, SidebarFooterProps>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('border-t border-white/10 p-4', className)}
      >
        {children}
      </div>
    );
  }
);

SidebarFooter.displayName = 'SidebarFooter';
