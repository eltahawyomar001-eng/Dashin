import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@dashin/supabase';

// Define protected routes by role
const ROLE_ROUTES = {
  super_admin: ['/dashboard', '/admin', '/agencies', '/users', '/campaigns', '/leads', '/analytics', '/reports', '/sources'],
  agency_admin: ['/dashboard', '/campaigns', '/clients', '/leads', '/researchers', '/analytics', '/reports', '/sources'],
  researcher: ['/dashboard', '/campaigns', '/leads', '/scraping', '/cleanroom', '/time-logs', '/analytics', '/reports', '/sources'],
  client: ['/dashboard', '/campaigns', '/leads', '/analytics', '/reports'],
};

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/reset-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check authentication
  const supabase = createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Redirect to login if not authenticated
  if (!session) {
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Get user profile with role
  const { data: userData } = await supabase
    .from('users')
    .select('role, agency_id')
    .eq('id', session.user.id)
    .single();

  type UserRole = 'super_admin' | 'agency_admin' | 'researcher' | 'client';
  type UserData = { role: UserRole; agency_id: string | null };
  
  const user = userData as UserData | null;
  
  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Root path - redirect to dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Check role-based access
  const userRole = user.role;
  const allowedRoutes = ROLE_ROUTES[userRole] || [];

  const hasAccess = allowedRoutes.some((route) => pathname.startsWith(route));

  if (!hasAccess) {
    // Redirect to dashboard if accessing unauthorized route
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
