'use client';

import { useUser } from '@clerk/nextjs';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@dashin/ui';
import { Building2, Shield, Users, TrendingUp, UserPlus, Database, Target, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();

  const getRoleIcon = () => {
    const role = user?.publicMetadata?.role as string;
    switch (role) {
      case 'super_admin':
        return <Shield className="h-5 w-5 text-accent-400" />;
      case 'agency_admin':
        return <Building2 className="h-5 w-5 text-primary-400" />;
      default:
        return <Users className="h-5 w-5 text-blue-400" />;
    }
  };

  const getRoleLabel = () => {
    const role = user?.publicMetadata?.role as string;
    const labels: Record<string, string> = {
      super_admin: 'Super Admin',
      agency_admin: 'Agency Admin',
      researcher: 'Researcher',
      client: 'Client',
    };
    return labels[role || ''] || 'User';
  };

  // Show loading state
  if (!isLoaded || !user) {
    return (
      <div className="p-8">
        <div className="glass rounded-2xl p-8 flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">Welcome back, {user.emailAddresses?.[0]?.emailAddress || 'User'}</p>
        </div>
        <Badge variant="success" className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          Online
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Leads" 
          value="2,847" 
          change="+12.5%" 
          trend="up"
          icon={<Target className="h-5 w-5" />}
          color="primary"
        />
        <StatCard 
          title="Active Campaigns" 
          value="12" 
          change="+3 new" 
          trend="up"
          icon={<TrendingUp className="h-5 w-5" />}
          color="green"
        />
        <StatCard 
          title="Team Members" 
          value="8" 
          change="No change" 
          trend="neutral"
          icon={<UserPlus className="h-5 w-5" />}
          color="blue"
        />
        <StatCard 
          title="Data Sources" 
          value="5" 
          change="2 pending" 
          trend="neutral"
          icon={<Database className="h-5 w-5" />}
          color="amber"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2 min-w-0">
          <Card variant="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary-400" />
                Recent Activity
              </CardTitle>
              <button className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
                View All
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <ActivityItem 
                title="New user registered"
                description="researcher@agency.com joined the platform"
                time="15 minutes ago"
                type="user"
              />
              <ActivityItem 
                title="Campaign created"
                description="Q1 2026 Lead Generation campaign started"
                time="2 hours ago"
                type="campaign"
              />
              <ActivityItem 
                title="50 new leads added"
                description="Leads imported from scraping session"
                time="5 hours ago"
                type="lead"
              />
              <ActivityItem 
                title="Report generated"
                description="Monthly performance report ready"
                time="1 day ago"
                type="report"
              />
            </CardContent>
          </Card>
        </div>

        {/* Profile Card */}
        <div className="min-w-0">
          <Card variant="glass-strong" className="h-full">
            <CardHeader className="pb-4">
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pb-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 flex-shrink-0 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-white/10 flex items-center justify-center">
                  {getRoleIcon()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold text-white truncate">
                    {user.emailAddresses?.[0]?.emailAddress || 'User'}
                  </p>
                  <p className="text-sm text-slate-400">{getRoleLabel()}</p>
                </div>
              </div>

              {user.publicMetadata?.agencyId && typeof user.publicMetadata.agencyId === 'string' && (
                <div className="glass-subtle rounded-xl p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Agency ID</p>
                  <p className="font-mono text-sm text-slate-200 break-all">
                    {user.publicMetadata.agencyId}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Status</span>
                  <Badge variant="success">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Role</span>
                  <span className="text-sm text-white">{getRoleLabel()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  title, 
  value, 
  change, 
  trend, 
  icon, 
  color 
}: { 
  title: string; 
  value: string; 
  change: string; 
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: 'primary' | 'green' | 'blue' | 'amber';
}) {
  const colorClasses = {
    primary: 'from-primary-500/20 to-primary-600/10 border-primary-500/20 text-primary-400',
    green: 'from-green-500/20 to-green-600/10 border-green-500/20 text-green-400',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/20 text-blue-400',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/20 text-amber-400',
  };

  return (
    <div className={`glass rounded-2xl p-6 bg-gradient-to-br ${colorClasses[color].split(' ').slice(0, 2).join(' ')} border ${colorClasses[color].split(' ')[2]}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-white/5 ${colorClasses[color].split(' ')[3]}`}>
          {icon}
        </div>
        {trend !== 'neutral' && (
          <div className={`flex items-center gap-1 text-xs ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {change}
          </div>
        )}
        {trend === 'neutral' && (
          <span className="text-xs text-slate-400">{change}</span>
        )}
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-slate-400">{title}</p>
    </div>
  );
}

// Activity Item Component
function ActivityItem({ 
  title, 
  description, 
  time, 
  type 
}: { 
  title: string; 
  description: string; 
  time: string; 
  type: 'user' | 'campaign' | 'lead' | 'report';
}) {
  const typeColors = {
    user: 'bg-blue-500/20 text-blue-400',
    campaign: 'bg-green-500/20 text-green-400',
    lead: 'bg-purple-500/20 text-purple-400',
    report: 'bg-amber-500/20 text-amber-400',
  };

  const typeIcons = {
    user: <Users className="h-4 w-4" />,
    campaign: <Target className="h-4 w-4" />,
    lead: <UserPlus className="h-4 w-4" />,
    report: <TrendingUp className="h-4 w-4" />,
  };

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors">
      <div className={`p-2 rounded-lg ${typeColors[type]}`}>
        {typeIcons[type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-sm text-slate-400 truncate">{description}</p>
      </div>
      <span className="text-xs text-slate-500 whitespace-nowrap">{time}</span>
    </div>
  );
}
