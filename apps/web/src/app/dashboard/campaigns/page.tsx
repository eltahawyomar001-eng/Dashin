'use client';

import { useState } from 'react';
import { CampaignStatus, CreateCampaignPayload } from '@dashin/shared-types';
import { CampaignList, Input, Modal, Button } from '@dashin/ui';
import { Plus, Search, Filter, TrendingUp, Target, Users, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCampaigns, useCreateCampaign, useUpdateCampaignStatus } from '../../../hooks/useCampaigns';
import { CampaignListSkeleton } from '../../../components/campaigns/CampaignListSkeleton';

export default function CampaignsPage() {
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch campaigns with filters
  const { data: campaignsResponse, isLoading } = useCampaigns({
    page: 1,
    pageSize: 50,
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchTerm || undefined,
  });

  // Mutations
  const createCampaign = useCreateCampaign();
  const updateStatus = useUpdateCampaignStatus();

  const campaigns = campaignsResponse?.data || [];

  // Calculate metrics from loaded campaigns
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalLeads = campaigns.reduce((sum, c) => sum + c.qualifiedLeads, 0);
  const totalQualified = campaigns.reduce((sum, c) => sum + c.qualifiedLeads, 0);
  const totalAssigned = campaigns.reduce((sum, c) => sum + c.assignedLeads, 0);

  const handleCreateCampaign = async (payload: CreateCampaignPayload) => {
    await createCampaign.mutateAsync(payload);
    setShowCreateModal(false);
  };

  const handleStatusChange = async (campaignId: string, status: CampaignStatus) => {
    await updateStatus.mutateAsync({ id: campaignId, status });
  };

  const handleArchiveCampaign = async (campaignId: string) => {
    await updateStatus.mutateAsync({ id: campaignId, status: 'archived' });
  };

  const handleViewCampaign = (campaignId: string) => {
    router.push(`/dashboard/campaigns/${campaignId}` as any);
  };

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Campaigns</h1>
            <p className="text-gray-400">Loading campaigns...</p>
          </div>
        </div>
        <CampaignListSkeleton />
      </div>
    );
  }

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
          onClick={() => setShowCreateModal(true)}
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
        campaigns={campaigns}
        onStatusChange={handleStatusChange}
        onArchive={handleArchiveCampaign}
        onView={handleViewCampaign}
      />

      {/* Create Modal */}
      {showCreateModal && (
        <CreateCampaignModal
          onClose={() => {
            setShowCreateModal(false);
          }}
          onSave={handleCreateCampaign}
        />
      )}
    </div>
  );
}

// Create Campaign Modal Component
interface CreateCampaignModalProps {
  onClose: () => void;
  onSave: (payload: CreateCampaignPayload) => void;
}

function CreateCampaignModal({ onClose, onSave }: CreateCampaignModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetCompanies, setTargetCompanies] = useState(100);
  const [targetLeads, setTargetLeads] = useState(300);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');

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
    <Modal isOpen={true} onClose={onClose} title="Create New Campaign">
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
            Create Campaign
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
