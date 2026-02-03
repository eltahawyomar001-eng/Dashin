import { createClient } from '@supabase/supabase-js';
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
      flowType: 'pkce',
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

// Singleton instance for client-side
let browserClientInstance: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!browserClientInstance) {
    browserClientInstance = createBrowserClient();
  }
  return browserClientInstance;
}
