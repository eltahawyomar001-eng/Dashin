'use client';

import { useUser } from '@dashin/auth';
import { Card, CardHeader, CardTitle, CardContent, PageHeader, Container, Badge } from '@dashin/ui';
import { Building2, Shield, Users } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';

export default function DashboardPage() {
  const user = useUser();

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'super_admin':
        return <Shield className="h-5 w-5 text-accent-400" />;
      case 'agency_admin':
        return <Building2 className="h-5 w-5 text-primary-400" />;
      case 'researcher':
      case 'client':
        return <Users className="h-5 w-5 text-blue-400" />;
      default:
        return <Users className="h-5 w-5" />;
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'super_admin':
        return 'Super Admin';
      case 'agency_admin':
        return 'Agency Admin';
      case 'researcher':
        return 'Researcher';
      case 'client':
        return 'Client';
      default:
        return 'Unknown';
    }
  };

  if (!user) {
    return (
      <DashboardLayout>
        <Container>
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="glass rounded-2xl p-8">
              <p className="text-slate-400">Loading...</p>
            </div>
          </div>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container>
        <PageHeader
          title="Dashboard"
          description="Welcome back to Dashin Research"
          actions={
            <Badge variant="success">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                Online
              </span>
            </Badge>
          }
        />

        {/* User Info Card */}
        <div className="mb-8">
          <Card variant="glass-strong">
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="glass-strong flex h-16 w-16 items-center justify-center rounded-full">
                  {getRoleIcon()}
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">{user.email}</p>
                  <p className="text-sm text-slate-400">{getRoleLabel()}</p>
                </div>
              </div>

              {user.agencyId && (
                <div className="glass-subtle rounded-lg p-4">
                  <p className="text-sm text-slate-400">Agency ID</p>
                  <p className="font-mono text-sm text-slate-200">{user.agencyId}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card variant="glass">
            <CardContent className="pt-6">
              <h3 className="mb-2 text-sm font-medium text-slate-400">Status</h3>
              <p className="text-2xl font-bold text-white">Active</p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="pt-6">
              <h3 className="mb-2 text-sm font-medium text-slate-400">Authentication</h3>
              <p className="text-2xl font-bold text-primary-400">Verified</p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="pt-6">
              <h3 className="mb-2 text-sm font-medium text-slate-400">Access Level</h3>
              <p className="text-2xl font-bold text-accent-400">{getRoleLabel()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Info Message */}
        <div className="mt-8">
          <Card variant="glass-subtle">
            <CardContent className="py-6">
              <p className="text-center text-slate-400">
                <strong>Segment 3 Complete:</strong> Layout and Design System are now active. Domain
                features will be built in subsequent segments.
              </p>
            </CardContent>
          </Card>
        </div>
      </Container>
    </DashboardLayout>
  );
}

