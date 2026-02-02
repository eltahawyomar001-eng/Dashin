import React from 'react';
import { cn } from '../lib/utils';

export interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const MainLayout = React.forwardRef<HTMLDivElement, MainLayoutProps>(
  ({ children, className }, ref) => {
    return (
      <div ref={ref} className={cn('min-h-screen', className)}>
        {children}
      </div>
    );
  }
);

MainLayout.displayName = 'MainLayout';

export interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

export const MainContent = React.forwardRef<HTMLElement, MainContentProps>(
  ({ children, className }, ref) => {
    return (
      <main
        ref={ref}
        className={cn(
          'ml-64 mt-16', // Account for sidebar and topbar
          'min-h-[calc(100vh-4rem)]',
          'p-6',
          'transition-all duration-300',
          className
        )}
      >
        {children}
      </main>
    );
  }
);

MainContent.displayName = 'MainContent';

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ title, description, actions, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('mb-8 flex items-start justify-between', className)}
      >
        <div>
          <h1 className="text-gradient mb-2 text-3xl font-bold">{title}</h1>
          {description && (
            <p className="text-slate-400">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    );
  }
);

PageHeader.displayName = 'PageHeader';

export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, className, size = 'xl' }, ref) => {
    const sizes = {
      sm: 'max-w-2xl',
      md: 'max-w-4xl',
      lg: 'max-w-6xl',
      xl: 'max-w-7xl',
      full: 'max-w-full',
    };

    return (
      <div
        ref={ref}
        className={cn('mx-auto w-full', sizes[size], className)}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';
