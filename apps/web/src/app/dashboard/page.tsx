'use client';

import { useUser } from '@dashin/auth';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  PageHeader,
  Container,
  Badge,
  StatCard,
  MetricsGrid,
  ActivitySection,
  ChartContainer,
  ChartTimeRangeSelector,
} from '@dashin/ui';
import { Building2, Shield, Users, TrendingUp, UserPlus, Database, Target } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useState } from 'react';

export default function DashboardPage() {
  const user = useUser();
  const [timeRange, setTimeRange] = useState('30d');

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

  // Mock activity data
  const recentActivity = [
    {
      id: '1',
      type: 'user' as const,
      title: 'New user registered',
      description: 'researcher@agency.com joined the platform',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      user: { name: 'System' },
    },
    {
      id: '2',
      type: 'campaign' as const,
      title: 'Campaign created',
      description: 'Q1 2026 Lead Generation campaign started',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      user: { name: user?.email || 'User' },
    },
    {
      id: '3',
      type: 'lead' as const,
      title: '50 new leads added',
      description: 'Leads imported from scraping session',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      user: { name: 'Scraper Bot' },
    },
  ];

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
          description={`Welcome back, ${user.email}`}
          actions={
            <Badge variant="success">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                Online
              </span>
            </Badge>
          }
        />

        {/* Key Metrics */}
        <MetricsGrid columns={4} className="mb-8">
          <StatCard
            title="Total Leads"
            value="2,847"
            trend={{ value: 12.5, isPositive: true, label: 'vs last month' }}
            icon={<Target className="h-6 w-6 text-primary-400" />}
            variant="primary"
          />
          <StatCard
            title="Active Campaigns"
            value="12"
            trend={{ value: 3, isPositive: true, label: 'new this week' }}
            icon={<TrendingUp className="h-6 w-6 text-green-400" />}
            variant="success"
          />
          <StatCard
            title="Team Members"
            value="8"
            trend={{ value: 0, isPositive: false, label: 'no change' }}
            icon={<UserPlus className="h-6 w-6 text-blue-400" />}
          />
          <StatCard
            title="Data Sources"
            value="5"
            subtitle="2 pending approval"
            icon={<Database className="h-6 w-6 text-amber-400" />}
            variant="warning"
          />
        </MetricsGrid>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <ChartContainer
            title="Lead Growth"
            description="Total leads acquired over time"
            actions={
              <ChartTimeRangeSelector value={timeRange} onChange={setTimeRange} />
            }
            height={300}
          >
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="text-center">
                <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Chart visualization will be added in future segment</p>
                <p className="text-sm mt-2">Selected: {timeRange}</p>
              </div>
            </div>
          </ChartContainer>

          <ChartContainer
            title="Campaign Performance"
            description="Active campaigns by status"
            height={300}
          >
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Chart visualization will be added in future segment</p>
              </div>
            </div>
          </ChartContainer>
        </div>

        {/* Activity Feed */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <div className="lg:col-span-2">
            <ActivitySection
              title="Recent Activity"
              items={recentActivity}
              maxItems={5}
            />
          </div>

          {/* User Profile Card */}
          <div>
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
                    <p className="text-lg font-semibold text-white truncate">{user.email}</p>
                    <p className="text-sm text-slate-400">{getRoleLabel()}</p>
                  </div>
                </div>

                {user.agencyId && (
                  <div className="glass-subtle rounded-lg p-4">
                    <p className="text-sm text-slate-400">Agency ID</p>
                    <p className="font-mono text-sm text-slate-200 truncate">{user.agencyId}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Status</span>
                    <Badge variant="success">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Info Message */}
        <div>
          <Card variant="glass-subtle">
            <CardContent className="py-6">
              <p className="text-center text-slate-400">
                <strong>Segment 4 In Progress:</strong> Dashboard analytics components added. User/Agency management UI and API routes coming next.
              </p>
            </CardContent>
          </Card>
        </div>
      </Container>
    </DashboardLayout>
  );
}


