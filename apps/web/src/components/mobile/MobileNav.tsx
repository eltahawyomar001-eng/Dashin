/**
 * Mobile Navigation Components
 * Mobile-optimized navigation with hamburger menu and bottom nav
 */

'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@dashin/ui';
import { AnimatedBackdrop, SlideFromLeft, FadeIn } from '@/components/animations';
import {
  Menu,
  X,
  Home,
  Target,
  Users,
  BarChart3,
  Settings,
} from 'lucide-react';

// Mobile hamburger menu
interface MobileMenuProps {
  children?: ReactNode;
}

export function MobileMenu({ children }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2 hover:bg-accent rounded-md transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <>
          <AnimatedBackdrop onClick={() => setIsOpen(false)}>
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
          </AnimatedBackdrop>
          <SlideFromLeft className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-card border-r shadow-lg overflow-y-auto">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Menu</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-accent rounded-md transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {children}
              </div>
            </div>
          </SlideFromLeft>
        </>
      )}
    </>
  );
}

// Mobile menu item
interface MobileMenuItemProps {
  href: string;
  icon: ReactNode;
  label: string;
  badge?: number;
  onClick?: () => void;
}

export function MobileMenuItem({ href, icon, label, badge, onClick }: MobileMenuItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');

  const handleClick = () => {
    if (onClick) onClick();
    // Navigation handled by Link component
  };

  return (
    <Link
      href={href as any}
      onClick={handleClick}
      className={`flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors ${
        isActive ? 'bg-accent/50 text-primary font-medium' : ''
      }`}
    >
      <div className={isActive ? 'text-primary' : 'text-muted-foreground'}>
        {icon}
      </div>
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}

// Mobile menu section
interface MobileMenuSectionProps {
  title?: string;
  children: ReactNode;
}

export function MobileMenuSection({ title, children }: MobileMenuSectionProps) {
  return (
    <div className="py-2">
      {title && (
        <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}

// Bottom navigation bar (mobile)
interface BottomNavItem {
  href: string;
  icon: ReactNode;
  label: string;
}

interface BottomNavProps {
  items?: BottomNavItem[];
}

export function BottomNav({ items: customItems }: BottomNavProps) {
  const pathname = usePathname();

  const defaultItems: BottomNavItem[] = [
    { href: '/dashboard', icon: <Home className="h-5 w-5" />, label: 'Home' },
    { href: '/dashboard/campaigns', icon: <Target className="h-5 w-5" />, label: 'Campaigns' },
    { href: '/dashboard/leads', icon: <Users className="h-5 w-5" />, label: 'Leads' },
    { href: '/dashboard/analytics', icon: <BarChart3 className="h-5 w-5" />, label: 'Analytics' },
    { href: '/dashboard/settings', icon: <Settings className="h-5 w-5" />, label: 'Settings' },
  ];

  const items = customItems || defaultItems;

  return (
    <FadeIn>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t shadow-lg safe-bottom">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.href}
                href={item.href as any}
                className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all ${
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:bg-accent'
                }`}
              >
                <div className={isActive ? 'scale-110' : ''}>{item.icon}</div>
                <span className="text-xs font-medium truncate max-w-full">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </FadeIn>
  );
}

// Mobile action sheet / bottom sheet
interface MobileActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function MobileActionSheet({ isOpen, onClose, title, children }: MobileActionSheetProps) {
  if (!isOpen) return null;

  return (
    <>
      <AnimatedBackdrop onClick={onClose}>
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
      </AnimatedBackdrop>
      <div className="fixed inset-x-0 bottom-0 z-50 lg:hidden">
        <FadeIn className="bg-card border-t rounded-t-2xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
          {/* Handle bar */}
          <div className="flex justify-center py-2">
            <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-3 border-b">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-md transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {children}
          </div>
        </FadeIn>
      </div>
    </>
  );
}

// Mobile action button (floating action button)
interface MobileFABProps {
  onClick: () => void;
  icon: ReactNode;
  label?: string;
  position?: 'bottom-right' | 'bottom-left';
}

export function MobileFAB({ onClick, icon, label, position = 'bottom-right' }: MobileFABProps) {
  const positionClasses = {
    'bottom-right': 'bottom-20 right-4',
    'bottom-left': 'bottom-20 left-4',
  };

  return (
    <button
      onClick={onClick}
      className={`lg:hidden fixed ${positionClasses[position]} z-30 flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all`}
      aria-label={label}
    >
      {icon}
      {label && <span className="font-medium">{label}</span>}
    </button>
  );
}

// Touch-optimized button (44px minimum)
interface TouchButtonProps {
  onClick?: () => void;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  disabled?: boolean;
}

export function TouchButton({
  onClick,
  children,
  variant = 'primary',
  className = '',
  disabled = false,
}: TouchButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`min-h-[44px] min-w-[44px] touch-manipulation ${className}`}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <Button variant={variant} disabled={disabled} className="w-full h-full">
        {children}
      </Button>
    </button>
  );
}

// Safe area spacer for notched devices
export function SafeAreaSpacer({ position = 'bottom' }: { position?: 'top' | 'bottom' }) {
  const className = position === 'bottom' ? 'pb-safe' : 'pt-safe';
  
  return <div className={className} />;
}
