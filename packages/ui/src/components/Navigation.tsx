'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../lib/utils';

export interface NavLinkProps {
  href: string;
  icon?: React.ReactNode;
  label: string;
  badge?: string | number;
  className?: string;
  onClick?: () => void;
}

export function NavLink({ href, icon, label, badge, className, onClick }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <Link
      href={href as any}
      onClick={onClick}
      className={cn(
        'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
        isActive
          ? 'glass-strong text-white shadow-glass'
          : 'text-slate-400 hover:bg-white/5 hover:text-white',
        className
      )}
    >
      {icon && (
        <span
          className={cn(
            'flex-shrink-0 transition-colors',
            isActive ? 'text-primary-400' : 'text-slate-500 group-hover:text-slate-300'
          )}
        >
          {icon}
        </span>
      )}
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && (
        <span
          className={cn(
            'flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs font-semibold',
            isActive
              ? 'bg-primary-500/20 text-primary-300'
              : 'bg-slate-700/50 text-slate-400 group-hover:bg-slate-600/50'
          )}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

export interface NavSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function NavSection({ title, children, className }: NavSectionProps) {
  return (
    <div className={cn('space-y-1', className)}>
      {title && (
        <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

export interface NavDividerProps {
  className?: string;
}

export function NavDivider({ className }: NavDividerProps) {
  return <div className={cn('my-4 h-px bg-white/10', className)} />;
}
