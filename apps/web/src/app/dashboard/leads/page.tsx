'use client';

import { useState } from 'react';
import { Lead, LeadStatus, LeadPriority } from '@dashin/shared-types';
import { Input, Modal, Button, useToast, LeadQualificationForm, QualificationFormData, QualificationBadge, PriorityIndicator } from '@dashin/ui';
import { Search, Download, CheckCircle, XCircle, User as UserIcon, Mail, Building2 } from 'lucide-react';

// Mock data
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
    campaignId: '2',
    campaignName: 'Enterprise SaaS Expansion',
    status: 'qualified',
    priority: 'urgent',
    firstName: 'Michael',
    lastName: 'Chen',
    title: 'CTO',
    contact: {
      email: 'michael.chen@dataflow.com',
      phone: '+1-555-0456',
    },
    company: {
      name: 'DataFlow Systems',
      industry: 'Enterprise Software',
      size: '200-500',
      location: 'New York, NY',
    },
    source: {
      type: 'import',
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
  {
    id: '3',
    campaignId: '2',
    campaignName: 'Enterprise SaaS Expansion',
    status: 'assigned',
    priority: 'medium',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    title: 'Director of Operations',
    contact: {
      email: 'e.rodriguez@cloudventures.com',
    },
    company: {
      name: 'CloudVentures',
      industry: 'Cloud Computing',
      size: '500+',
      location: 'Austin, TX',
    },
    source: {
      type: 'scraping',
      dataSourceName: 'Apollo.io',
    },
    qualification: {
      score: 4,
      criteria: {
        companySize: 'match',
        industry: 'match',
        location: 'match',
        budget: 'sufficient',
        authority: 'influencer',
        need: 'immediate',
        timing: 'quarter',
      },
      notes: 'Strong interest, needs approval from exec team',
      qualifiedBy: 'user-2',
      qualifiedAt: '2024-01-22T11:00:00Z',
    },
    assignedTo: 'client-user-1',
    assignedToEmail: 'sales@clientcompany.com',
    assignedAt: '2024-01-22T15:00:00Z',
    createdBy: 'user-2',
    createdAt: '2024-01-21T08:00:00Z',
    updatedAt: '2024-01-22T15:00:00Z',
  },
  {
    id: '4',
    campaignId: '1',
    campaignName: 'Q1 2024 Tech Startups',
    status: 'rejected',
    priority: 'low',
    firstName: 'David',
    lastName: 'Park',
    title: 'Software Engineer',
    contact: {
      email: 'david@smallstartup.com',
    },
    company: {
      name: 'SmallStartup Co',
      industry: 'Technology',
      size: '1-10',
      location: 'Remote',
    },
    source: {
      type: 'manual',
    },
    qualification: {
      score: 1,
      criteria: {
        companySize: 'too_small',
        industry: 'match',
        location: 'mismatch',
        budget: 'insufficient',
        authority: 'gatekeeper',
        need: 'none',
        timing: 'unknown',
      },
      notes: 'Company too small, no budget available',
      rejectionReason: 'Company size mismatch',
      qualifiedBy: 'user-1',
      qualifiedAt: '2024-01-20T16:00:00Z',
    },
    createdBy: 'user-1',
    createdAt: '2024-01-20T14:00:00Z',
    updatedAt: '2024-01-20T16:00:00Z',
  },
];

