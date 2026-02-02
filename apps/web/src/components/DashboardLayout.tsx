'use client';

import React, { useState } from 'react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  Topbar,
  TopbarSection,
  MainLayout,
  MainContent,
  NavLink,
  NavSection,
  NavDivider,
  Badge,
} from '@dashin/ui';
import { useAuth } from '@dashin/auth';
import { Can } from '@dashin/rbac';
import {
  LayoutDashboard,
  Search,
  Database,
  Globe,
  Clock,
  Users,
  Target,
  TrendingUp,
  DollarSign,
  Settings,
  Bell,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

export interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <MainLayout>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 transition-transform duration-300 ${
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

            <Can permission="campaign:view">
              <NavSection title="Campaigns">
                <NavLink href="/dashboard/campaigns" icon={<Target className="h-5 w-5" />} label="Campaigns" />
              </NavSection>
            </Can>

            <Can permission="lead:view">
              <NavSection title="Leads">
                <NavLink href="/dashboard/leads" icon={<Users className="h-5 w-5" />} label="Leads Inventory" />
              </NavSection>
            </Can>

            <Can permission="datasources:view">
              <NavSection title="Data Sources">
                <NavLink href="/dashboard/sources" icon={<Globe className="h-5 w-5" />} label="Data Sources" />
                <NavLink href="/dashboard/sources/jobs" icon={<Clock className="h-5 w-5" />} label="Scraping Jobs" />
              </NavSection>
            </Can>

            <Can permission="scrape:view">
              <NavSection title="Data Collection">
                <NavLink href="/dashboard/scraping" icon={<Search className="h-5 w-5" />} label="Scraping" />
                <NavLink href="/dashboard/cleanroom" icon={<Database className="h-5 w-5" />} label="Cleanroom" />
              </NavSection>
            </Can>

            <Can permission="research_iq:view_own">
              <NavSection title="Intelligence">
                <NavLink href="/dashboard/research-iq" icon={<TrendingUp className="h-5 w-5" />} label="Research IQ" />
              </NavSection>
            </Can>

            <Can permission="cost:view">
              <NavSection title="Finance">
                <NavLink
                  href="/dashboard/cost-estimator"
                  icon={<DollarSign className="h-5 w-5" />}
                  label="Cost Estimator"
                />
              </NavSection>
            </Can>

            <NavDivider />

            <Can permission="user:view">
              <NavSection title="Administration">
                <NavLink href="/dashboard/settings" icon={<Settings className="h-5 w-5" />} label="Settings" />
              </NavSection>
            </Can>
          </SidebarContent>

          <SidebarFooter>
            <div className="glass-strong rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary-500/20 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                  <p className="text-xs text-slate-400 capitalize">{user?.role.replace('_', ' ')}</p>
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
      <div
        className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}
      >
        {/* Topbar */}
        <Topbar>
          <TopbarSection>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-slate-400 hover:text-white transition-colors focus-ring rounded-lg"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </TopbarSection>

          <TopbarSection>
            <div className="flex items-center gap-3">
              <Badge variant="info">Beta</Badge>
              <button className="relative p-2 text-slate-400 hover:text-white transition-colors focus-ring rounded-lg">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
              </button>
            </div>
          </TopbarSection>
        </Topbar>

        {/* Page Content */}
        <MainContent>{children}</MainContent>
      </div>
    </MainLayout>
  );
};
