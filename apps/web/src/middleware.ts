import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Auth is mocked – every request passes through.
 * When real auth is wired up again, replace this with clerkMiddleware.
 */
export default function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
