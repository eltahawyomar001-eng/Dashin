/**
 * Theme System
 * Export all theme management components and utilities
 */

// Theme Provider
export {
  ThemeProvider,
  useTheme,
  ThemeAware,
  useThemeColor,
  useThemeVar,
  getSystemTheme,
  isDarkMode,
} from './ThemeProvider';

export type { Theme } from './ThemeProvider';

// Theme Toggle Components
export {
  ThemeToggle,
  ThemeSelector,
  CompactThemeToggle,
  ThemeToggleWithLabel,
  ThemeDropdown,
} from './ThemeToggle';

// Color Utilities
export {
  getContrastRatio,
  meetsWCAG_AA,
  darkModeColors,
  lightModeColors,
  getThemeShadow,
  getThemeGlow,
  getThemeGradient,
  adjustBrightness,
  getReadableTextColor,
  getBorderColor,
  getSurfaceColor,
} from './ColorUtils';
