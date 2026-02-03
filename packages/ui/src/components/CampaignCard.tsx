import React from 'react';
import { Campaign, CampaignStatus } from '@dashin/shared-types';
import { Calendar, Target, Users, TrendingUp, MoreVertical, Play, Pause, Archive, Edit } from 'lucide-react';
import { format } from 'date-fns';

export interface CampaignCardProps {
  campaign: Campaign;
  onEdit?: (campaign: Campaign) => void;
  onStatusChange?: (campaignId: string, status: CampaignStatus) => void;
  onArchive?: (campaignId: string) => void;
  onView?: (campaignId: string) => void;
}

const getStatusColor = (status: CampaignStatus): string => {
  const colors: Record<CampaignStatus, string> = {
    draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    active: 'bg-green-500/10 text-green-400 border-green-500/20',
    paused: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    archived: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };
  return (colors[status] || colors.draft) as string;
};

const getStatusLabel = (status: CampaignStatus): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onEdit,
  onStatusChange,
  onArchive,
  onView,
}) => {
  const [showActions, setShowActions] = React.useState(false);
  
  const qualificationRate = campaign.targetLeads > 0 
    ? Math.round((campaign.qualifiedLeads / campaign.targetLeads) * 100) 
    : 0;

  const progressPercentage = campaign.targetLeads > 0
    ? Math.min(Math.round((campaign.qualifiedLeads / campaign.targetLeads) * 100), 100)
    : 0;

  return (
    <div 
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all cursor-pointer"
      onClick={() => onView?.(campaign.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{campaign.name}</h3>
          {campaign.description && (
            <p className="text-sm text-gray-400 line-clamp-2">{campaign.description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(campaign.status)}`}>
            {getStatusLabel(campaign.status)}
          </span>
          
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
            
            {showActions && (
              <div 
                className="absolute right-0 mt-2 w-48 bg-gray-800 border border-white/10 rounded-lg shadow-xl z-10"
                onClick={(e) => e.stopPropagation()}
              >
                {onEdit && (
                  <button
                    onClick={() => {
                      onEdit(campaign);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-white/10 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Campaign
                  </button>
                )}
                
                {onStatusChange && campaign.status === 'active' && (
                  <button
                    onClick={() => {
                      onStatusChange(campaign.id, 'paused');
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-white/10 flex items-center gap-2"
                  >
                    <Pause className="w-4 h-4" />
                    Pause Campaign
                  </button>
                )}
                
                {onStatusChange && campaign.status === 'paused' && (
                  <button
                    onClick={() => {
                      onStatusChange(campaign.id, 'active');
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-white/10 flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Resume Campaign
                  </button>
                )}
                
                {onArchive && campaign.status !== 'archived' && (
                  <button
                    onClick={() => {
                      onArchive(campaign.id);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-sm text-left text-red-400 hover:bg-white/10 flex items-center gap-2"
                  >
                    <Archive className="w-4 h-4" />
                    Archive
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Progress</span>
          <span className="text-white font-medium">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Target className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Target Leads</p>
            <p className="text-lg font-semibold text-white">{campaign.targetLeads.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Users className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Qualified</p>
            <p className="text-lg font-semibold text-white">{campaign.qualifiedLeads.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Qualification Rate</p>
            <p className="text-lg font-semibold text-white">{qualificationRate}%</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-yellow-500/10 rounded-lg">
            <Calendar className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Started</p>
            <p className="text-sm font-medium text-white">
              {format(new Date(campaign.startDate), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
        <span>Updated {format(new Date(campaign.updatedAt), 'MMM d, h:mm a')}</span>
        <span>{campaign.assignedLeads} assigned</span>
      </div>
    </div>
  );
};

export interface CampaignListProps {
  campaigns: Campaign[];
  onEdit?: (campaign: Campaign) => void;
  onStatusChange?: (campaignId: string, status: CampaignStatus) => void;
  onArchive?: (campaignId: string) => void;
  onView?: (campaignId: string) => void;
}

export const CampaignList: React.FC<CampaignListProps> = ({
  campaigns,
  onEdit,
  onStatusChange,
  onArchive,
  onView,
}) => {
  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No campaigns found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {campaigns.map((campaign) => (
        <CampaignCard
          key={campaign.id}
          campaign={campaign}
          onEdit={onEdit}
          onStatusChange={onStatusChange}
          onArchive={onArchive}
          onView={onView}
        />
      ))}
    </div>
  );
};
