/**
 * Performance Optimization Utilities
 * Provides tools for code splitting, lazy loading, memoization, and performance monitoring
 */

'use client';

import {
  lazy,
  Suspense,
  ComponentType,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  memo,
} from 'react';
import { AnimatedSpinner } from '@/components/animations';

// ============================================================================
// Code Splitting & Lazy Loading
// ============================================================================

/**
 * Lazy load component with Suspense wrapper
 * Automatically wraps lazy-loaded component with Suspense boundary
 * 
 * @example
 * const LazyDashboard = lazyLoad(() => import('./Dashboard'));
 * <LazyDashboard />
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: ReactNode
) {
  const LazyComponent = lazy(importFunc);
  
  return function LazyLoadedComponent(props: any) {
    return (
      <Suspense
        fallback={
          fallback || (
            <div className="flex items-center justify-center min-h-[200px]">
              <AnimatedSpinner size={48} />
            </div>
          )
        }
      >
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Preload a lazy component
 * Useful for prefetching components before navigation
 * 
 * @example
 * const LazyDashboard = lazy(() => import('./Dashboard'));
 * preloadComponent(() => import('./Dashboard'));
 */
export function preloadComponent<T>(importFunc: () => Promise<{ default: T }>) {
  importFunc();
}

// ============================================================================
// Debouncing & Throttling
// ============================================================================

/**
 * Debounce hook for user input
 * Delays execution until user stops typing
 * 
 * @example
 * const debouncedSearch = useDebounce(searchTerm, 300);
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttle hook for frequent events
 * Limits function execution rate (scroll, resize, etc.)
 * 
 * @example
 * const throttledScroll = useThrottle(handleScroll, 100);
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 100
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useMemo(
    () =>
      ((...args: any[]) => {
        if (!timeoutRef.current) {
          callbackRef.current(...args);
          timeoutRef.current = setTimeout(() => {
            timeoutRef.current = undefined;
          }, delay);
        }
      }) as T,
    [delay]
  );
}

// ============================================================================
// Memoization Helpers
// ============================================================================

/**
 * Memoize expensive computations
 * Wrapper around useMemo for better readability
 * 
 * @example
 * const sortedItems = useMemoizedValue(() => items.sort(), [items]);
 */
export function useMemoizedValue<T>(factory: () => T, deps: any[]): T {
  return useMemo(factory, deps);
}

/**
 * Memoize callback functions
 * Wrapper around useCallback for better readability
 * 
 * @example
 * const handleClick = useMemoizedCallback(() => {...}, []);
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: any[]
): T {
  return useCallback(callback, deps);
}

// ============================================================================
// Intersection Observer (Lazy Loading)
// ============================================================================

interface UseIntersectionObserverOptions {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

/**
 * Intersection Observer hook for viewport visibility
 * Useful for lazy loading content when it enters viewport
 * 
 * @example
 * const [ref, isVisible] = useIntersectionObserver({ threshold: 0.5 });
 */
export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): [React.RefCallback<Element>, boolean] {
  const { threshold = 0, root = null, rootMargin = '0px', freezeOnceVisible = false } = options;
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [node, setNode] = useState<Element | null>(null);

  useEffect(() => {
    if (!node) return;
    if (freezeOnceVisible && isIntersecting) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsIntersecting(entry.isIntersecting);
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [node, threshold, root, rootMargin, freezeOnceVisible, isIntersecting]);

  return [setNode, isIntersecting];
}

/**
 * Lazy load image when visible
 * 
 * @example
 * const [ref, imageSrc] = useLazyImage(originalSrc);
 * <img ref={ref} src={imageSrc} alt="..." />
 */
export function useLazyImage(src: string): [React.RefCallback<Element>, string] {
  const [ref, isVisible] = useIntersectionObserver({ freezeOnceVisible: true });
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    if (isVisible) {
      setImageSrc(src);
    }
  }, [isVisible, src]);

  return [ref, imageSrc];
}

// ============================================================================
// Route Prefetching
// ============================================================================

/**
 * Prefetch route on hover/focus
 * Preloads route data for faster navigation
 * 
 * @example
 * const prefetch = usePrefetch();
 * <Link href="/dashboard" onMouseEnter={() => prefetch('/dashboard')}>
 */
export function usePrefetch() {
  return useCallback((href: string) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }, []);
}

// ============================================================================
// Performance Monitoring (Dev Only)
// ============================================================================

/**
 * Measure component render time
 * Only runs in development mode
 * 
 * @example
 * useRenderTime('MyComponent');
 */
