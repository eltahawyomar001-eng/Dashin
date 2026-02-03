# Performance Optimization Guide

## Overview

This guide covers performance optimization utilities and best practices for Dashin. These tools help you achieve optimal Core Web Vitals scores and deliver a fast, responsive user experience.

## Performance Utilities

### Code Splitting & Lazy Loading

#### `lazyLoad()`
Lazy load components with automatic Suspense boundary:

```tsx
import { lazyLoad } from '@/lib/performance';

// Lazy load a heavy component
const HeavyDashboard = lazyLoad(
  () => import('./components/HeavyDashboard'),
  <div>Loading dashboard...</div> // Optional custom fallback
);

function App() {
  return <HeavyDashboard />;
}
```

**When to use:**
- Large components not needed on initial render
- Route-based components
- Modal/dialog content
- Admin panels or infrequently accessed features

#### `preloadComponent()`
Prefetch components before they're needed:

```tsx
import { preloadComponent } from '@/lib/performance';

function Navigation() {
  return (
    <Link 
      href="/dashboard"
      onMouseEnter={() => preloadComponent(() => import('./Dashboard'))}
    >
      Dashboard
    </Link>
  );
}
```

### Debouncing & Throttling

#### `useDebounce()`
Delay execution until user stops typing (default 300ms):

```tsx
import { useDebounce } from '@/lib/performance';

function SearchInput() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    // Only runs 300ms after user stops typing
    fetchResults(debouncedSearch);
  }, [debouncedSearch]);

  return <input value={search} onChange={(e) => setSearch(e.target.value)} />;
}
```

**Use cases:**
- Search inputs
- Form validation
- Auto-save features
- API calls triggered by input

#### `useThrottle()`
Limit function execution rate (default 100ms):

```tsx
import { useThrottle } from '@/lib/performance';

function InfiniteScroll() {
  const handleScroll = useThrottle(() => {
    // Only runs once per 100ms max
    checkScrollPosition();
  }, 100);

  return <div onScroll={handleScroll}>...</div>;
}
```

**Use cases:**
- Scroll handlers
- Resize listeners
- Mouse move tracking
- Window events

### Memoization

#### `useMemoizedValue()`
Cache expensive computations:

```tsx
import { useMemoizedValue } from '@/lib/performance';

function ExpensiveList({ items, filter }) {
  const filteredItems = useMemoizedValue(
    () => items.filter(filter).sort(),
    [items, filter]
  );

  return <List items={filteredItems} />;
}
```

#### `useMemoizedCallback()`
Cache callback functions:

```tsx
import { useMemoizedCallback } from '@/lib/performance';

function Form({ onSubmit }) {
  const handleSubmit = useMemoizedCallback(
    (data) => {
      validateData(data);
      onSubmit(data);
    },
    [onSubmit]
  );

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Intersection Observer

#### `useIntersectionObserver()`
Detect when elements enter viewport:

```tsx
import { useIntersectionObserver } from '@/lib/performance';

function LazySection() {
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.5,
    freezeOnceVisible: true,
  });

  return (
    <div ref={ref}>
      {isVisible && <HeavyComponent />}
    </div>
  );
}
```

**Options:**
- `threshold`: Percentage of element visible (0-1)
- `rootMargin`: Margin around viewport (e.g., "100px")
- `freezeOnceVisible`: Stop observing after first visibility

#### `useLazyImage()`
Lazy load images when they enter viewport:

```tsx
import { useLazyImage } from '@/lib/performance';

function ProductImage({ src, alt }) {
  const [ref, imageSrc] = useLazyImage(src);

  return (
    <img 
      ref={ref}
      src={imageSrc || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'}
      alt={alt}
    />
  );
}
```

### Route Prefetching

#### `usePrefetch()`
Prefetch routes on hover/focus:

```tsx
import { usePrefetch } from '@/lib/performance';

function Navigation() {
  const prefetch = usePrefetch();

  return (
    <Link 
      href="/dashboard"
      onMouseEnter={() => prefetch('/dashboard')}
      onFocus={() => prefetch('/dashboard')}
    >
      Dashboard
    </Link>
  );
}
```

### Virtual Scrolling

#### `VirtualScroll`
Efficiently render large lists:

```tsx
import { VirtualScroll } from '@/lib/performance';

function LargeList({ items }) {
  return (
    <VirtualScroll
      items={items}
      itemHeight={50}
      windowHeight={500}
      overscan={3}
      renderItem={(item, index) => (
        <div key={item.id}>{item.name}</div>
      )}
    />
  );
}
```

**Props:**
- `items`: Array of items to render
- `itemHeight`: Height of each item in pixels
- `windowHeight`: Visible window height
- `overscan`: Extra items to render above/below (buffer)

### Image Optimization

#### `OptimizedImage`
Image component with automatic lazy loading:

```tsx
import { OptimizedImage } from '@/lib/performance';

function Hero() {
  return (
    <OptimizedImage
      src="/hero.jpg"
      alt="Hero image"
      width={1200}
      height={600}
      priority // Load immediately
    />
  );
}

function Thumbnail() {
  return (
    <OptimizedImage
      src="/thumb.jpg"
      alt="Thumbnail"
      width={200}
      height={200}
      // Lazy loads by default
    />
  );
}
```

## Performance Monitoring

### Development Tools

#### `useRenderTime()`
Measure component render time:

```tsx
import { useRenderTime } from '@/lib/performance';

function ExpensiveComponent() {
  useRenderTime('ExpensiveComponent'); // Logs render time in dev mode

  return <div>...</div>;
}
```

#### `useSlowRenderDetection()`
Warn about slow renders (>16ms):

```tsx
import { useSlowRenderDetection } from '@/lib/performance';

function Component() {
  useSlowRenderDetection('Component', 16); // Warns if >16ms

  return <div>...</div>;
}
```

#### `logComponentSize()`
Log bundle size of lazy-loaded components:

```tsx
import { logComponentSize } from '@/lib/performance';

// In development
await logComponentSize('HeavyComponent', () => import('./HeavyComponent'));
// Logs: [Bundle] HeavyComponent loaded in 45.23ms
//       [Bundle] HeavyComponent estimated size: 125.45KB
```

### Web Vitals Monitoring

#### `useWebVitals()`
Track Core Web Vitals in production:

```tsx
import { useWebVitals } from '@/lib/performance';

function App() {
  useWebVitals((metric) => {
    console.log(`${metric.name}: ${metric.value}ms (${metric.rating})`);
    
    // Send to analytics
    analytics.track('web-vital', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
    });
  });

  return <YourApp />;
}
```

**Metrics tracked:**
- **LCP** (Largest Contentful Paint): Main content load time
  - Good: < 2.5s
  - Needs improvement: 2.5s - 4s
  - Poor: > 4s

- **FID** (First Input Delay): Interactivity responsiveness
  - Good: < 100ms
  - Needs improvement: 100ms - 300ms
  - Poor: > 300ms

- **CLS** (Cumulative Layout Shift): Visual stability
  - Good: < 0.1
  - Needs improvement: 0.1 - 0.25
  - Poor: > 0.25

## Higher-Order Components

### `withMemo()`
Memoize components to prevent unnecessary re-renders:

```tsx
import { withMemo } from '@/lib/performance';

