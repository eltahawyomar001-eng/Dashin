import { createClient } from '@supabase/supabase-js';
import { createServerClient as createSSRServerClient } from '@supabase/ssr';
import type { Database } from './database.types';

// Validate environment variables
function validateEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('[Supabase] Environment check:', {
    hasUrl: !!url,
    hasAnonKey: !!anonKey,
    urlPrefix: url?.substring(0, 30)
  });

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  return { url, anonKey };
}

// Create Supabase client (browser)
export function createBrowserClient() {
  const { url, anonKey } = validateEnv();

  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'implicit',  // Changed from 'pkce' - simpler flow, fewer network round-trips
    },
  });
}

// Create Supabase client (server - for Server Components and Server Actions)
export function createServerClient() {
  const { url, anonKey } = validateEnv();

  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

// Create Supabase client for middleware (can read cookies from request)
export function createMiddlewareClient(request: Request) {
  const { url, anonKey } = validateEnv();
  
  return createSSRServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        // Parse cookies from request header
        const cookieHeader = request.headers.get('cookie') || '';
        const cookies: { name: string; value: string }[] = [];
        
        cookieHeader.split(';').forEach(cookie => {
          const [name, ...rest] = cookie.trim().split('=');
          if (name) {
            cookies.push({ name, value: rest.join('=') });
          }
        });
        
        return cookies;
      },
      setAll() {
        // Middleware doesn't set cookies, just reads them
      },
    },
  });
}

// Singleton instance for client-side
let browserClientInstance: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!browserClientInstance) {
    browserClientInstance = createBrowserClient();
  }
  return browserClientInstance;
}
