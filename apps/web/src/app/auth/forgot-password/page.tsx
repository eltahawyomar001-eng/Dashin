'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@dashin/ui';
import { Info } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-gradient mb-2 text-4xl font-bold">Dashin Research</h1>
          <p className="text-slate-400">Password Reset</p>
        </div>

        <Card variant="glass-strong">
          <CardHeader>
            <CardTitle>Reset Your Password</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="glass-subtle flex items-start gap-3 rounded-lg border border-indigo-500/20 p-4 text-sm text-slate-300">
              <Info className="h-5 w-5 flex-shrink-0 text-indigo-400 mt-0.5" />
              <div className="space-y-2">
                <p>Password reset is handled through the sign-in page.</p>
                <p>Click &ldquo;Forgot password?&rdquo; on the sign-in form to receive a reset link via email.</p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link 
                href="/auth/login/sign-in" 
                className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
              >
                Go to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
