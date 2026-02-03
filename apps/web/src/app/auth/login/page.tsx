'use client';

import { useState } from 'react';
import { useAuth } from '@dashin/auth';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@dashin/ui';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Starting login...', { email });
      const { error: signInError } = await signIn(email, password);

      if (signInError) {
        console.error('Login error:', signInError);
        setError(signInError.message || 'Failed to sign in');
        setLoading(false);
      } else {
        console.log('Login successful, redirecting...');
        // Force a hard navigation to ensure middleware runs
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
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
                autoComplete="email"
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
                required
                autoComplete="current-password"
              />

              <div className="flex items-center justify-between text-sm">
                <Link
                  href="/auth/forgot-password"
                  className="text-primary-400 hover:text-primary-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
                Sign In
              </Button>

              <div className="text-center text-sm text-slate-400">
                Don&apos;t have an account?{' '}
                <Link href="/auth/signup" className="text-primary-400 hover:text-primary-300 transition-colors font-medium">
                  Sign up for free
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
