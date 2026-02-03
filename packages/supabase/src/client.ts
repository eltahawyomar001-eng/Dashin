import { createServerClient as createSSRServerClient, createBrowserClient as createSSRBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

type CookieMethods = {
  getAll: () => { name: string; value: string }[];
  setAll: (cookies: { name: string; value: string; options?: Record<string, unknown> }[]) => void;
};

// ============================================================================
// BROWSER CLIENT - For Client Components
// ============================================================================
export function createBrowserClient() {
  return createSSRBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Singleton for browser
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (typeof window === 'undefined') {
    throw new Error('getSupabaseBrowserClient must be called on the client side');
  }
  if (!browserClient) {
    browserClient = createBrowserClient();
  }
  return browserClient;
}

// ============================================================================
// SERVER CLIENT - For Server Components, Server Actions, Route Handlers
// Pass the result of cookies() from 'next/headers'
// ============================================================================
export function createServerClient(cookieStore: { 
  getAll: () => { name: string; value: string }[];
  set: (name: string, value: string, options?: Record<string, unknown>) => void;
}) {
  return createSSRServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from Server Component - cookies are read-only
        }
      },
    },
  });
}

// ============================================================================
// MIDDLEWARE CLIENT - For Next.js Middleware (Edge Runtime)
// Pass request and response from middleware function
// ============================================================================
export function createMiddlewareClient(
  request: { cookies: { getAll: () => { name: string; value: string }[]; set: (name: string, value: string) => void } },
  response: { cookies: { set: (name: string, value: string, options?: Record<string, unknown>) => void } }
) {
  return createSSRServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });
}
