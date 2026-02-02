'use client';

import { useState } from 'react';
import { Campaign, CampaignStatus, CreateCampaignPayload } from '@dashin/shared-types';
import { CampaignList, Input, Modal, Button, useToast } from '@dashin/ui';
import { Plus, Search, Filter, TrendingUp, Target, Users, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Mock data
const MOCK_CAMPAIGNS: Campaign[] = [
  {
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
  },
  {
    id: '2',
    name: 'Enterprise SaaS Expansion',
    description: 'Mid-market to enterprise SaaS companies looking to scale',
    status: 'active',
    targetCompanies: 300,
    targetLeads: 900,
    qualifiedLeads: 512,
    assignedLeads: 298,
    rejectedLeads: 134,
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-06-30T23:59:59Z',
    agencyId: 'agency-1',
    createdBy: 'user-1',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-21T11:20:00Z',
  },
  {
    id: '3',
    name: 'Healthcare AI Initiative',
    description: 'Healthcare providers adopting AI solutions',
    status: 'paused',
    targetCompanies: 200,
    targetLeads: 600,
    qualifiedLeads: 145,
    assignedLeads: 67,
    rejectedLeads: 45,
    startDate: '2024-02-01T00:00:00Z',
    endDate: '2024-05-31T23:59:59Z',
    createdBy: 'user-2',
    createdAt: '2024-01-25T14:00:00Z',
    updatedAt: '2024-02-10T16:45:00Z',
  },
  {
    id: '4',
    name: 'FinTech Summer Campaign',
    description: 'Financial services companies exploring blockchain solutions',
    status: 'draft',
    targetCompanies: 400,
    targetLeads: 1200,
    qualifiedLeads: 0,
    assignedLeads: 0,
    rejectedLeads: 0,
    startDate: '2024-06-01T00:00:00Z',
    endDate: '2024-08-31T23:59:59Z',
    clientId: 'client-2',
    createdBy: 'user-1',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-05T12:00:00Z',
  },
];

export default function CampaignsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  // Filter campaigns
  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate metrics
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalLeads = campaigns.reduce((sum, c) => sum + c.qualifiedLeads, 0);
  const totalQualified = campaigns.reduce((sum, c) => sum + c.qualifiedLeads, 0);
  const totalAssigned = campaigns.reduce((sum, c) => sum + c.assignedLeads, 0);

  const handleCreateCampaign = (payload: CreateCampaignPayload) => {
    // In real app, this would call an API
    const newCampaign: Campaign = {
      id: `campaign-${Date.now()}`,
      ...payload,
      status: 'draft',
      qualifiedLeads: 0,
      assignedLeads: 0,
      rejectedLeads: 0,
      createdBy: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setCampaigns([newCampaign, ...campaigns]);
    setShowCreateModal(false);
    showToast({ title: 'Success', message: 'Campaign created successfully', type: 'success' });
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowCreateModal(true);
  };

  const handleStatusChange = (campaignId: string, status: CampaignStatus) => {
    setCampaigns(campaigns.map(c => 
      c.id === campaignId 
        ? { ...c, status, updatedAt: new Date().toISOString() }
        : c
    ));
    showToast({ title: 'Success', message: `Campaign ${status === 'active' ? 'resumed' : 'paused'}`, type: 'success' });
  };

  const handleArchiveCampaign = (campaignId: string) => {
    setCampaigns(campaigns.map(c => 
      c.id === campaignId 
        ? { ...c, status: 'archived' as CampaignStatus, updatedAt: new Date().toISOString() }
        : c
    ));
    showToast({ title: 'Success', message: 'Campaign archived', type: 'success' });
  };

  const handleViewCampaign = (campaignId: string) => {
    router.push(`/dashboard/campaigns/${campaignId}` as any);
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Campaigns</h1>
          <p className="text-gray-400">
            Manage lead generation campaigns and track performance
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedCampaign(null);
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm border border-blue-500/20 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mb-1">{activeCampaigns}</p>
          <p className="text-sm text-gray-400">Active Campaigns</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Target className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mb-1">{totalLeads.toLocaleString()}</p>
          <p className="text-sm text-gray-400">Total Leads</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-sm border border-green-500/20 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mb-1">{totalQualified.toLocaleString()}</p>
          <p className="text-sm text-gray-400">Qualified Leads</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 backdrop-blur-sm border border-yellow-500/20 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <Users className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mb-1">{totalAssigned.toLocaleString()}</p>
          <p className="text-sm text-gray-400">Assigned Leads</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative min-w-[160px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CampaignStatus | 'all')}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Campaign List */}
      <CampaignList
        campaigns={filteredCampaigns}
        onEdit={handleEditCampaign}
        onStatusChange={handleStatusChange}
        onArchive={handleArchiveCampaign}
        onView={handleViewCampaign}
      />

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <CreateCampaignModal
          campaign={selectedCampaign}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedCampaign(null);
          }}
          onSave={handleCreateCampaign}
        />
      )}
    </div>
  );
}

// Create Campaign Modal Component
interface CreateCampaignModalProps {
  campaign: Campaign | null;
  onClose: () => void;
  onSave: (payload: CreateCampaignPayload) => void;
}

function CreateCampaignModal({ campaign, onClose, onSave }: CreateCampaignModalProps) {
  const [name, setName] = useState(campaign?.name || '');
  const [description, setDescription] = useState(campaign?.description || '');
  const [targetCompanies, setTargetCompanies] = useState(campaign?.targetCompanies || 100);
  const [targetLeads, setTargetLeads] = useState(campaign?.targetLeads || 300);
  const [startDate, setStartDate] = useState(
    campaign?.startDate ? campaign.startDate.split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(campaign?.endDate ? campaign.endDate.split('T')[0] : '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) return;
    
    onSave({
      name,
      description,
      targetCompanies,
      targetLeads,
      startDate: new Date(startDate).toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
    });
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={campaign ? 'Edit Campaign' : 'Create New Campaign'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Campaign Name *
          </label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Q1 2024 Tech Startups"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the campaign goals and target audience..."
            rows={3}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target Companies *
            </label>
            <Input
              type="number"
              value={targetCompanies}
              onChange={(e) => setTargetCompanies(Number(e.target.value))}
              min={1}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target Leads *
            </label>
            <Input
              type="number"
              value={targetLeads}
              onChange={(e) => setTargetLeads(Number(e.target.value))}
              min={1}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Start Date *
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              End Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1">
            {campaign ? 'Save Changes' : 'Create Campaign'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
