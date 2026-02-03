/**
 * Hover State Components
 * Interactive hover effects and visual feedback
 */

'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

// Hover scale effect
interface HoverScaleProps {
  children: ReactNode;
  scale?: number;
  className?: string;
}

export function HoverScale({ children, scale = 1.02, className = '' }: HoverScaleProps) {
  return (
    <motion.div
      whileHover={{ scale }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Hover lift effect (scale + shadow)
interface HoverLiftProps {
  children: ReactNode;
  className?: string;
}

export function HoverLift({ children, className = '' }: HoverLiftProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Hover glow effect
interface HoverGlowProps {
  children: ReactNode;
  color?: string;
  className?: string;
}

export function HoverGlow({ children, color = 'primary', className = '' }: HoverGlowProps) {
  return (
    <motion.div
      whileHover={{ boxShadow: `0 0 20px var(--${color})` }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Hover underline effect
interface HoverUnderlineProps {
  children: ReactNode;
  className?: string;
}

export function HoverUnderline({ children, className = '' }: HoverUnderlineProps) {
  return (
    <span className={`relative inline-block ${className}`}>
      {children}
      <motion.span
        className="absolute bottom-0 left-0 h-0.5 bg-current"
        initial={{ width: 0 }}
        whileHover={{ width: '100%' }}
        transition={{ duration: 0.3 }}
      />
    </span>
  );
}

// Hover rotate effect
interface HoverRotateProps {
  children: ReactNode;
  degrees?: number;
  className?: string;
}

export function HoverRotate({ children, degrees = 5, className = '' }: HoverRotateProps) {
  return (
    <motion.div
      whileHover={{ rotate: degrees }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Hover shimmer effect
interface HoverShimmerProps {
  children: ReactNode;
  className?: string;
}

export function HoverShimmer({ children, className = '' }: HoverShimmerProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6 }}
      />
    </div>
  );
}

// Hover brightness effect
interface HoverBrightnessProps {
  children: ReactNode;
  className?: string;
}

export function HoverBrightness({ children, className = '' }: HoverBrightnessProps) {
  return (
    <motion.div
      whileHover={{ filter: 'brightness(1.1)' }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Hover border effect
interface HoverBorderProps {
  children: ReactNode;
  color?: string;
  className?: string;
}

export function HoverBorder({ children, color = 'primary', className = '' }: HoverBorderProps) {
  return (
    <motion.div
      whileHover={{ borderColor: `var(--${color})` }}
      transition={{ duration: 0.2 }}
      className={`border-2 border-transparent ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Interactive card with multiple hover effects
interface InteractiveCardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function InteractiveCard({ children, onClick, className = '' }: InteractiveCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      transition={{ duration: 0.2 }}
      className={`cursor-pointer rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Hover tooltip
interface HoverTooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function HoverTooltip({ content, children, position = 'top' }: HoverTooltipProps) {
  const positions = {
    top: '-top-10 left-1/2 -translate-x-1/2',
    bottom: '-bottom-10 left-1/2 -translate-x-1/2',
    left: 'top-1/2 -left-2 -translate-x-full -translate-y-1/2',
    right: 'top-1/2 -right-2 translate-x-full -translate-y-1/2',
  };

  return (
    <div className="relative inline-block group">
      {children}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileHover={{ opacity: 1, scale: 1 }}
        className={`absolute z-50 px-2 py-1 text-xs bg-gray-900 text-white rounded shadow-lg whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity ${positions[position]}`}
      >
        {content}
      </motion.div>
    </div>
  );
}
