/**
 * Reusable Animation Components
 * Pre-configured motion components for common use cases
 */

'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import {
  pageVariants,
  fadeVariants,
  slideVariants,
  scaleVariants,
  listContainerVariants,
  listItemVariants,
  modalVariants,
  backdropVariants,
  toastVariants,
} from '@/lib/animations';

// Page transition wrapper
interface PageTransitionProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
}

export function PageTransition({ children, ...props }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Fade in component
export function FadeIn({ children, ...props }: PageTransitionProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={fadeVariants}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Slide animations
export function SlideFromRight({ children, ...props }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={slideVariants.fromRight}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function SlideFromLeft({ children, ...props }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={slideVariants.fromLeft}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function SlideFromTop({ children, ...props }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={slideVariants.fromTop}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function SlideFromBottom({ children, ...props }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={slideVariants.fromBottom}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Scale animation
export function ScaleIn({ children, ...props }: PageTransitionProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={scaleVariants}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Staggered list container
interface StaggeredListProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  staggerDelay?: number;
}

export function StaggeredList({
  children,
  staggerDelay = 0.05,
  ...props
}: StaggeredListProps) {
  const customVariants = {
    ...listContainerVariants,
    visible: {
      ...listContainerVariants.visible,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={customVariants}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// List item for staggered lists
export function StaggeredItem({ children, ...props }: PageTransitionProps) {
  return (
    <motion.div variants={listItemVariants} {...props}>
      {children}
    </motion.div>
  );
}

// Modal animation wrapper
export function AnimatedModal({ children, ...props }: PageTransitionProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={modalVariants}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Backdrop for modals/dialogs
export function AnimatedBackdrop({ children, ...props }: PageTransitionProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={backdropVariants}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Toast notification
export function AnimatedToast({ children, ...props }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={toastVariants}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Animated card with hover effect
interface AnimatedCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  enableHover?: boolean;
}

export function AnimatedCard({
  children,
  enableHover = true,
  ...props
}: AnimatedCardProps) {
  if (!enableHover) {
    return <motion.div {...props}>{children}</motion.div>;
  }

  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      variants={{
        rest: { scale: 1 },
        hover: { scale: 1.02, transition: { duration: 0.2 } },
        tap: { scale: 0.98, transition: { duration: 0.1 } },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Animated button
interface AnimatedButtonProps extends HTMLMotionProps<'button'> {
  children: ReactNode;
}

export function AnimatedButton({ children, ...props }: AnimatedButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// Collapse/Expand wrapper
interface CollapseProps {
  isOpen: boolean;
  children: ReactNode;
  className?: string;
}

export function Collapse({ isOpen, children, className }: CollapseProps) {
  return (
    <motion.div
      initial={false}
      animate={isOpen ? 'expanded' : 'collapsed'}
      variants={{
        collapsed: { height: 0, opacity: 0 },
        expanded: { height: 'auto', opacity: 1 },
      }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={className}
      style={{ overflow: 'hidden' }}
    >
      {children}
    </motion.div>
  );
}

// Loading spinner
interface SpinnerProps {
  size?: number;
  className?: string;
}

export function AnimatedSpinner({ size = 24, className = '' }: SpinnerProps) {
  return (
    <motion.div
      className={className}
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        ease: 'linear',
        repeat: Infinity,
      }}
    >
      <svg
        className="text-current"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </motion.div>
  );
}

// Pulse animation (for loading indicators)
export function Pulse({ children, ...props }: PageTransitionProps) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 2,
        ease: 'easeInOut',
        repeat: Infinity,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Success checkmark animation
interface CheckmarkProps {
  size?: number;
  className?: string;
}

export function AnimatedCheckmark({ size = 24, className = '' }: CheckmarkProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial="hidden"
      animate="visible"
    >
      <motion.path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: {
            pathLength: 1,
            opacity: 1,
            transition: { duration: 0.5, ease: 'easeOut' },
          },
        }}
      />
    </motion.svg>
  );
}
