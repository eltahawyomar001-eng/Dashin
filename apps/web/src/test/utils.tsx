/**
 * Test Utilities
 * Reusable helpers for testing components and hooks
 */

import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ============================================================================
// Custom Render
// ============================================================================

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialQueryClient?: QueryClient;
}

/**
 * Custom render with providers
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    initialQueryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    }),
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={initialQueryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient: initialQueryClient,
  };
}

// ============================================================================
// Mock Factories
// ============================================================================

export const mockCampaign = {
  id: 'campaign-1',
  name: 'Test Campaign',
  status: 'active' as const,
  budget: 5000,
  spent: 2500,
  leads: 150,
  conversions: 45,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15'),
};

export const mockLead = {
  id: 'lead-1',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '(555) 123-4567',
  status: 'new' as const,
  score: 75,
  source: 'Facebook Ads',
  campaignId: 'campaign-1',
  createdAt: new Date('2024-01-10'),
};

export const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'admin' as const,
  createdAt: new Date('2024-01-01'),
};

export const mockSource = {
  id: 'source-1',
  name: 'Facebook Ads',
  type: 'paid' as const,
  status: 'active' as const,
  leads: 150,
  conversions: 45,
  cost: 2500,
};

// ============================================================================
// Mock Functions
// ============================================================================

export function createMockRouter(props: Partial<any> = {}) {
  return {
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    ...props,
  };
}

export function createMockSupabaseClient() {
  return {
    auth: {
      getSession: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  };
}

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Wait for async updates
 */
export const waitForAsync = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Create mock event
 */
export function createMockEvent<T = Element>(
  overrides: Partial<React.ChangeEvent<T>> = {}
): React.ChangeEvent<T> {
  return {
    target: {
      value: '',
      ...overrides.target,
    } as any,
    currentTarget: {} as T,
    ...overrides,
  } as React.ChangeEvent<T>;
}

/**
 * Mock localStorage
 */
export function mockLocalStorage() {
  const store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
  };
}

/**
 * Mock window.matchMedia
 */
export function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

/**
 * Mock IntersectionObserver
 */
export function mockIntersectionObserver() {
  const mockObserve = jest.fn();
  const mockUnobserve = jest.fn();
  const mockDisconnect = jest.fn();

  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
    takeRecords: jest.fn(() => []),
  })) as any;

  return { mockObserve, mockUnobserve, mockDisconnect };
}

/**
 * Mock fetch
 */
export function mockFetch(response: any, options: { ok?: boolean; status?: number } = {}) {
  const { ok = true, status = 200 } = options;

  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    json: async () => response,
    text: async () => JSON.stringify(response),
  });
}

/**
 * Trigger resize event
 */
export function triggerResize(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', { writable: true, value: width });
  Object.defineProperty(window, 'innerHeight', { writable: true, value: height });
  window.dispatchEvent(new Event('resize'));
}

// ============================================================================
// Assertion Helpers
// ============================================================================

/**
 * Check if element has ARIA attributes
 */
export function expectAccessible(element: HTMLElement) {
  expect(element).toHaveAttribute('role');
  expect(element).toHaveAttribute('aria-label');
}

/**
 * Check if element is keyboard navigable
 */
export function expectKeyboardNavigable(element: HTMLElement) {
  expect(element).toHaveAttribute('tabindex');
  expect(parseInt(element.getAttribute('tabindex') || '-1')).toBeGreaterThanOrEqual(0);
}

/**
 * Check if element has proper contrast
 */
export function expectProperContrast(element: HTMLElement) {
  const style = window.getComputedStyle(element);
  const color = style.color;
  const backgroundColor = style.backgroundColor;
  
  // Basic check - in real tests use actual contrast calculation
  expect(color).toBeTruthy();
  expect(backgroundColor).toBeTruthy();
  expect(color).not.toBe(backgroundColor);
}
