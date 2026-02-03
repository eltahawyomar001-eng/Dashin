/**
 * Touch Gesture Utilities
 * Hooks and components for handling touch interactions
 */

'use client';

import { useEffect, useRef, useState, RefObject } from 'react';

// Touch gesture types
export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface SwipeEvent {
  direction: SwipeDirection;
  distance: number;
  velocity: number;
}

export interface LongPressEvent {
  x: number;
  y: number;
}

// Swipe detection hook
interface UseSwipeOptions {
  onSwipe?: (event: SwipeEvent) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // Minimum distance for swipe (px)
  velocityThreshold?: number; // Minimum velocity (px/ms)
}

export function useSwipe(options: UseSwipeOptions = {}) {
  const {
    onSwipe,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    velocityThreshold = 0.3,
  } = options;

  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const touch = e.changedTouches[0];
    if (!touch || !touchStart.current) return;

    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    const deltaTime = Date.now() - touchStart.current.time;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Determine if this is a swipe
    if (absX < threshold && absY < threshold) return;

    // Calculate velocity
    const velocity = Math.max(absX, absY) / deltaTime;
    if (velocity < velocityThreshold) return;

    // Determine direction
    let direction: SwipeDirection;
    let distance: number;

    if (absX > absY) {
      // Horizontal swipe
      direction = deltaX > 0 ? 'right' : 'left';
      distance = absX;
    } else {
      // Vertical swipe
      direction = deltaY > 0 ? 'down' : 'up';
      distance = absY;
    }

    // Call callbacks
    const swipeEvent: SwipeEvent = { direction, distance, velocity };
    onSwipe?.(swipeEvent);

    if (direction === 'left') onSwipeLeft?.();
    else if (direction === 'right') onSwipeRight?.();
    else if (direction === 'up') onSwipeUp?.();
    else if (direction === 'down') onSwipeDown?.();

    touchStart.current = null;
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
}

// Long press detection hook
interface UseLongPressOptions {
  onLongPress?: (event: LongPressEvent) => void;
  delay?: number; // Delay before triggering (ms)
}

export function useLongPress(options: UseLongPressOptions = {}) {
  const { onLongPress, delay = 500 } = options;

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const positionRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    positionRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };

    timeoutRef.current = setTimeout(() => {
      if (positionRef.current && onLongPress) {
        onLongPress(positionRef.current);
      }
    }, delay);
  };

  const handleTouchEnd = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    positionRef.current = null;
  };

  const handleTouchMove = () => {
    // Cancel long press if finger moves
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchMove: handleTouchMove,
  };
}

// Pull to refresh hook
interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number; // Pull distance to trigger refresh (px)
  resistance?: number; // Pull resistance factor (0-1)
}

export function usePullToRefresh(options: UsePullToRefreshOptions) {
  const { onRefresh, threshold = 80, resistance = 0.5 } = options;

  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const touchStart = useRef<{ y: number; scrollTop: number } | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    const container = e.currentTarget as HTMLElement;
    if (container.scrollTop > 0) return; // Only allow at top

    const touch = e.touches[0];
    if (!touch) return;

    touchStart.current = {
      y: touch.clientY,
      scrollTop: container.scrollTop,
    };
    setIsPulling(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!touchStart.current || isRefreshing) return;

    const touch = e.touches[0];
    if (!touch) return;

    const deltaY = touch.clientY - touchStart.current.y;
    if (deltaY < 0) return; // Only pull down

    const distance = Math.min(deltaY * resistance, threshold * 1.5);
    setPullDistance(distance);

    // Prevent scroll if pulling
    if (distance > 10) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = async () => {
    if (!touchStart.current) return;

    setIsPulling(false);
    touchStart.current = null;

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  return {
    isPulling,
    pullDistance,
    isRefreshing,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}

// Pinch zoom hook
interface UsePinchZoomOptions {
  onZoom?: (scale: number) => void;
  minScale?: number;
  maxScale?: number;
}

export function usePinchZoom(options: UsePinchZoomOptions = {}) {
  const { onZoom, minScale = 1, maxScale = 3 } = options;

  const [scale, setScale] = useState(1);
  const initialDistance = useRef<number | null>(null);
  const initialScale = useRef(1);

  const getDistance = (touches: TouchList) => {
    const dx = touches[0]!.clientX - touches[1]!.clientX;
    const dy = touches[0]!.clientY - touches[1]!.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length !== 2) return;
    initialDistance.current = getDistance(e.touches);
    initialScale.current = scale;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length !== 2 || !initialDistance.current) return;

    const distance = getDistance(e.touches);
    const scaleFactor = distance / initialDistance.current;
    const newScale = Math.min(
      Math.max(initialScale.current * scaleFactor, minScale),
      maxScale
    );

    setScale(newScale);
    onZoom?.(newScale);
  };

  const handleTouchEnd = () => {
    initialDistance.current = null;
  };

  return {
    scale,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}

// Attach touch handlers to element
export function useTouchHandlers(
  elementRef: RefObject<HTMLElement>,
  handlers: Partial<{
    onTouchStart: (e: TouchEvent) => void;
    onTouchMove: (e: TouchEvent) => void;
    onTouchEnd: (e: TouchEvent) => void;
  }>
) {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const { onTouchStart, onTouchMove, onTouchEnd } = handlers;

    if (onTouchStart) element.addEventListener('touchstart', onTouchStart);
    if (onTouchMove) element.addEventListener('touchmove', onTouchMove, { passive: false });
    if (onTouchEnd) element.addEventListener('touchend', onTouchEnd);

    return () => {
      if (onTouchStart) element.removeEventListener('touchstart', onTouchStart);
      if (onTouchMove) element.removeEventListener('touchmove', onTouchMove);
      if (onTouchEnd) element.removeEventListener('touchend', onTouchEnd);
    };
  }, [elementRef, handlers]);
}

// Haptic feedback (if supported)
export function hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'medium') {
  if ('vibrate' in navigator) {
    const duration = type === 'light' ? 10 : type === 'medium' ? 20 : 50;
    navigator.vibrate(duration);
  }
}

// Prevent overscroll/bounce on iOS
export function usePreventOverscroll(elementRef: RefObject<HTMLElement>) {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      
      // Allow scrolling within scrollable containers
      let current: HTMLElement | null = target;
      while (current && current !== element) {
        if (current.scrollHeight > current.clientHeight) {
          return; // Allow scroll
        }
        current = current.parentElement;
      }

      // Prevent overscroll
      e.preventDefault();
    };

    element.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      element.removeEventListener('touchmove', handleTouchMove);
    };
  }, [elementRef]);
}
