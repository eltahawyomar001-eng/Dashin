/**
 * Click Feedback Components
 * Visual feedback for user interactions
 */

'use client';

import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy, Heart, ThumbsUp, Star, Bookmark } from 'lucide-react';

// Click ripple effect
interface ClickRippleProps {
  children: ReactNode;
  color?: string;
  className?: string;
}

export function ClickRipple({ children, color = 'primary', className = '' }: ClickRippleProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, id }]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  };

  return (
    <div className={`relative overflow-hidden ${className}`} onClick={handleClick}>
      {children}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className={`absolute rounded-full bg-${color}/30 pointer-events-none`}
            initial={{ width: 0, height: 0, x: ripple.x, y: ripple.y }}
            animate={{ width: 300, height: 300, x: ripple.x - 150, y: ripple.y - 150 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Click bounce effect
interface ClickBounceProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ClickBounce({ children, onClick, className = '' }: ClickBounceProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Click press effect
interface ClickPressProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ClickPress({ children, onClick, className = '' }: ClickPressProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.92, y: 2 }}
      transition={{ duration: 0.1 }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Success feedback with checkmark
interface SuccessFeedbackProps {
  show: boolean;
  message?: string;
  onComplete?: () => void;
}

export function SuccessFeedback({ show, message = 'Success!', onComplete }: SuccessFeedbackProps) {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg shadow-lg"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 500 }}
          >
            <Check className="h-5 w-5" />
          </motion.div>
          <span className="font-medium">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Copy to clipboard feedback
interface CopyButtonProps {
  text: string;
  children?: ReactNode;
  className?: string;
}

export function CopyButton({ text, children, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleCopy}
      className={`relative inline-flex items-center gap-2 ${className}`}
    >
      {children || (
        <>
          <Copy className="h-4 w-4" />
          <span>Copy</span>
        </>
      )}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap"
          >
            Copied!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// Like button with animation
interface LikeButtonProps {
  liked: boolean;
  onToggle: () => void;
  count?: number;
}

export function LikeButton({ liked, onToggle, count }: LikeButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onToggle}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-full hover:bg-accent transition-colors"
    >
      <motion.div
        animate={liked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Heart
          className={`h-5 w-5 ${liked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
        />
      </motion.div>
      {count !== undefined && (
        <span className={`text-sm font-medium ${liked ? 'text-red-500' : 'text-muted-foreground'}`}>
          {count}
        </span>
      )}
    </motion.button>
  );
}

// Upvote button with animation
interface UpvoteButtonProps {
  upvoted: boolean;
  onToggle: () => void;
  count?: number;
}

export function UpvoteButton({ upvoted, onToggle, count }: UpvoteButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onToggle}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-full hover:bg-accent transition-colors"
    >
      <motion.div
        animate={upvoted ? { y: [0, -4, 0] } : { y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ThumbsUp
          className={`h-5 w-5 ${upvoted ? 'fill-blue-500 text-blue-500' : 'text-muted-foreground'}`}
        />
      </motion.div>
      {count !== undefined && (
        <span className={`text-sm font-medium ${upvoted ? 'text-blue-500' : 'text-muted-foreground'}`}>
          {count}
        </span>
      )}
    </motion.button>
  );
}

// Star rating with animation
interface StarRatingProps {
  rating: number;
  maxRating?: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
}

export function StarRating({ rating, maxRating = 5, onRate, readonly = false }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="inline-flex gap-1">
      {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => {
        const filled = star <= (hoverRating || rating);
        return (
          <motion.button
            key={star}
            whileHover={!readonly ? { scale: 1.2 } : {}}
            whileTap={!readonly ? { scale: 0.9 } : {}}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            onClick={() => !readonly && onRate?.(star)}
            disabled={readonly}
            className={readonly ? 'cursor-default' : 'cursor-pointer'}
          >
            <Star
              className={`h-5 w-5 transition-colors ${
                filled ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
              }`}
            />
          </motion.button>
        );
      })}
    </div>
  );
}

// Bookmark button with animation
interface BookmarkButtonProps {
  bookmarked: boolean;
  onToggle: () => void;
}

export function BookmarkButton({ bookmarked, onToggle }: BookmarkButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onToggle}
      className="p-2 rounded-full hover:bg-accent transition-colors"
    >
      <motion.div
        animate={bookmarked ? { y: [0, -4, 0] } : { y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Bookmark
          className={`h-5 w-5 ${bookmarked ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
        />
      </motion.div>
    </motion.button>
  );
}

// Loading button with spinner
interface LoadingButtonProps {
  loading: boolean;
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function LoadingButton({
  loading,
  onClick,
  children,
  disabled,
  className = '',
}: LoadingButtonProps) {
  return (
    <motion.button
      whileTap={!loading && !disabled ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={loading || disabled}
      className={`relative inline-flex items-center justify-center gap-2 ${className}`}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="spinner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
            />
            <span>Loading...</span>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
