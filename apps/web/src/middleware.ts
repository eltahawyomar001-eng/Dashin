import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@dashin/supabase';

// Protected routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/admin', '/campaigns', '/leads', '/analytics', '/reports', '/sources', '/settings'];

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/reset-password', '/auth/callback'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create response first - this is required for cookie handling
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // Static files
  ) {
    return response;
  }

  // Create Supabase client for middleware
  const supabase = createMiddlewareClient(request, response);

  // Get session - this validates the session and refreshes if needed
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users from auth pages to dashboard
  if (isPublicRoute && user && !pathname.includes('/callback')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect authenticated users from home to dashboard
  if (pathname === '/' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
