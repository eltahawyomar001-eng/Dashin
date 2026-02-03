/**
 * Keyboard Navigation Utilities
 * Enhanced keyboard interaction components and utilities
 */

'use client';

import { ReactNode, useRef, useState, useEffect } from 'react';

// Roving tabindex for lists (only one item tabbable at a time)
export function useRovingTabIndex(itemCount: number) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        newIndex = (currentIndex + 1) % itemCount;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = (currentIndex - 1 + itemCount) % itemCount;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = itemCount - 1;
        break;
      default:
        return;
    }

    setActiveIndex(newIndex);
  };

  return {
    activeIndex,
    setActiveIndex,
    getItemProps: (index: number) => ({
      tabIndex: index === activeIndex ? 0 : -1,
      onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, index),
    }),
  };
}

// Keyboard-accessible dropdown/select
interface KeyboardSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
}

export function KeyboardSelect({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select an option',
}: KeyboardSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % options.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + options.length) % options.length);
        break;
      case 'Home':
        e.preventDefault();
        setHighlightedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setHighlightedIndex(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          onChange(options[highlightedIndex]!.value);
          setIsOpen(false);
          buttonRef.current?.focus();
        }
        break;
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen]);

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full px-4 py-2 text-left border rounded-lg bg-background hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {selectedOption?.label || placeholder}
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          role="listbox"
          aria-label={label}
          className="absolute z-10 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              className={`px-4 py-2 cursor-pointer ${
                index === highlightedIndex
                  ? 'bg-primary text-primary-foreground'
                  : option.value === value
                  ? 'bg-accent'
                  : 'hover:bg-accent'
              }`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
                buttonRef.current?.focus();
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Keyboard-accessible menu
interface MenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

interface KeyboardMenuProps {
  trigger: ReactNode;
  items: MenuItem[];
  label: string;
}

export function KeyboardMenu({ trigger, items, label }: KeyboardMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    const enabledItems = items.filter((item) => !item.disabled);

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % enabledItems.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + enabledItems.length) % enabledItems.length);
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(enabledItems.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        enabledItems[activeIndex]?.onClick();
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={label}
        className="focus:outline-none focus:ring-2 focus:ring-primary rounded"
      >
        {trigger}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={label}
          className="absolute right-0 mt-2 w-56 bg-background border rounded-lg shadow-lg z-10"
        >
          {items.map((item, index) => (
            <button
              key={item.id}
              role="menuitem"
              disabled={item.disabled}
              tabIndex={index === activeIndex ? 0 : -1}
              onClick={() => {
                if (!item.disabled) {
                  item.onClick();
                  setIsOpen(false);
                  buttonRef.current?.focus();
                }
              }}
              className={`w-full flex items-center gap-2 px-4 py-2 text-left transition-colors ${
                item.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : index === activeIndex
                  ? 'bg-accent'
                  : 'hover:bg-accent'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Keyboard shortcut handler
interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  callback: () => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey : !e.ctrlKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;
        const metaMatch = shortcut.meta ? e.metaKey : !e.metaKey;

        if (
          e.key.toLowerCase() === shortcut.key.toLowerCase() &&
          ctrlMatch &&
          shiftMatch &&
          altMatch &&
          metaMatch
        ) {
          e.preventDefault();
          shortcut.callback();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// Keyboard navigation for grid/table
export function useGridNavigation(rows: number, cols: number) {
  const [activeCell, setActiveCell] = useState({ row: 0, col: 0 });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const { row, col } = activeCell;
    let newRow = row;
    let newCol = col;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        newRow = Math.max(0, row - 1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        newRow = Math.min(rows - 1, row + 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newCol = Math.max(0, col - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        newCol = Math.min(cols - 1, col + 1);
        break;
      case 'Home':
        e.preventDefault();
        newCol = 0;
        if (e.ctrlKey) newRow = 0;
        break;
      case 'End':
        e.preventDefault();
        newCol = cols - 1;
        if (e.ctrlKey) newRow = rows - 1;
        break;
      default:
        return;
    }

    setActiveCell({ row: newRow, col: newCol });
  };

  return {
    activeCell,
    setActiveCell,
    getCellProps: (row: number, col: number) => ({
      tabIndex: row === activeCell.row && col === activeCell.col ? 0 : -1,
      onKeyDown: handleKeyDown,
    }),
  };
}
