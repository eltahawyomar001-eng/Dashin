'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@dashin/auth';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@dashin/ui';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const { signIn, loading: authLoading, session } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (session && !redirecting) {
      setRedirecting(true);
      const redirect = searchParams.get('redirect') || '/dashboard';
      // Use window.location for hard navigation to ensure cookies are sent
      window.location.href = redirect;
    }
  }, [session, searchParams, redirecting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError.message || 'Failed to sign in');
      setLoading(false);
    }
    // Don't manually redirect - the useEffect above will handle it when session updates
  };

  // Show loading while auth is initializing or redirecting
  if (authLoading || redirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-gradient mb-2 text-4xl font-bold">Dashin Research</h1>
          <p className="text-slate-400">Sign in to your account</p>
        </div>

        <Card variant="glass-strong">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="glass-subtle flex items-center gap-2 rounded-lg border border-red-500/20 p-3 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Input
                label="Email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4" />}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
                required
              />

              <div className="flex justify-end">
                <Link href="/auth/forgot-password" className="text-sm text-primary-400 hover:text-primary-300">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full" isLoading={loading} disabled={loading}>
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-400">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-primary-400 hover:text-primary-300">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
