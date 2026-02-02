'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Campaign, Lead } from '@dashin/shared-types';
import { Button, LeadList } from '@dashin/ui';
import { ArrowLeft, TrendingUp, Target, Users, CheckCircle } from 'lucide-react';

// Mock campaign data (in real app, fetch from API based on ID)
const MOCK_CAMPAIGN: Campaign = {
  id: '1',
  name: 'Q1 2024 Tech Startups',
  description: 'Targeting Series A/B tech startups in SF Bay Area',
  status: 'active',
  targetCompanies: 500,
  targetLeads: 1500,
  qualifiedLeads: 342,
  assignedLeads: 156,
  rejectedLeads: 89,
  startDate: '2024-01-01T00:00:00Z',
  endDate: '2024-03-31T23:59:59Z',
  agencyId: 'agency-1',
  clientId: 'client-1',
  createdBy: 'user-1',
  createdAt: '2023-12-15T10:00:00Z',
  updatedAt: '2024-01-20T15:30:00Z',
};

// Mock leads data
const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    campaignId: '1',
    campaignName: 'Q1 2024 Tech Startups',
    status: 'new',
    priority: 'high',
    firstName: 'Sarah',
    lastName: 'Johnson',
    title: 'VP of Engineering',
    contact: {
      email: 'sarah.johnson@techcorp.com',
      phone: '+1-555-0123',
      linkedin: 'https://linkedin.com/in/sarahjohnson',
    },
    company: {
      name: 'TechCorp Inc.',
      industry: 'SaaS',
      size: '50-200',
      location: 'San Francisco, CA',
    },
    source: {
      type: 'scraping',
      dataSourceName: 'LinkedIn Sales Navigator',
    },
    createdBy: 'user-1',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: '2',
    campaignId: '1',
    campaignName: 'Q1 2024 Tech Startups',
    status: 'qualified',
    priority: 'urgent',
    firstName: 'Michael',
    lastName: 'Chen',
    title: 'CTO',
    contact: {
      email: 'michael.chen@innovate.com',
    },
    company: {
      name: 'Innovate Labs',
      industry: 'AI/ML',
      size: '10-50',
      location: 'Palo Alto, CA',
    },
    source: {
      type: 'scraping',
    },
    qualification: {
      score: 5,
      criteria: {
        companySize: 'match',
        industry: 'match',
        location: 'match',
        budget: 'sufficient',
        authority: 'decision_maker',
        need: 'immediate',
        timing: 'now',
      },
      notes: 'Excellent fit, actively looking for solution',
      qualifiedBy: 'user-1',
      qualifiedAt: '2024-01-21T14:30:00Z',
    },
    createdBy: 'user-1',
    createdAt: '2024-01-19T09:00:00Z',
    updatedAt: '2024-01-21T14:30:00Z',
  },
];

export default function CampaignDetailsPage() {
  const router = useRouter();
  const [campaign] = useState<Campaign>(MOCK_CAMPAIGN);
  const [leads] = useState<Lead[]>(MOCK_LEADS);

  const progressPercentage = campaign.targetLeads > 0
    ? Math.min(Math.round((campaign.qualifiedLeads / campaign.targetLeads) * 100), 100)
    : 0;

  const qualificationRate = campaign.targetLeads > 0
    ? Math.round((campaign.qualifiedLeads / (campaign.qualifiedLeads + campaign.rejectedLeads)) * 100)
    : 0;

  return (
    <div className="p-8 space-y-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Campaigns
      </Button>

      {/* Campaign Header */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-white/10 rounded-lg p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{campaign.name}</h1>
            {campaign.description && (
              <p className="text-gray-400">{campaign.description}</p>
            )}
          </div>
          <span className={`px-4 py-2 text-sm font-medium rounded-full ${
            campaign.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
            campaign.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
            'bg-gray-500/20 text-gray-400 border border-gray-500/30'
          }`}>
            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Campaign Progress</span>
            <span className="text-white font-medium">{progressPercentage}% ({campaign.qualifiedLeads} / {campaign.targetLeads})</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Target className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Target Leads</p>
              <p className="text-2xl font-bold text-white">{campaign.targetLeads.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Qualified</p>
              <p className="text-2xl font-bold text-white">{campaign.qualifiedLeads.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Assigned</p>
              <p className="text-2xl font-bold text-white">{campaign.assignedLeads.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-3 bg-orange-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Qualification Rate</p>
              <p className="text-2xl font-bold text-white">{qualificationRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Leads Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Campaign Leads</h2>
          <Button onClick={() => router.push('/dashboard/leads' as any)}>
            View All Leads
          </Button>
        </div>

        <LeadList
          leads={leads}
          onView={(leadId) => console.log('View lead:', leadId)}
        />
      </div>
    </div>
  );
}
