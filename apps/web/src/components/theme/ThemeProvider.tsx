/**
 * Theme Management System
 * Dark mode toggle, persistence, and system preference detection
 */

'use client';

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Theme provider with system preference detection
interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'dashin-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Load theme from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as Theme | null;
    if (stored) {
      setThemeState(stored);
    }
  }, [storageKey]);

  // Resolve theme based on system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateResolvedTheme = () => {
      const isDark = theme === 'dark' || (theme === 'system' && mediaQuery.matches);
      setResolvedTheme(isDark ? 'dark' : 'light');

      // Update document class
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    updateResolvedTheme();

    // Listen for system preference changes
    const handler = () => updateResolvedTheme();
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(storageKey, newTheme);
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Use theme hook
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Theme-aware component wrapper
interface ThemeAwareProps {
  children: ReactNode;
  lightContent?: ReactNode;
  darkContent?: ReactNode;
}

export function ThemeAware({ children, lightContent, darkContent }: ThemeAwareProps) {
  const { resolvedTheme } = useTheme();

  if (lightContent && darkContent) {
    return <>{resolvedTheme === 'dark' ? darkContent : lightContent}</>;
  }

  return <>{children}</>;
}

// Get theme-aware color
export function useThemeColor(lightColor: string, darkColor: string): string {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === 'dark' ? darkColor : lightColor;
}

// Theme-aware CSS variable
export function useThemeVar(cssVar: string, fallback?: string): string {
  const [value, setValue] = useState(fallback || '');

  useEffect(() => {
    const updateValue = () => {
      const computed = getComputedStyle(document.documentElement)
        .getPropertyValue(cssVar)
        .trim();
      setValue(computed || fallback || '');
    };

    updateValue();

    // Update on theme change
    const observer = new MutationObserver(updateValue);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, [cssVar, fallback]);

  return value;
}

// Detect system theme preference
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Check if dark mode is active
export function isDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}
