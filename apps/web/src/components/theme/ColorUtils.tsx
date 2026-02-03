/**
 * Dark Mode Color Utilities
 * Theme-aware colors and contrast helpers
 */

'use client';

// Color contrast utilities
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (hex: string) => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * (rs ?? 0) + 0.7152 * (gs ?? 0) + 0.0722 * (bs ?? 0);
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);

  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// Check if color meets WCAG AA contrast requirements
export function meetsWCAG_AA(foreground: string, background: string): boolean {
  const ratio = getContrastRatio(foreground, background);
  return ratio >= 4.5; // 4.5:1 for normal text
}

// Dark mode color palette
export const darkModeColors = {
  // Backgrounds
  background: {
    primary: '#0a0a0a',
    secondary: '#1a1a1a',
    tertiary: '#2a2a2a',
  },
  // Surfaces
  surface: {
    default: '#1a1a1a',
    elevated: '#2a2a2a',
    overlay: '#3a3a3a',
  },
  // Borders
  border: {
    default: '#333333',
    subtle: '#2a2a2a',
    strong: '#444444',
  },
  // Text
  text: {
    primary: '#ffffff',
    secondary: '#b3b3b3',
    tertiary: '#808080',
    inverse: '#0a0a0a',
  },
  // Semantic colors
  semantic: {
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
};

// Light mode color palette
export const lightModeColors = {
  // Backgrounds
  background: {
    primary: '#ffffff',
    secondary: '#f5f5f5',
    tertiary: '#e5e5e5',
  },
  // Surfaces
  surface: {
    default: '#ffffff',
    elevated: '#f9f9f9',
    overlay: '#f5f5f5',
  },
  // Borders
  border: {
    default: '#e5e5e5',
    subtle: '#f0f0f0',
    strong: '#d4d4d4',
  },
  // Text
  text: {
    primary: '#0a0a0a',
    secondary: '#525252',
    tertiary: '#a3a3a3',
    inverse: '#ffffff',
  },
  // Semantic colors
  semantic: {
    success: '#16a34a',
    error: '#dc2626',
    warning: '#ea580c',
    info: '#2563eb',
  },
};

// Get theme-aware shadow
export function getThemeShadow(isDark: boolean, size: 'sm' | 'md' | 'lg' = 'md'): string {
  const shadows = {
    light: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    dark: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.7), 0 4px 6px -2px rgba(0, 0, 0, 0.5)',
    },
  };

  return isDark ? shadows.dark[size] : shadows.light[size];
}

// Get theme-aware glow effect
export function getThemeGlow(color: string, isDark: boolean): string {
  const opacity = isDark ? '0.4' : '0.2';
  return `0 0 20px rgba(${hexToRgb(color)}, ${opacity})`;
}

// Convert hex to RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';

  return `${parseInt(result[1]!, 16)}, ${parseInt(result[2]!, 16)}, ${parseInt(result[3]!, 16)}`;
}

// Theme-aware gradient
export function getThemeGradient(isDark: boolean): string {
  if (isDark) {
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }
  return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
}

// Adjust color brightness
export function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.slice(1), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;

  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

// Get readable text color for background
export function getReadableTextColor(backgroundColor: string): string {
  const rgb = parseInt(backgroundColor.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;

  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

  return luminance > 128 ? '#000000' : '#ffffff';
}

// Dark mode-aware border color
export function getBorderColor(isDark: boolean, emphasis: 'subtle' | 'default' | 'strong' = 'default'): string {
  if (isDark) {
    return {
      subtle: darkModeColors.border.subtle,
      default: darkModeColors.border.default,
      strong: darkModeColors.border.strong,
    }[emphasis];
  }

  return {
    subtle: lightModeColors.border.subtle,
    default: lightModeColors.border.default,
    strong: lightModeColors.border.strong,
  }[emphasis];
}

// Theme-aware surface elevation
export function getSurfaceColor(isDark: boolean, elevation: 'default' | 'elevated' | 'overlay' = 'default'): string {
  if (isDark) {
    return {
      default: darkModeColors.surface.default,
      elevated: darkModeColors.surface.elevated,
      overlay: darkModeColors.surface.overlay,
    }[elevation];
  }

  return {
    default: lightModeColors.surface.default,
    elevated: lightModeColors.surface.elevated,
    overlay: lightModeColors.surface.overlay,
  }[elevation];
}
