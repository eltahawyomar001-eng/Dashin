/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          50: 'rgba(255, 255, 255, 0.05)',
          100: 'rgba(255, 255, 255, 0.10)',
          200: 'rgba(255, 255, 255, 0.15)',
          300: 'rgba(255, 255, 255, 0.20)',
        },
        dark: {
          50: 'rgba(0, 0, 0, 0.05)',
          100: 'rgba(0, 0, 0, 0.10)',
          200: 'rgba(0, 0, 0, 0.20)',
          300: 'rgba(0, 0, 0, 0.30)',
          400: 'rgba(0, 0, 0, 0.40)',
          500: 'rgba(0, 0, 0, 0.50)',
          600: 'rgba(0, 0, 0, 0.60)',
          700: 'rgba(0, 0, 0, 0.70)',
          800: 'rgba(0, 0, 0, 0.80)',
          900: 'rgba(0, 0, 0, 0.90)',
        },
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        accent: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
          950: '#4a044e',
        },
      },
      backdropBlur: {
        xs: '2px',
        '3xl': '64px',
        '4xl': '128px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-gradient':
          'radial-gradient(at 40% 20%, hsla(217, 100%, 50%, 0.3) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(262, 100%, 50%, 0.2) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(340, 100%, 50%, 0.2) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(217, 100%, 50%, 0.2) 0px, transparent 50%), radial-gradient(at 80% 100%, hsla(262, 100%, 50%, 0.2) 0px, transparent 50%)',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
        'glass-lg': '0 12px 48px 0 rgba(0, 0, 0, 0.2)',
        'glass-xl': '0 20px 64px 0 rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-out-right': 'slideOutRight 0.2s ease-in',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        shimmer: 'shimmer 2s linear infinite',
        shrink: 'shrink linear forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideOutRight: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        shrink: {
          '0%': { width: '100%' },
          '100%': { width: '0%' },
        },
      },
    },
  },
  plugins: [],
};
