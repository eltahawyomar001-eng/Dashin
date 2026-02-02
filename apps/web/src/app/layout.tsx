import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@dashin/auth';
import { ToastProvider } from '@dashin/ui';
import './globals.css';

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen antialiased">
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
