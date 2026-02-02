'use client';

import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  UserCheck,
  TrendingUp,
  Target,
  Award,
  Filter,
} from 'lucide-react';
import {
  LineChart,
  BarChart,
  PieChart,
  DonutChart,
} from '@dashin/ui';
import type {
  TimeSeriesData,
  PieChartSegment,
} from '@dashin/shared-types';

/**
 * Lead Analytics Page
 * 
 * Detailed lead metrics including qualification funnel, score distribution,
 * conversion rates, and source effectiveness analysis.
 */

// Simple Stat Card Component
interface SimpleStatCardProps {
  label: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: 'purple' | 'blue' | 'green' | 'yellow' | 'red';
}

function SimpleStatCard({ label, value, change, icon, color }: SimpleStatCardProps) {
  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
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

// Funnel Stage Component
interface FunnelStageProps {
  name: string;
  value: number;
  percentage: number;
  color: string;
  isLast?: boolean;
}

function FunnelStage({ name, value, percentage, color, isLast }: FunnelStageProps) {
  return (
    <div className="relative">
      <div 
        className="rounded-lg p-6 transition-all hover:shadow-lg"
        style={{ backgroundColor: color, width: `${percentage}%`, minWidth: '200px' }}
      >
        <div className="text-white">
          <div className="text-sm font-medium opacity-90 mb-1">{name}</div>
          <div className="text-3xl font-bold mb-1">{value.toLocaleString()}</div>
          <div className="text-sm opacity-90">{percentage.toFixed(1)}% of total</div>
        </div>
      </div>
      {!isLast && (
        <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rotate-45 bg-white border-r border-b border-gray-200" />
      )}
    </div>
  );
}

// Mock data
const MOCK_FUNNEL_DATA = [
  { name: 'New Leads', value: 1500, percentage: 100, color: '#8b5cf6' },
  { name: 'Contacted', value: 1125, percentage: 75, color: '#6366f1' },
  { name: 'Qualified', value: 750, percentage: 50, color: '#3b82f6' },
  { name: 'Assigned', value: 525, percentage: 35, color: '#10b981' },
  { name: 'Converted', value: 225, percentage: 15, color: '#059669' },
];

const MOCK_SCORE_DISTRIBUTION: TimeSeriesData[] = [
  {
    id: 'scores',
    name: 'Leads by Score',
    color: '#8b5cf6',
    data: [
      { timestamp: '1', value: 89, label: 'Poor (1)' },
      { timestamp: '2', value: 156, label: 'Fair (2)' },
      { timestamp: '3', value: 342, label: 'Good (3)' },
      { timestamp: '4', value: 512, label: 'Very Good (4)' },
      { timestamp: '5', value: 401, label: 'Excellent (5)' },
    ],
  },
];

const MOCK_STATUS_DISTRIBUTION: PieChartSegment[] = [
  { name: 'Qualified', value: 687, percentage: 46.2, color: '#10b981' },
  { name: 'New', value: 423, percentage: 28.4, color: '#3b82f6' },
  { name: 'Assigned', value: 234, percentage: 15.7, color: '#8b5cf6' },
  { name: 'Rejected', value: 145, percentage: 9.7, color: '#ef4444' },
];

const MOCK_PRIORITY_DISTRIBUTION: PieChartSegment[] = [
  { name: 'Urgent', value: 178, percentage: 11.9, color: '#ef4444' },
  { name: 'High', value: 534, percentage: 35.8, color: '#f59e0b' },
  { name: 'Medium', value: 623, percentage: 41.8, color: '#eab308' },
  { name: 'Low', value: 154, percentage: 10.5, color: '#94a3b8' },
];

const MOCK_SOURCE_EFFECTIVENESS: TimeSeriesData[] = [
  {
    id: 'conversion',
    name: 'Conversion Rate %',
    color: '#10b981',
    data: [
      { timestamp: 'LinkedIn', value: 42.5, label: 'LinkedIn' },
      { timestamp: 'Google', value: 38.2, label: 'Google Search' },
      { timestamp: 'Website', value: 31.7, label: 'Company Sites' },
      { timestamp: 'Manual', value: 28.4, label: 'Manual Entry' },
      { timestamp: 'API', value: 25.1, label: 'API Import' },
    ],
  },
];

const MOCK_LEAD_TRENDS: TimeSeriesData[] = [
  {
    id: 'new',
    name: 'New Leads',
    color: '#3b82f6',
    data: [
      { timestamp: 'Week 1', value: 245, label: 'Week 1' },
      { timestamp: 'Week 2', value: 312, label: 'Week 2' },
      { timestamp: 'Week 3', value: 289, label: 'Week 3' },
      { timestamp: 'Week 4', value: 356, label: 'Week 4' },
      { timestamp: 'Week 5', value: 423, label: 'Week 5' },
      { timestamp: 'Week 6', value: 398, label: 'Week 6' },
    ],
  },
  {
    id: 'qualified',
    name: 'Qualified',
    color: '#10b981',
    data: [
      { timestamp: 'Week 1', value: 98, label: 'Week 1' },
      { timestamp: 'Week 2', value: 142, label: 'Week 2' },
      { timestamp: 'Week 3', value: 156, label: 'Week 3' },
      { timestamp: 'Week 4', value: 178, label: 'Week 4' },
      { timestamp: 'Week 5', value: 201, label: 'Week 5' },
      { timestamp: 'Week 6', value: 189, label: 'Week 6' },
    ],
  },
];

const MOCK_CRITERIA_ANALYSIS = [
  { criterion: 'Company Size', match: 756, mismatch: 744 },
  { criterion: 'Industry', match: 892, mismatch: 608 },
  { criterion: 'Location', match: 678, mismatch: 822 },
  { criterion: 'Budget', match: 623, mismatch: 877 },
  { criterion: 'Authority', match: 812, mismatch: 688 },
  { criterion: 'Need Level', match: 734, mismatch: 766 },
  { criterion: 'Timing', match: 567, mismatch: 933 },
];

export default function LeadAnalyticsPage() {
  const [selectedSource, setSelectedSource] = useState<string>('all');

  // Calculate conversion metrics
  const totalLeads = MOCK_FUNNEL_DATA[0]?.value || 0;
  const qualifiedLeads = MOCK_FUNNEL_DATA[2]?.value || 0;
  const convertedLeads = MOCK_FUNNEL_DATA[4]?.value || 0;
  const qualificationRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;
  const conversionRate = qualifiedLeads > 0 ? (convertedLeads / qualifiedLeads) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lead Analytics</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive lead qualification metrics and conversion analysis
          </p>
        </div>

        {/* Source Filter */}
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-500" />
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Sources</option>
            <option value="linkedin">LinkedIn</option>
            <option value="google">Google Search</option>
            <option value="website">Company Websites</option>
            <option value="manual">Manual Entry</option>
            <option value="api">API Import</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SimpleStatCard
          label="Total Leads"
          value={totalLeads}
          change={15.3}
          icon={<Users size={20} />}
          color="purple"
        />
        <SimpleStatCard
          label="Qualified Leads"
          value={qualifiedLeads}
          change={22.8}
          icon={<CheckCircle2 size={20} />}
          color="green"
        />
        <SimpleStatCard
          label="Qualification Rate"
          value={`${qualificationRate.toFixed(1)}%`}
          change={8.5}
          icon={<Target size={20} />}
          color="blue"
        />
        <SimpleStatCard
          label="Conversion Rate"
          value={`${conversionRate.toFixed(1)}%`}
          change={12.3}
          icon={<TrendingUp size={20} />}
          color="yellow"
        />
      </div>

      {/* Qualification Funnel */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Qualification Funnel</h2>
          <p className="text-sm text-gray-600 mt-1">
            Lead progression through qualification stages
          </p>
        </div>
        <div className="space-y-4">
          {MOCK_FUNNEL_DATA.map((stage, index) => (
            <FunnelStage
              key={stage.name}
              {...stage}
              isLast={index === MOCK_FUNNEL_DATA.length - 1}
            />
          ))}
        </div>
        
        {/* Funnel Metrics */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">75%</div>
            <div className="text-sm text-gray-600">Contact Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">50%</div>
            <div className="text-sm text-gray-600">Qualification Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">30%</div>
            <div className="text-sm text-gray-600">Lead to Conversion</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Qualification Score Distribution
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Distribution of leads across quality scores (1-5)
            </p>
          </div>
          <BarChart
            data={MOCK_SCORE_DISTRIBUTION}
            height={300}
            showGrid={true}
            showLegend={false}
          />
        </div>

        {/* Status Distribution */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Lead Status Breakdown</h2>
            <p className="text-sm text-gray-600 mt-1">
              Current status distribution of all leads
            </p>
          </div>
          <DonutChart
            data={MOCK_STATUS_DISTRIBUTION}
            height={300}
            showLegend={true}
          />
        </div>
      </div>

      {/* Lead Trends */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Lead Activity Trends</h2>
          <p className="text-sm text-gray-600 mt-1">
            New leads and qualifications over time
          </p>
        </div>
        <LineChart
          data={MOCK_LEAD_TRENDS}
          height={320}
          showGrid={true}
          showLegend={true}
        />
      </div>

      {/* Two Column Layout 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Priority Level Distribution
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Leads grouped by priority assignment
            </p>
          </div>
          <PieChart
            data={MOCK_PRIORITY_DISTRIBUTION}
            height={300}
            showLegend={true}
          />
        </div>

        {/* Source Effectiveness */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Source Effectiveness
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Conversion rates by lead source
            </p>
          </div>
          <BarChart
            data={MOCK_SOURCE_EFFECTIVENESS}
            height={300}
            showGrid={true}
            showLegend={false}
            formatter={(value) => `${value}%`}
          />
        </div>
      </div>

      {/* Qualification Criteria Analysis */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Qualification Criteria Analysis
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Match vs mismatch rates for each qualification criterion
          </p>
        </div>

        <div className="space-y-4">
          {MOCK_CRITERIA_ANALYSIS.map((item) => {
            const total = item.match + item.mismatch;
            const matchPercentage = (item.match / total) * 100;
            const mismatchPercentage = (item.mismatch / total) * 100;

            return (
              <div key={item.criterion}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {item.criterion}
                  </span>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-600">
                      {item.match} match ({matchPercentage.toFixed(1)}%)
                    </span>
                    <span className="text-red-600">
                      {item.mismatch} mismatch ({mismatchPercentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="flex h-4 rounded-full overflow-hidden bg-gray-200">
                  <div
                    className="bg-green-500"
                    style={{ width: `${matchPercentage}%` }}
                  />
                  <div
                    className="bg-red-500"
                    style={{ width: `${mismatchPercentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <Award size={24} />
            </div>
            <div>
              <div className="text-sm opacity-90">Top Source</div>
              <div className="text-xl font-bold">LinkedIn</div>
            </div>
          </div>
          <div className="text-sm opacity-90">
            42.5% conversion rate with 456 qualified leads
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <UserCheck size={24} />
            </div>
            <div>
              <div className="text-sm opacity-90">Best Criterion</div>
              <div className="text-xl font-bold">Industry Match</div>
            </div>
          </div>
          <div className="text-sm opacity-90">
            59.5% match rate across all qualified leads
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="text-sm opacity-90">Growth Rate</div>
              <div className="text-xl font-bold">+22.8%</div>
            </div>
          </div>
          <div className="text-sm opacity-90">
            Qualified leads increased significantly this period
          </div>
        </div>
      </div>
    </div>
  );
}
