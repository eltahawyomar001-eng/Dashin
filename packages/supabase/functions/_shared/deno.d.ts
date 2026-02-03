// Type declarations for Deno runtime
// This file provides type stubs for VS Code IntelliSense
// Actual Deno types are provided by the Deno runtime

declare namespace Deno {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
  
  export const env: {
    get(key: string): string | undefined;
  };
}

// Module declaration for ESM Supabase import
declare module 'https://esm.sh/@supabase/supabase-js@2' {
  export * from '@supabase/supabase-js';
}

