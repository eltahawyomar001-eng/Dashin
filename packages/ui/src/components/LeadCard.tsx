import React from 'react';
import { Lead, LeadStatus, LeadPriority, QualificationScore } from '@dashin/shared-types';
import { Mail, Phone, Linkedin, ExternalLink, Building2, MapPin, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { format } from 'date-fns';

export interface LeadCardProps {
  lead: Lead;
  onQualify?: (leadId: string) => void;
  onReject?: (leadId: string) => void;
  onAssign?: (leadId: string) => void;
  onView?: (leadId: string) => void;
}

const getStatusColor = (status: LeadStatus): string => {
  const colors: Record<LeadStatus, string> = {
    new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    qualified: 'bg-green-500/10 text-green-400 border-green-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
    assigned: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    contacted: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    converted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };
  return colors[status] ?? colors.new;
};

const getPriorityColor = (priority: LeadPriority): string => {
  const colors: Record<LeadPriority, string> = {
    low: 'bg-gray-500/10 text-gray-400',
    medium: 'bg-blue-500/10 text-blue-400',
    high: 'bg-orange-500/10 text-orange-400',
    urgent: 'bg-red-500/10 text-red-400',
  };
  return colors[priority] ?? colors.medium;
};

const getStatusLabel = (status: LeadStatus): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getPriorityLabel = (priority: LeadPriority): string => {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
};

export const QualificationBadge: React.FC<{ score: QualificationScore }> = ({ score }) => {
  const colors: Record<QualificationScore, string> = {
    1: 'bg-red-500/10 text-red-400',
    2: 'bg-orange-500/10 text-orange-400',
    3: 'bg-yellow-500/10 text-yellow-400',
    4: 'bg-green-500/10 text-green-400',
    5: 'bg-emerald-500/10 text-emerald-400',
  };

  const labels: Record<QualificationScore, string> = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${colors[score] || colors[3]}`}>
      <span className="font-bold">{score}</span>
      <span>/5</span>
      <span className="ml-1">• {labels[score] || 'Good'}</span>
    </span>
  );
};

export const PriorityIndicator: React.FC<{ priority: LeadPriority }> = ({ priority }) => {
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(priority)}`}>
      {getPriorityLabel(priority)}
    </span>
  );
};

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  onQualify,
  onReject,
  onAssign,
  onView,
}) => {
  return (
    <div 
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all cursor-pointer"
      onClick={() => onView?.(lead.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">
            {lead.firstName} {lead.lastName}
          </h3>
          {lead.title && (
            <p className="text-sm text-gray-400">{lead.title}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <PriorityIndicator priority={lead.priority} />
          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(lead.status)}`}>
            {getStatusLabel(lead.status)}
          </span>
        </div>
      </div>

      {/* Company Info */}
      <div className="space-y-2 mb-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2 text-sm">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span className="text-white font-medium">{lead.company.name}</span>
          {lead.company.industry && (
            <span className="text-gray-400">• {lead.company.industry}</span>
          )}
        </div>
        
        {lead.company.location && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <MapPin className="w-4 h-4" />
            <span>{lead.company.location}</span>
          </div>
        )}
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        {lead.contact.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-gray-400" />
            <a 
              href={`mailto:${lead.contact.email}`}
              className="text-blue-400 hover:text-blue-300"
              onClick={(e) => e.stopPropagation()}
            >
              {lead.contact.email}
            </a>
          </div>
        )}
        
        {lead.contact.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-gray-400" />
            <a 
              href={`tel:${lead.contact.phone}`}
              className="text-blue-400 hover:text-blue-300"
              onClick={(e) => e.stopPropagation()}
            >
              {lead.contact.phone}
            </a>
          </div>
        )}
        
        {lead.contact.linkedin && (
          <div className="flex items-center gap-2 text-sm">
            <Linkedin className="w-4 h-4 text-gray-400" />
            <a 
              href={lead.contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              LinkedIn Profile
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Qualification */}
      {lead.qualification && (
        <div className="mb-4 p-3 bg-white/5 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Qualification Score</span>
            <QualificationBadge score={lead.qualification.score} />
          </div>
          {lead.qualification.notes && (
            <p className="text-sm text-gray-300 line-clamp-2">{lead.qualification.notes}</p>
          )}
        </div>
      )}

      {/* Assignment */}
      {lead.assignedTo && (
        <div className="mb-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300">Assigned to {lead.assignedToEmail}</span>
          </div>
          {lead.assignedAt && (
            <p className="text-xs text-purple-400 mt-1">
              {format(new Date(lead.assignedAt), 'MMM d, h:mm a')}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      {lead.status === 'new' && (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {onQualify && (
            <button
              onClick={() => onQualify(lead.id)}
              className="flex-1 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Qualify
            </button>
          )}
          {onReject && (
            <button
              onClick={() => onReject(lead.id)}
              className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          )}
        </div>
      )}

      {lead.status === 'qualified' && !lead.assignedTo && onAssign && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAssign(lead.id);
          }}
          className="w-full px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <User className="w-4 h-4" />
          Assign to Client
        </button>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {format(new Date(lead.createdAt), 'MMM d, h:mm a')}
        </span>
        <span className="text-gray-500">{lead.campaignName}</span>
      </div>
    </div>
  );
};

export interface LeadListProps {
  leads: Lead[];
  onQualify?: (leadId: string) => void;
  onReject?: (leadId: string) => void;
  onAssign?: (leadId: string) => void;
  onView?: (leadId: string) => void;
}

export const LeadList: React.FC<LeadListProps> = ({
  leads,
  onQualify,
  onReject,
  onAssign,
  onView,
}) => {
  if (leads.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No leads found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {leads.map((lead) => (
        <LeadCard
          key={lead.id}
          lead={lead}
          onQualify={onQualify}
          onReject={onReject}
          onAssign={onAssign}
          onView={onView}
        />
      ))}
    </div>
  );
};
