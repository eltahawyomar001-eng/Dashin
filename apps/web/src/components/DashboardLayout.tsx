'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  NavLink,
  NavSection,
  NavDivider,
  Badge,
} from '@dashin/ui';
import { useUser, useClerk } from '@clerk/nextjs';
import {
  LayoutDashboard,
  Search,
  Database,
  Globe,
  Clock,
  Users,
  Target,
  TrendingUp,
  BarChart3,
  DollarSign,
  Settings,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  FileText,
  ChevronRight,
} from 'lucide-react';

export interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Generate breadcrumbs from pathname
  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Home', href: '/dashboard' }];
    
    let currentPath = '';
    paths.forEach((path, index) => {
      if (index === 0) return; // Skip 'dashboard'
      currentPath += `/${path}`;
      const label = path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      breadcrumbs.push({ label, href: `/dashboard${currentPath}` });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  // Mock notifications
  const notifications = [
    {
      id: 1,
      title: 'New lead captured',
      message: 'John Smith added to "Tech Startups" campaign',
      time: '5 min ago',
      read: false,
      type: 'success' as const,
    },
    {
      id: 2,
      title: 'Campaign milestone',
      message: 'Enterprise SaaS reached 100 leads',
      time: '1 hour ago',
      read: false,
      type: 'info' as const,
    },
    {
      id: 3,
      title: 'Scraping job completed',
      message: 'LinkedIn search for "CTO" finished with 45 results',
      time: '2 hours ago',
      read: true,
      type: 'success' as const,
    },
    {
      id: 4,
      title: 'Data quality alert',
      message: '3 leads require email verification',
      time: '1 day ago',
      read: true,
      type: 'warning' as const,
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Show loading spinner while auth is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">D</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Dashin</h1>
                  <p className="text-xs text-slate-400">Research Platform</p>
                </div>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <NavSection title="Main">
              <NavLink href="/dashboard" icon={<LayoutDashboard className="h-5 w-5" />} label="Dashboard" />
            </NavSection>

            <NavSection title="Campaigns">
              <NavLink href="/dashboard/campaigns" icon={<Target className="h-5 w-5" />} label="Campaigns" />
            </NavSection>

            <NavSection title="Leads">
              <NavLink href="/dashboard/leads" icon={<Users className="h-5 w-5" />} label="Leads Inventory" />
            </NavSection>

            <NavSection title="Analytics">
              <NavLink href="/dashboard/analytics" icon={<BarChart3 className="h-5 w-5" />} label="Overview" />
              <NavLink href="/dashboard/analytics/campaigns" icon={<TrendingUp className="h-5 w-5" />} label="Campaign Analytics" />
              <NavLink href="/dashboard/analytics/leads" icon={<Users className="h-5 w-5" />} label="Lead Analytics" />
              <NavLink href="/dashboard/reports" icon={<FileText className="h-5 w-5" />} label="Reports" />
            </NavSection>

            <NavSection title="Data Sources">
              <NavLink href="/dashboard/sources" icon={<Globe className="h-5 w-5" />} label="Data Sources" />
              <NavLink href="/dashboard/sources/jobs" icon={<Clock className="h-5 w-5" />} label="Scraping Jobs" />
            </NavSection>

            <NavSection title="Data Collection">
              <NavLink href="/dashboard/scraping" icon={<Search className="h-5 w-5" />} label="Scraping" />
              <NavLink href="/dashboard/cleanroom" icon={<Database className="h-5 w-5" />} label="Cleanroom" />
            </NavSection>

            <NavSection title="Intelligence">
              <NavLink href="/dashboard/research-iq" icon={<TrendingUp className="h-5 w-5" />} label="Research IQ" />
            </NavSection>

            <NavSection title="Finance">
              <NavLink
                href="/dashboard/cost-estimator"
                icon={<DollarSign className="h-5 w-5" />}
                label="Cost Estimator"
              />
            </NavSection>

            <NavDivider />

            <NavSection title="Administration">
              <NavLink href="/dashboard/users" icon={<Users className="h-5 w-5" />} label="Users" />
              <NavLink href="/dashboard/settings" icon={<Settings className="h-5 w-5" />} label="Settings" />
            </NavSection>
          </SidebarContent>

          <SidebarFooter>
            <div className="glass-strong rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary-500/20 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.emailAddresses?.[0]?.emailAddress || 'User'}
                  </p>
                  <p className="text-xs text-slate-400 capitalize">
                    {user?.publicMetadata?.role as string || 'user'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Topbar */}
        <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors rounded-lg"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              
              {/* Breadcrumbs */}
              {breadcrumbs.length > 1 && (
                <nav className="hidden md:flex items-center gap-2 text-sm">
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.href}>
                      {index > 0 && <ChevronRight className="h-4 w-4 text-slate-600" />}
                      <Link
                        href={crumb.href as any}
                        className={`transition-colors ${
                          index === breadcrumbs.length - 1
                            ? 'text-white font-medium'
                            : 'text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        {crumb.label}
                      </Link>
                    </React.Fragment>
                  ))}
                </nav>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="info">Beta</Badge>
              
              {/* Notifications Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </button>

                {/* Dropdown Menu */}
                {notificationsOpen && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-30" 
                      onClick={() => setNotificationsOpen(false)}
                    />
                    
                    {/* Dropdown - Responsive */}
                    <div className="fixed md:absolute inset-x-4 top-16 md:inset-x-auto md:right-0 md:top-auto md:mt-2 w-auto md:w-96 bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 z-40 animate-slide-down overflow-hidden">
                      {/* Header */}
                      <div className="flex items-center justify-between p-5 border-b border-slate-700/50 bg-slate-800/50">
                        <div>
                          <h3 className="text-base font-semibold text-white">Notifications</h3>
                          {unreadCount > 0 && (
                            <p className="text-xs text-slate-400 mt-0.5">{unreadCount} unread</p>
                          )}
                        </div>
                        <button 
                          onClick={() => setNotificationsOpen(false)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Notifications List - Responsive height */}
                      <div className="max-h-[60vh] md:max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-12 text-center">
                            <Bell className="h-12 w-12 mx-auto text-slate-600 mb-3" />
                            <p className="text-sm text-slate-400">No notifications</p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-slate-800 hover:bg-slate-800/50 transition-all cursor-pointer ${
                                !notification.read ? 'bg-slate-800/30' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`flex-shrink-0 mt-1.5 h-2 w-2 rounded-full ${
                                  notification.type === 'success' ? 'bg-green-500' :
                                  notification.type === 'warning' ? 'bg-yellow-500' :
                                  notification.type === 'info' ? 'bg-blue-500' : 'bg-slate-500'
                                }`} />
                                <div className="flex-1 min-w-0 space-y-1.5">
                                  <p className={`text-sm font-semibold leading-snug ${
                                    !notification.read ? 'text-white' : 'text-slate-300'
                                  }`}>
                                    {notification.title}
                                  </p>
                                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-slate-500 font-medium">
                                    {notification.time}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Footer */}
                      {notifications.length > 0 && (
                        <div className="p-4 border-t border-slate-700/50 bg-slate-800/50">
                          <button className="w-full text-center text-sm text-primary-400 hover:text-primary-300 hover:bg-slate-700/30 transition-all font-semibold py-2.5 rounded-lg">
                            View all notifications
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