const ExpensiveComponent = withMemo(
  function ExpensiveComponent({ data }) {
    return <div>{/* Expensive rendering */}</div>;
  },
  (prevProps, nextProps) => {
    // Custom comparison
    return prevProps.data.id === nextProps.data.id;
  }
);
```

## Best Practices

### 1. Code Splitting Strategy

**Do:**
- Split routes into separate chunks
- Lazy load modals, drawers, and dialogs
- Defer non-critical features (admin panels, settings)
- Use dynamic imports for large dependencies

**Don't:**
- Over-split small components (creates overhead)
- Lazy load components in critical render path
- Split frequently used utilities

### 2. Debouncing vs Throttling

**Use debouncing for:**
- Search inputs (wait for user to finish typing)
- Form validation (validate after user stops)
- Auto-save (save after pause in editing)

**Use throttling for:**
- Scroll handlers (limit rate of checking)
- Resize listeners (prevent excessive recalculations)
- Mouse tracking (sample position periodically)

### 3. Memoization Guidelines

**Memoize when:**
- Computation is expensive (>5ms)
- Component re-renders frequently
- Props/state rarely change
- Component is in hot render path

**Don't memoize when:**
- Computation is trivial (<1ms)
- Props change every render
- Component rarely re-renders
- Premature optimization

### 4. Image Optimization

**Best practices:**
- Use `priority` for above-the-fold images
- Lazy load below-the-fold images
- Provide width/height to prevent CLS
- Use appropriate formats (WebP, AVIF)
- Compress images before upload

### 5. Virtual Scrolling

**When to use:**
- Lists with >100 items
- Infinite scroll implementations
- Tables with many rows
- Chat message history

**Considerations:**
- Items must have fixed/known height
- Adds complexity to simple lists
- May affect SEO (not all items rendered)

## Performance Checklist

### Initial Load (LCP)
- [ ] Code split routes and heavy components
- [ ] Lazy load below-the-fold content
- [ ] Optimize and compress images
- [ ] Use priority for hero images
- [ ] Minimize initial JavaScript bundle

### Interactivity (FID)
- [ ] Debounce search and form inputs
- [ ] Throttle scroll and resize handlers
- [ ] Use Web Workers for heavy computations
- [ ] Defer non-critical JavaScript
- [ ] Avoid long tasks (>50ms)

### Visual Stability (CLS)
- [ ] Set width/height on images
- [ ] Reserve space for dynamic content
- [ ] Avoid inserting content above fold
- [ ] Use CSS aspect-ratio
- [ ] Load fonts properly (font-display)

### Runtime Performance
- [ ] Memoize expensive computations
- [ ] Use virtual scrolling for long lists
- [ ] Implement intersection observer for lazy loading
- [ ] Monitor slow renders in development
- [ ] Profile with React DevTools

### Monitoring
- [ ] Track Web Vitals in production
- [ ] Set up performance budgets
- [ ] Monitor bundle sizes
- [ ] Use Lighthouse CI
- [ ] Alert on performance regressions

## Next.js Specific

### App Router Optimization

```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react';
import { lazyLoad } from '@/lib/performance';

const HeavyChart = lazyLoad(() => import('@/components/HeavyChart'));

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      {/* Critical content loads immediately */}
      <QuickStats />
      
      {/* Heavy chart lazy loads */}
      <HeavyChart />
    </div>
  );
}
```

### Server Components

```tsx
// app/campaigns/page.tsx
import { Suspense } from 'react';
import { CampaignList } from './CampaignList'; // Server Component
import { CampaignFilters } from './CampaignFilters'; // Client Component

export default function Campaigns() {
  return (
    <div>
      {/* Server component - no JS sent to client */}
      <Suspense fallback={<div>Loading...</div>}>
        <CampaignList />
      </Suspense>
      
      {/* Client component - interactive */}
      <CampaignFilters />
    </div>
  );
}
```

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
