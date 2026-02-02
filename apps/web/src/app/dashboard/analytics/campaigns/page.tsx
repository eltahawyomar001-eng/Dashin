'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Target,
  Users,
  CheckCircle2,
  DollarSign,
  Clock,
} from 'lucide-react';
import {
  LineChart,
  BarChart,
  DonutChart,
  MetricCard,
} from '@dashin/ui';
import type {
  TimeSeriesData,
  PieChartSegment,
} from '@dashin/shared-types';

/**
 * Campaign Analytics Page
 * 
 * Detailed analytics and metrics for campaign performance,
 * ROI tracking, lead source analysis, and time-based trends.
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

// Mock campaign performance data
const MOCK_CAMPAIGNS_COMPARISON: TimeSeriesData[] = [
  {
    id: 'q1-tech',
    name: 'Q1 Tech Startups',
    color: '#8b5cf6',
    data: [
      { timestamp: '2024-01-01', value: 50, label: 'Week 1' },
      { timestamp: '2024-01-08', value: 125, label: 'Week 2' },
      { timestamp: '2024-01-15', value: 200, label: 'Week 3' },
      { timestamp: '2024-01-22', value: 280, label: 'Week 4' },
      { timestamp: '2024-01-29', value: 342, label: 'Week 5' },
      { timestamp: '2024-02-05', value: 405, label: 'Week 6' },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise SaaS',
    color: '#3b82f6',
    data: [
      { timestamp: '2024-01-01', value: 80, label: 'Week 1' },
      { timestamp: '2024-01-08', value: 185, label: 'Week 2' },
      { timestamp: '2024-01-15', value: 312, label: 'Week 3' },
      { timestamp: '2024-01-22', value: 425, label: 'Week 4' },
      { timestamp: '2024-01-29', value: 512, label: 'Week 5' },
      { timestamp: '2024-02-05', value: 598, label: 'Week 6' },
    ],
  },
  {
    id: 'healthcare',
    name: 'Healthcare AI',
    color: '#10b981',
    data: [
      { timestamp: '2024-01-01', value: 30, label: 'Week 1' },
      { timestamp: '2024-01-08', value: 65, label: 'Week 2' },
      { timestamp: '2024-01-15', value: 98, label: 'Week 3' },
      { timestamp: '2024-01-22', value: 125, label: 'Week 4' },
      { timestamp: '2024-01-29', value: 145, label: 'Week 5' },
      { timestamp: '2024-02-05', value: 178, label: 'Week 6' },
    ],
  },
];

const MOCK_QUALIFICATION_RATES: TimeSeriesData[] = [
  {
    id: 'rates',
    name: 'Qualification Rate',
    color: '#8b5cf6',
    data: [
      { timestamp: 'Week 1', value: 42, label: 'Week 1' },
      { timestamp: 'Week 2', value: 48, label: 'Week 2' },
      { timestamp: 'Week 3', value: 52, label: 'Week 3' },
      { timestamp: 'Week 4', value: 55, label: 'Week 4' },
      { timestamp: 'Week 5', value: 58, label: 'Week 5' },
      { timestamp: 'Week 6', value: 61, label: 'Week 6' },
    ],
  },
];

const MOCK_LEAD_SOURCE_BREAKDOWN: PieChartSegment[] = [
  { name: 'LinkedIn Scraping', value: 456, percentage: 38.2, color: '#0077b5' },
  { name: 'Google Search', value: 342, percentage: 28.7, color: '#4285f4' },
  { name: 'Company Websites', value: 234, percentage: 19.6, color: '#34a853' },
  { name: 'Manual Research', value: 98, percentage: 8.2, color: '#fbbc04' },
  { name: 'API Imports', value: 63, percentage: 5.3, color: '#ea4335' },
];

const MOCK_CAMPAIGN_STATS = [
  {
    name: 'Q1 Tech Startups',
    totalLeads: 1500,
    targetLeads: 1500,
    qualifiedLeads: 342,
    qualificationRate: 22.8,
    assignedLeads: 256,
    convertedLeads: 89,
    conversionRate: 26.0,
    avgScore: 3.6,
    status: 'active' as const,
  },
  {
    name: 'Enterprise SaaS',
    totalLeads: 900,
    targetLeads: 900,
    qualifiedLeads: 512,
    qualificationRate: 56.9,
    assignedLeads: 445,
    convertedLeads: 178,
    conversionRate: 34.8,
    avgScore: 4.2,
    status: 'active' as const,
  },
  {
    name: 'Healthcare AI',
    totalLeads: 600,
    targetLeads: 600,
    qualifiedLeads: 145,
    qualificationRate: 24.2,
    assignedLeads: 98,
    convertedLeads: 34,
    conversionRate: 23.4,
    avgScore: 3.4,
    status: 'paused' as const,
  },
  {
    name: 'FinTech Summer',
    totalLeads: 1200,
    targetLeads: 1200,
    qualifiedLeads: 0,
    qualificationRate: 0,
    assignedLeads: 0,
    convertedLeads: 0,
    conversionRate: 0,
    avgScore: 0,
    status: 'draft' as const,
  },
];

export default function CampaignAnalyticsPage() {
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');

  // Calculate aggregate metrics
  const totalLeads = MOCK_CAMPAIGN_STATS.reduce((sum, c) => sum + c.totalLeads, 0);
  const qualifiedLeads = MOCK_CAMPAIGN_STATS.reduce((sum, c) => sum + c.qualifiedLeads, 0);
  const convertedLeads = MOCK_CAMPAIGN_STATS.reduce((sum, c) => sum + c.convertedLeads, 0);
  const avgQualificationRate = (qualifiedLeads / totalLeads) * 100;
  const avgConversionRate = (convertedLeads / qualifiedLeads) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaign Analytics</h1>
          <p className="text-gray-600 mt-1">
            Detailed performance metrics and ROI analysis for all campaigns
          </p>
        </div>

        {/* Campaign Filter */}
        <div className="flex items-center gap-2">
          <Target size={20} className="text-gray-500" />
          <select
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Campaigns</option>
            <option value="q1-tech">Q1 Tech Startups</option>
            <option value="enterprise">Enterprise SaaS</option>
            <option value="healthcare">Healthcare AI</option>
            <option value="fintech">FinTech Summer</option>
          </select>
        </div>
      </div>

      {/* Overview Metrics */}
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
          label="Avg Qualification Rate"
          value={`${avgQualificationRate.toFixed(1)}%`}
          change={8.5}
          icon={<TrendingUp size={20} />}
          color="blue"
        />
        <SimpleStatCard
          label="Avg Conversion Rate"
          value={`${avgConversionRate.toFixed(1)}%`}
          change={12.3}
          icon={<DollarSign size={20} />}
          color="yellow"
        />
      </div>

      {/* Campaign Performance Comparison */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Campaign Performance Comparison
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Lead acquisition trends across active campaigns
          </p>
        </div>
        <LineChart
          data={MOCK_CAMPAIGNS_COMPARISON}
          height={360}
          showGrid={true}
          showLegend={true}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Qualification Rate Trend */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Qualification Rate Trend
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Weekly qualification rate improvement
            </p>
          </div>
          <BarChart
            data={MOCK_QUALIFICATION_RATES}
            height={300}
            showGrid={true}
            showLegend={false}
            formatter={(value) => `${value}%`}
          />
        </div>

        {/* Lead Source Effectiveness */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Lead Source Breakdown
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Distribution of leads by acquisition source
            </p>
          </div>
          <DonutChart
            data={MOCK_LEAD_SOURCE_BREAKDOWN}
            height={300}
            showLegend={true}
          />
        </div>
      </div>

      {/* Campaign Details Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Campaign Details</h2>
          <p className="text-sm text-gray-600 mt-1">
            Comprehensive metrics for all campaigns
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Campaign
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Total Leads
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Qualified
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Qual. Rate
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Assigned
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Converted
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Conv. Rate
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Avg Score
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CAMPAIGN_STATS.map((campaign, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    {campaign.name}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-gray-700">
                    {campaign.totalLeads.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-gray-700">
                    {campaign.qualifiedLeads.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-medium text-gray-900">
                    {campaign.qualificationRate.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-gray-700">
                    {campaign.assignedLeads.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-gray-700">
                    {campaign.convertedLeads.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-medium text-gray-900">
                    {campaign.conversionRate.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-sm text-right">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        campaign.avgScore >= 4
                          ? 'bg-green-100 text-green-700'
                          : campaign.avgScore >= 3
                          ? 'bg-blue-100 text-blue-700'
                          : campaign.avgScore > 0
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {campaign.avgScore > 0 ? campaign.avgScore.toFixed(1) : 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : campaign.status === 'paused'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          label="Top Performing Campaign"
          value={56.9}
          unit="%"
          change={8.3}
          changeDirection="up"
          trend={[42, 45, 48, 52, 55, 56.9]}
          icon={<Trophy size={20} />}
        />
        <MetricCard
          label="Avg Time to Qualify"
          value={4.2}
          unit="hours"
          change={-12.5}
          changeDirection="down"
          trend={[6.2, 5.8, 5.2, 4.8, 4.5, 4.2]}
          icon={<Clock size={20} />}
        />
        <MetricCard
          label="Best Conversion Source"
          value={38.2}
          unit="%"
          change={5.4}
          changeDirection="up"
          trend={[32, 33, 35, 36, 37, 38.2]}
          icon={<Target size={20} />}
        />
      </div>
    </div>
  );
}

function Trophy({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
