'use client';

import React, { useState } from 'react';
import {
  Users,
  Target,
  TrendingUp,
  CheckCircle2,
  BarChart3,
  Calendar,
} from 'lucide-react';
import {
  LineChart,
  AreaChart,
  BarChart,
  PieChart,
  DonutChart,
} from '@dashin/ui';
import type {
  TimeSeriesData,
  PieChartSegment,
  TimeRange,
} from '@dashin/shared-types';

/**
 * Analytics Dashboard Page
 * 
 * Comprehensive analytics overview with KPIs, charts, and insights
 * for campaigns, leads, and scraping activities.
 */

// Simple Stat Card Component
interface SimpleStatCardProps {
  label: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: 'purple' | 'blue' | 'green' | 'yellow';
}

function SimpleStatCard({ label, value, change, icon, color }: SimpleStatCardProps) {
  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  };

  const changeColor = change >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-5">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorClasses[color]}`}>
        {icon}
      </div>
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-gray-900">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        <span className={`text-sm font-medium ${changeColor}`}>
          {change >= 0 ? '+' : ''}{change.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

// Mock data for demonstration
const MOCK_TIME_SERIES: TimeSeriesData[] = [
  {
    id: 'leads',
    name: 'Total Leads',
    color: '#8b5cf6',
    data: [
      { timestamp: '2024-01-01T00:00:00Z', value: 120, label: 'Jan 1' },
      { timestamp: '2024-01-02T00:00:00Z', value: 145, label: 'Jan 2' },
      { timestamp: '2024-01-03T00:00:00Z', value: 160, label: 'Jan 3' },
      { timestamp: '2024-01-04T00:00:00Z', value: 185, label: 'Jan 4' },
      { timestamp: '2024-01-05T00:00:00Z', value: 175, label: 'Jan 5' },
      { timestamp: '2024-01-06T00:00:00Z', value: 200, label: 'Jan 6' },
      { timestamp: '2024-01-07T00:00:00Z', value: 225, label: 'Jan 7' },
    ],
  },
  {
    id: 'qualified',
    name: 'Qualified Leads',
    color: '#10b981',
    data: [
      { timestamp: '2024-01-01T00:00:00Z', value: 45, label: 'Jan 1' },
      { timestamp: '2024-01-02T00:00:00Z', value: 58, label: 'Jan 2' },
      { timestamp: '2024-01-03T00:00:00Z', value: 68, label: 'Jan 3' },
      { timestamp: '2024-01-04T00:00:00Z', value: 82, label: 'Jan 4' },
      { timestamp: '2024-01-05T00:00:00Z', value: 77, label: 'Jan 5' },
      { timestamp: '2024-01-06T00:00:00Z', value: 95, label: 'Jan 6' },
      { timestamp: '2024-01-07T00:00:00Z', value: 108, label: 'Jan 7' },
    ],
  },
];

const MOCK_LEAD_SOURCE_DATA: PieChartSegment[] = [
  { name: 'Web Scraping', value: 342, percentage: 45.6 },
  { name: 'Manual Entry', value: 256, percentage: 34.1 },
  { name: 'API Import', value: 98, percentage: 13.1 },
  { name: 'CSV Upload', value: 54, percentage: 7.2 },
];

const MOCK_CAMPAIGN_PERFORMANCE: TimeSeriesData[] = [
  {
    id: 'q1-tech',
    name: 'Q1 Tech Startups',
    color: '#8b5cf6',
    data: [
      { timestamp: '2024-01-01T00:00:00Z', value: 50, label: 'Week 1' },
      { timestamp: '2024-01-08T00:00:00Z', value: 125, label: 'Week 2' },
      { timestamp: '2024-01-15T00:00:00Z', value: 200, label: 'Week 3' },
      { timestamp: '2024-01-22T00:00:00Z', value: 280, label: 'Week 4' },
      { timestamp: '2024-01-29T00:00:00Z', value: 342, label: 'Week 5' },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise SaaS',
    color: '#3b82f6',
    data: [
      { timestamp: '2024-01-01T00:00:00Z', value: 80, label: 'Week 1' },
      { timestamp: '2024-01-08T00:00:00Z', value: 185, label: 'Week 2' },
      { timestamp: '2024-01-15T00:00:00Z', value: 312, label: 'Week 3' },
      { timestamp: '2024-01-22T00:00:00Z', value: 425, label: 'Week 4' },
      { timestamp: '2024-01-29T00:00:00Z', value: 512, label: 'Week 5' },
    ],
  },
];

const MOCK_SCORE_DISTRIBUTION: TimeSeriesData[] = [
  {
    id: 'scores',
    name: 'Leads',
    color: '#8b5cf6',
    data: [
      { timestamp: '1', value: 45, label: 'Score 1' },
      { timestamp: '2', value: 78, label: 'Score 2' },
      { timestamp: '3', value: 156, label: 'Score 3' },
      { timestamp: '4', value: 234, label: 'Score 4' },
      { timestamp: '5', value: 187, label: 'Score 5' },
    ],
  },
];

const MOCK_PRIORITY_DISTRIBUTION: PieChartSegment[] = [
  { name: 'Urgent', value: 89, percentage: 12.7, color: '#ef4444' },
  { name: 'High', value: 245, percentage: 35.0, color: '#f59e0b' },
  { name: 'Medium', value: 312, percentage: 44.6, color: '#eab308' },
  { name: 'Low', value: 54, percentage: 7.7, color: '#94a3b8' },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive insights across campaigns, leads, and scraping activities
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-gray-500" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="6m">Last 6 months</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SimpleStatCard
          label="Total Leads"
          value={1245}
          change={12.5}
          icon={<Users size={20} />}
          color="purple"
        />
        <SimpleStatCard
          label="Qualified Leads"
          value={687}
          change={18.3}
          icon={<CheckCircle2 size={20} />}
          color="green"
        />
        <SimpleStatCard
          label="Active Campaigns"
          value={12}
          change={-8.2}
          icon={<Target size={20} />}
          color="blue"
        />
        <SimpleStatCard
          label="Qualification Rate"
          value="55.2%"
          change={5.7}
          icon={<TrendingUp size={20} />}
          color="yellow"
        />
      </div>

      {/* Lead Trends */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Lead Trends</h2>
            <p className="text-sm text-gray-600 mt-1">
              Total leads and qualifications over time
            </p>
          </div>
        </div>
        <LineChart
          data={MOCK_TIME_SERIES}
          height={320}
          showGrid={true}
          showLegend={true}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Sources */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Lead Sources</h2>
            <p className="text-sm text-gray-600 mt-1">
              Distribution of leads by source
            </p>
          </div>
          <PieChart
            data={MOCK_LEAD_SOURCE_DATA}
            height={320}
            showLegend={true}
          />
        </div>

        {/* Priority Distribution */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Priority Distribution</h2>
            <p className="text-sm text-gray-600 mt-1">
              Leads grouped by priority level
            </p>
          </div>
          <DonutChart
            data={MOCK_PRIORITY_DISTRIBUTION}
            height={320}
            showLegend={true}
          />
        </div>
      </div>

      {/* Campaign Performance */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Campaign Performance</h2>
            <p className="text-sm text-gray-600 mt-1">
              Lead acquisition by campaign over time
            </p>
          </div>
        </div>
        <AreaChart
          data={MOCK_CAMPAIGN_PERFORMANCE}
          height={320}
          showGrid={true}
          showLegend={true}
          stacked={false}
        />
      </div>

      {/* Qualification Score Distribution */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Qualification Score Distribution
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Number of leads by qualification score (1-5)
            </p>
          </div>
        </div>
        <BarChart
          data={MOCK_SCORE_DISTRIBUTION}
          height={320}
          showGrid={true}
          showLegend={false}
        />
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="text-sm opacity-90">Top Performer</div>
              <div className="text-xl font-bold">Enterprise SaaS</div>
            </div>
          </div>
          <div className="text-sm opacity-90">
            512 qualified leads with 56.9% qualification rate
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="text-sm opacity-90">Best Conversion</div>
              <div className="text-xl font-bold">Q1 Tech Startups</div>
            </div>
          </div>
          <div className="text-sm opacity-90">
            62.3% of qualified leads converted to opportunities
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <BarChart3 size={24} />
            </div>
            <div>
              <div className="text-sm opacity-90">Average Score</div>
              <div className="text-xl font-bold">3.8 / 5.0</div>
            </div>
          </div>
          <div className="text-sm opacity-90">
            Overall lead quality improved by 12% this period
          </div>
        </div>
      </div>
    </div>
  );
}
