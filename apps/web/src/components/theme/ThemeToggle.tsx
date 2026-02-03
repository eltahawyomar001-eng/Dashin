/**
 * Theme Toggle Components
 * Animated theme switchers and controls
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, Theme } from './ThemeProvider';

// Animated theme toggle button
export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="relative p-2 rounded-lg hover:bg-accent transition-colors"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait">
        {resolvedTheme === 'dark' ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="h-5 w-5" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="h-5 w-5" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// Theme selector with all options
export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const options: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="inline-flex rounded-lg border bg-background p-1 gap-1">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = theme === option.value;

        return (
          <motion.button
            key={option.value}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTheme(option.value)}
            className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="theme-selector"
                className="absolute inset-0 bg-accent rounded-md"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {option.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

// Compact theme toggle (icon only)
export function CompactThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycle = () => {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]!);
  };

  const icons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  };

  const Icon = icons[theme];

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={cycle}
      className="p-2 rounded-lg hover:bg-accent transition-colors"
      aria-label="Cycle theme"
    >
      <motion.div
        key={theme}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <Icon className="h-5 w-5" />
      </motion.div>
    </motion.button>
  );
}

// Theme toggle with label
export function ThemeToggleWithLabel() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent transition-colors w-full"
    >
      <motion.div
        animate={{ rotate: resolvedTheme === 'dark' ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
      </motion.div>
      <div className="flex-1 text-left">
        <div className="text-sm font-medium">
          {resolvedTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}
        </div>
        <div className="text-xs text-muted-foreground">
          {resolvedTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        </div>
      </div>
      <motion.div
        className={`h-6 w-11 rounded-full p-0.5 ${
          resolvedTheme === 'dark' ? 'bg-primary' : 'bg-muted'
        }`}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="h-5 w-5 rounded-full bg-background shadow-sm"
          animate={{ x: resolvedTheme === 'dark' ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </motion.div>
    </button>
  );
}

// Dropdown theme selector
export function ThemeDropdown() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const options: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 rounded-lg border bg-background hover:bg-accent transition-colors flex items-center gap-2"
      >
        {theme === 'light' && <Sun className="h-4 w-4" />}
        {theme === 'dark' && <Moon className="h-4 w-4" />}
        {theme === 'system' && <Monitor className="h-4 w-4" />}
        <span className="text-sm font-medium capitalize">{theme}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 right-0 z-20 min-w-[160px] rounded-lg border bg-background shadow-lg overflow-hidden"
            >
              {options.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      setTheme(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-accent transition-colors ${
                      theme === option.value ? 'bg-accent' : ''
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Import useState
import { useState } from 'react';