export default function LeadsPage() {
  const { showToast } = useToast();
  
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<LeadPriority | 'all'>('all');
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [qualifyingLead, setQualifyingLead] = useState<Lead | null>(null);

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contact.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate metrics
  const newLeads = leads.filter(l => l.status === 'new').length;
  const qualifiedLeads = leads.filter(l => l.status === 'qualified').length;
  const assignedLeads = leads.filter(l => l.status === 'assigned').length;
  const rejectedLeads = leads.filter(l => l.status === 'rejected').length;

  const toggleSelectLead = (leadId: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map(l => l.id)));
    }
  };

  const handleQualifyLead = (data: QualificationFormData) => {
    if (!qualifyingLead) return;

    setLeads(leads.map(l => 
      l.id === qualifyingLead.id
        ? {
            ...l,
            status: 'qualified' as LeadStatus,
            qualification: {
              ...data,
              qualifiedBy: 'current-user',
              qualifiedAt: new Date().toISOString(),
            },
            updatedAt: new Date().toISOString(),
          }
        : l
    ));
    setQualifyingLead(null);
    showToast({ title: 'Success', message: 'Lead qualified successfully', type: 'success' });
  };

  const handleRejectLead = (data: QualificationFormData) => {
    if (!qualifyingLead) return;

    setLeads(leads.map(l => 
      l.id === qualifyingLead.id
        ? {
            ...l,
            status: 'rejected' as LeadStatus,
            qualification: {
              ...data,
              qualifiedBy: 'current-user',
              qualifiedAt: new Date().toISOString(),
            },
            updatedAt: new Date().toISOString(),
          }
        : l
    ));
    setQualifyingLead(null);
    showToast({ title: 'Success', message: 'Lead rejected', type: 'info' });
  };

  const handleBulkQualify = () => {
    const idsToQualify = Array.from(selectedLeads);
    setLeads(leads.map(l => 
      idsToQualify.includes(l.id) && l.status === 'new'
        ? { ...l, status: 'qualified' as LeadStatus, updatedAt: new Date().toISOString() }
        : l
    ));
    setSelectedLeads(new Set());
    showToast({ title: 'Success', message: `${idsToQualify.length} leads qualified`, type: 'success' });
  };

  const handleBulkReject = () => {
    const idsToReject = Array.from(selectedLeads);
    setLeads(leads.map(l => 
      idsToReject.includes(l.id) && l.status === 'new'
        ? { ...l, status: 'rejected' as LeadStatus, updatedAt: new Date().toISOString() }
        : l
    ));
    setSelectedLeads(new Set());
    showToast({ title: 'Success', message: `${idsToReject.length} leads rejected`, type: 'info' });
  };

  const handleExport = () => {
    showToast({ title: 'Export', message: 'Export functionality coming soon', type: 'info' });
  };

  const getStatusColor = (status: LeadStatus): string => {
    const colors: Record<LeadStatus, string> = {
      new: 'text-blue-400',
      qualified: 'text-green-400',
      rejected: 'text-red-400',
      assigned: 'text-purple-400',
      contacted: 'text-yellow-400',
      converted: 'text-emerald-400',
    };
    return colors[status] || 'text-gray-400';
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Leads</h1>
          <p className="text-gray-400">
            Qualify and manage leads from all campaigns
          </p>
        </div>
        <Button onClick={handleExport} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm border border-blue-500/20 rounded-lg p-6">
          <p className="text-2xl font-bold text-white mb-1">{newLeads}</p>
          <p className="text-sm text-gray-400">New Leads</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-sm border border-green-500/20 rounded-lg p-6">
          <p className="text-2xl font-bold text-white mb-1">{qualifiedLeads}</p>
          <p className="text-sm text-gray-400">Qualified</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
          <p className="text-2xl font-bold text-white mb-1">{assignedLeads}</p>
          <p className="text-sm text-gray-400">Assigned</p>
        </div>

        <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 backdrop-blur-sm border border-red-500/20 rounded-lg p-6">
          <p className="text-2xl font-bold text-white mb-1">{rejectedLeads}</p>
          <p className="text-sm text-gray-400">Rejected</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LeadStatus | 'all')}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="qualified">Qualified</option>
            <option value="rejected">Rejected</option>
            <option value="assigned">Assigned</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as LeadPriority | 'all')}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedLeads.size > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-center justify-between">
          <span className="text-white">{selectedLeads.size} leads selected</span>
          <div className="flex gap-2">
            <Button onClick={handleBulkQualify} size="sm" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Qualify
            </Button>
            <Button onClick={handleBulkReject} size="sm" variant="danger" className="flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Reject
            </Button>
          </div>
        </div>
      )}

      {/* Leads Table */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Lead</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Company</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Campaign</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Priority</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Score</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedLeads.has(lead.id)}
                      onChange={() => toggleSelectLead(lead.id)}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <UserIcon className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {lead.firstName} {lead.lastName}
                        </p>
                        <p className="text-xs text-gray-400">{lead.title}</p>
                        {lead.contact.email && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Mail className="w-3 h-3" />
                            {lead.contact.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-white">{lead.company.name}</p>
                        <p className="text-xs text-gray-400">{lead.company.industry}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-300">{lead.campaignName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium capitalize ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <PriorityIndicator priority={lead.priority} />
                  </td>
                  <td className="px-6 py-4">
                    {lead.qualification?.score && (
                      <QualificationBadge score={lead.qualification.score} />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {lead.status === 'new' && (
                      <Button
                        size="sm"
                        onClick={() => setQualifyingLead(lead)}
                      >
                        Qualify
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Qualification Modal */}
      {qualifyingLead && (
        <Modal
          isOpen={true}
          onClose={() => setQualifyingLead(null)}
          title="Qualify Lead"
        >
          <LeadQualificationForm
            leadId={qualifyingLead.id}
            leadName={`${qualifyingLead.firstName} ${qualifyingLead.lastName}`}
            onApprove={handleQualifyLead}
            onReject={handleRejectLead}
            onCancel={() => setQualifyingLead(null)}
          />
        </Modal>
      )}
    </div>
  );
}
