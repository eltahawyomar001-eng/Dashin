'use client';

import { Card, CardContent, Button } from '@dashin/ui';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardNotFound() {
  const router = useRouter();

  return (
    <div className="p-8 flex items-center justify-center min-h-[70vh]">
      <Card variant="glass" className="max-w-2xl w-full">
        <CardContent className="p-12 text-center">
          <div className="h-20 w-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-red-400" />
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-3">Page Not Found</h1>
          <p className="text-lg text-slate-300 mb-2">
            The dashboard page you're looking for doesn't exist.
          </p>
          <p className="text-slate-400 mb-8">
            It may have been moved or removed. Please check the URL or navigate back to the dashboard.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Button
              variant="secondary"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            <Link href="/dashboard">
              <Button className="gap-2">
                <Home className="h-4 w-4" />
                Dashboard Home
              </Button>
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-700">
            <p className="text-sm text-slate-400 mb-3">Quick Links:</p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
              <Link href="/dashboard/campaigns" className="text-primary-400 hover:text-primary-300">
                Campaigns
              </Link>
              <span className="text-slate-600">•</span>
              <Link href="/dashboard/leads" className="text-primary-400 hover:text-primary-300">
                Leads
              </Link>
              <span className="text-slate-600">•</span>
              <Link href="/dashboard/analytics" className="text-primary-400 hover:text-primary-300">
                Analytics
              </Link>
              <span className="text-slate-600">•</span>
              <Link href="/dashboard/settings" className="text-primary-400 hover:text-primary-300">
                Settings
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