export function useRenderTime(componentName: string) {
  const renderStartTime = useRef(performance.now());

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const renderTime = performance.now() - renderStartTime.current;
      console.log(`[Performance] ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
    }
  });

  useEffect(() => {
    renderStartTime.current = performance.now();
  });
}

/**
 * Detect slow renders (> 16ms)
 * Warns in console when component takes too long
 * 
 * @example
 * useSlowRenderDetection('ExpensiveComponent', 16);
 */
export function useSlowRenderDetection(componentName: string, threshold: number = 16) {
  const renderStartTime = useRef(performance.now());

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const renderTime = performance.now() - renderStartTime.current;
      if (renderTime > threshold) {
        console.warn(
          `[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render (threshold: ${threshold}ms)`
        );
      }
    }
  });

  useEffect(() => {
    renderStartTime.current = performance.now();
  });
}

// ============================================================================
// Higher-Order Components
// ============================================================================

/**
 * Memoize component with React.memo
 * Prevents re-renders when props haven't changed
 * 
 * @example
 * const MemoizedComponent = withMemo(ExpensiveComponent);
 */
export function withMemo<P extends object>(
  Component: ComponentType<P>,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean
) {
  return memo(Component, propsAreEqual);
}

// ============================================================================
// Virtual Scrolling
// ============================================================================

interface VirtualScrollProps {
  items: any[];
  itemHeight: number;
  windowHeight: number;
  renderItem: (item: any, index: number) => ReactNode;
  overscan?: number;
}

/**
 * Virtual scroll component for large lists
 * Only renders visible items for performance
 * 
 * @example
 * <VirtualScroll
 *   items={largeArray}
 *   itemHeight={50}
 *   windowHeight={500}
 *   renderItem={(item) => <div>{item.name}</div>}
 * />
 */
export function VirtualScroll({
  items,
  itemHeight,
  windowHeight,
  renderItem,
  overscan = 3,
}: VirtualScrollProps) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + windowHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return (
    <div
      style={{ height: windowHeight, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Image Optimization
// ============================================================================

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

/**
 * Optimized image component with lazy loading
 * Automatically lazy loads non-priority images
 * 
 * @example
 * <OptimizedImage src="/hero.jpg" alt="Hero" priority />
 * <OptimizedImage src="/thumbnail.jpg" alt="Thumbnail" />
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
}: OptimizedImageProps) {
  const [ref, imageSrc] = useLazyImage(priority ? src : '');
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div ref={ref} className={className}>
      {(priority || imageSrc) && (
        <img
          src={priority ? src : imageSrc}
          alt={alt}
          width={width}
          height={height}
          onLoad={() => setIsLoaded(true)}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
        />
      )}
      {!isLoaded && (
        <div
          className="animate-pulse bg-gray-200"
          style={{
            width: width || '100%',
            height: height || 'auto',
            aspectRatio: width && height ? `${width}/${height}` : undefined,
          }}
        />
      )}
    </div>
  );
}

// ============================================================================
// Bundle Analysis Helper
// ============================================================================

/**
 * Log component bundle size (dev only)
 * Helps identify large components for optimization
 * 
 * @example
 * logComponentSize('HeavyComponent', import('./HeavyComponent'));
 */
export async function logComponentSize(
  name: string,
  importFunc: () => Promise<any>
) {
  if (process.env.NODE_ENV === 'development') {
    const startTime = performance.now();
    const loadedModule = await importFunc();
    const loadTime = performance.now() - startTime;
    
    console.log(`[Bundle] ${name} loaded in ${loadTime.toFixed(2)}ms`);
    
    // Estimate size (rough approximation)
    const moduleString = JSON.stringify(loadedModule);
    const estimatedSize = new Blob([moduleString]).size;
    console.log(`[Bundle] ${name} estimated size: ${(estimatedSize / 1024).toFixed(2)}KB`);
  }
}

// ============================================================================
// Web Vitals Monitoring
// ============================================================================

interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

/**
 * Track Core Web Vitals
 * Monitors LCP, FID, CLS for performance insights
 * 
 * @example
 * useWebVitals((metric) => {
 *   console.log(metric.name, metric.value, metric.rating);
 * });
 */
export function useWebVitals(onMetric?: (metric: WebVitalsMetric) => void) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      const value = lastEntry.renderTime || lastEntry.loadTime;
      const rating = value < 2500 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor';
      
      onMetric?.({ name: 'LCP', value, rating });
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // FID (First Input Delay)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries() as any[];
      entries.forEach((entry) => {
        const value = entry.processingStart - entry.startTime;
        const rating = value < 100 ? 'good' : value < 300 ? 'needs-improvement' : 'poor';
        
        onMetric?.({ name: 'FID', value, rating });
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // CLS (Cumulative Layout Shift)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries() as any[];
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          const rating = clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor';
          
          onMetric?.({ name: 'CLS', value: clsValue, rating });
        }
      });
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

    return () => {
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  }, [onMetric]);
}
