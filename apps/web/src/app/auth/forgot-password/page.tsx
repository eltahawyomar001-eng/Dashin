'use client';

import { useState } from 'react';
import { useAuth } from '@dashin/auth';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@dashin/ui';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: resetError } = await resetPassword(email);

    if (resetError) {
      setError(resetError.message || 'Failed to send reset email');
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card variant="glass-strong">
            <CardContent className="py-12 text-center">
              <div className="mb-4 flex justify-center">
                <div className="glass-strong rounded-full p-4">
                  <CheckCircle className="h-8 w-8 text-primary-400" />
                </div>
              </div>
              <h2 className="mb-2 text-2xl font-semibold text-white">Check your email</h2>
              <p className="mb-6 text-slate-400">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <Link href="/auth/login">
                <Button variant="secondary" className="w-full">
                  Back to Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-gradient mb-2 text-4xl font-bold">Dashin Research</h1>
          <p className="text-slate-400">Reset your password</p>
        </div>

        <Card variant="glass-strong">
          <CardHeader>
            <CardTitle>Forgot Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="glass-subtle flex items-center gap-2 rounded-lg border border-red-500/20 p-3 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <p className="text-sm text-slate-400">
                Enter your email address and we'll send you a link to reset your password.
              </p>

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

              <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
                Send Reset Link
              </Button>

              <div className="text-center text-sm text-slate-400">
                Remember your password?{' '}
                <Link
                  href="/auth/login"
                  className="text-primary-400 hover:text-primary-300 transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
