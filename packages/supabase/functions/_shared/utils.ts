/**
 * Shared utilities for Supabase Edge Functions
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ============================================================================
// TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export interface ResponseMeta {
  total?: number;
  page?: number;
  pageSize?: number;
  hasMore?: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// SUPABASE CLIENT
// ============================================================================

/**
 * Create authenticated Supabase client from request
 */
export function createAuthenticatedClient(req: Request): SupabaseClient {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader) {
    throw new Error('Missing authorization header');
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration');
  }

  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
    auth: {
      persistSession: false,
    },
  });
}

// ============================================================================
// RESPONSE HELPERS
// ============================================================================

/**
 * Create success response
 */
export function successResponse<T>(
  data: T,
  meta?: ResponseMeta,
  status: number = 200
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(meta && { meta }),
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    },
  });
}

/**
 * Create error response
 */
export function errorResponse(
  message: string,
  status: number = 400,
  code?: string,
  details?: any
): Response {
  const response: ApiResponse = {
    success: false,
    error: {
      message,
      code,
      status,
      details,
    },
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    },
  });
}

/**
 * Handle CORS preflight
 */
export function corsResponse(): Response {
  return new Response('ok', {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    },
  });
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

/**
 * Get current user from authenticated client
 */
export async function getCurrentUser(supabase: SupabaseClient) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Unauthorized');
  }

  return user;
}

/**
 * Get user profile with role and agency
 */
export async function getUserProfile(supabase: SupabaseClient) {
  const user = await getCurrentUser(supabase);

  const { data, error } = await supabase
    .from('users')
    .select('*, agency:agencies(id, name, status)')
    .eq('id', user.id)
    .single();

  if (error || !data) {
    throw new Error('User profile not found');
  }

  return data;
}

/**
 * Check if user has required role
 */
export async function requireRole(
  supabase: SupabaseClient,
  allowedRoles: string[]
): Promise<void> {
  const profile = await getUserProfile(supabase);

  if (!allowedRoles.includes(profile.role)) {
    throw new Error('Insufficient permissions');
  }
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
  body: any,
  requiredFields: string[]
): void {
  const missing = requiredFields.filter((field) => !body[field]);

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

/**
 * Parse and validate pagination params
 */
export function parsePaginationParams(url: URL): PaginationParams {
  const page = parseInt(url.searchParams.get('page') || '1');
  const pageSize = Math.min(
    parseInt(url.searchParams.get('pageSize') || '20'),
    100
  );
  const sortBy = url.searchParams.get('sortBy') || 'created_at';
  const sortOrder = (url.searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

  if (page < 1) {
    throw new Error('Page must be >= 1');
  }

  if (pageSize < 1 || pageSize > 100) {
    throw new Error('Page size must be between 1 and 100');
  }

  return {
    page,
    pageSize,
    sortBy,
    sortOrder,
  };
}

/**
 * Apply pagination to Supabase query
 */
export function applyPagination(
  query: any,
  params: PaginationParams
) {
  const from = ((params.page || 1) - 1) * (params.pageSize || 20);
  const to = from + (params.pageSize || 20) - 1;

  return query
    .order(params.sortBy || 'created_at', { ascending: params.sortOrder === 'asc' })
    .range(from, to);
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Main request handler with error handling
 */
export async function handleRequest(
  req: Request,
  handler: (req: Request, supabase: SupabaseClient) => Promise<Response>
): Promise<Response> {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return corsResponse();
  }

  try {
    // Create authenticated client
    const supabase = createAuthenticatedClient(req);

    // Call handler
    return await handler(req, supabase);
  } catch (error: any) {
    console.error('Request error:', error);

    // Map error to HTTP status
    let status = 500;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';

    if (error.message === 'Unauthorized' || error.message === 'Missing authorization header') {
      status = 401;
      message = 'Unauthorized';
      code = 'UNAUTHORIZED';
    } else if (error.message === 'Insufficient permissions') {
      status = 403;
      message = 'Forbidden';
      code = 'FORBIDDEN';
    } else if (error.message?.includes('Missing required fields')) {
      status = 400;
      message = error.message;
      code = 'VALIDATION_ERROR';
    } else if (error.message?.includes('not found')) {
      status = 404;
      message = error.message;
      code = 'NOT_FOUND';
    } else if (error.message) {
      message = error.message;
    }

    return errorResponse(message, status, code, error.details);
  }
}

// ============================================================================
// DATABASE HELPERS
// ============================================================================

/**
 * Get total count from Supabase query
 */
export async function getTotalCount(query: any): Promise<number> {
  const { count, error } = await query;

  if (error) {
    throw error;
  }

  return count || 0;
}

/**
 * Check if record exists
 */
export async function recordExists(
  supabase: SupabaseClient,
  table: string,
  id: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from(table)
    .select('id')
    .eq('id', id)
    .single();

  return !error && !!data;
}

/**
 * Get user's agency ID
 */
export async function getUserAgencyId(supabase: SupabaseClient): Promise<string> {
  const profile = await getUserProfile(supabase);

  if (!profile.agency_id) {
    throw new Error('User has no agency');
  }

  return profile.agency_id;
}
