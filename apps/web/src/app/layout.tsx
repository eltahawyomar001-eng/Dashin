import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ToastProvider } from '@dashin/ui';
import { QueryProvider } from '../providers/QueryProvider';
import './globals.css';

// Force all pages to be server-rendered at request time.
// ClerkProvider requires NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY which is only
// available at runtime on Vercel, not during the static-generation build step.
export const dynamic = 'force-dynamic';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Dashin Research',
    template: '%s | Dashin Research',
  },
  description: 'B2B SaaS platform for lead research and qualification',
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.svg', sizes: '32x32', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#6366f1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      signInUrl="/auth/login/sign-in"
      signUpUrl="/auth/signup/sign-up"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <html lang="en" className={inter.variable}>
        <body className="min-h-screen antialiased">
          <QueryProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
