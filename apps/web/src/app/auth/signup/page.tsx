'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@dashin/ui';
import { createBrowserClient } from '@dashin/supabase';
import { useAuth } from '@dashin/auth';
import { Mail, Lock, User, Building2, AlertCircle, CheckCircle } from 'lucide-react';

export default function SignUpPage() {
  const { session, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const redirectingRef = useRef(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    companyName: '',
  });

  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (session && !redirectingRef.current) {
      redirectingRef.current = true;
      window.location.href = '/dashboard';
    }
  }, [session]);

  // Show loading while auth is initializing or redirecting
  if (authLoading || redirectingRef.current) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Validate password strength
      if (formData.password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      const supabase = createBrowserClient();

      // Sign up the user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            company_name: formData.companyName,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        setSuccess(true);
        // Use hard navigation to ensure cookies are sent properly
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card variant="glass-strong">
            <CardContent className="py-12 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-slate-200">Account Created!</h2>
              <p className="text-sm text-slate-400">
                Redirecting you to your dashboard...
              </p>
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
          <p className="text-slate-400">Create your account</p>
        </div>

        <Card variant="glass-strong">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
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
                label="Full Name"
                id="fullName"
                name="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                leftIcon={<User className="h-4 w-4" />}
                required
                autoComplete="name"
              />

              <Input
                label="Company Name"
                id="companyName"
                name="companyName"
                type="text"
                placeholder="Acme Inc."
                value={formData.companyName}
                onChange={handleChange}
                leftIcon={<Building2 className="h-4 w-4" />}
                required
                autoComplete="organization"
              />

              <Input
                label="Email"
                id="email"
                name="email"
                type="email"
                placeholder="you@company.com"
                value={formData.email}
                onChange={handleChange}
                leftIcon={<Mail className="h-4 w-4" />}
                required
                autoComplete="email"
              />

              <Input
                label="Password"
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                leftIcon={<Lock className="h-4 w-4" />}
                required
                autoComplete="new-password"
              />
              <p className="mt-1 text-xs text-slate-500">Must be at least 8 characters</p>

              <Input
                label="Confirm Password"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                leftIcon={<Lock className="h-4 w-4" />}
                required
                autoComplete="new-password"
              />

              <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
                Create Account
              </Button>

              <div className="text-center text-sm text-slate-400">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primary-400 hover:text-primary-300 transition-colors font-medium">
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
