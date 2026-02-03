'use client';

import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Clock,
  Mail,
  Plus,
  Play,
  Edit,
  Trash2,
  FileSpreadsheet,
  FileJson,
  Copy,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';

/**
 * Reports Page
 * 
 * Report templates, custom report builder, scheduled reports management,
 * and report history with export capabilities.
 */

// Report Template
interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  metrics: string[];
  charts: string[];
  category: 'campaign' | 'lead' | 'source' | 'overview';
}

// Scheduled Report
interface ScheduledReport {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  nextRun: string;
  recipients: string[];
  format: 'pdf' | 'csv' | 'xlsx' | 'json';
  status: 'active' | 'paused' | 'error';
  lastRun?: string;
}

// Generated Report
interface GeneratedReport {
  id: string;
  name: string;
  type: string;
  generatedAt: string;
  generatedBy: string;
  format: 'pdf' | 'csv' | 'xlsx' | 'json';
  size: string;
  status: 'completed' | 'processing' | 'failed';
}

// Mock Data
const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'campaign-performance',
    name: 'Campaign Performance',
    description: 'Comprehensive campaign metrics including leads, conversions, and ROI',
    icon: <FileText size={24} />,
    metrics: ['Total Leads', 'Qualified Leads', 'Conversion Rate', 'Cost per Lead'],
    charts: ['Lead Trends', 'Source Breakdown', 'Qualification Funnel'],
    category: 'campaign',
  },
  {
    id: 'lead-quality',
    name: 'Lead Quality Analysis',
    description: 'Deep dive into lead scoring, qualification criteria, and conversion patterns',
    icon: <FileSpreadsheet size={24} />,
    metrics: ['Avg Score', 'Qualification Rate', 'Time to Qualify', 'Source Effectiveness'],
    charts: ['Score Distribution', 'Criteria Analysis', 'Priority Breakdown'],
    category: 'lead',
  },
  {
    id: 'source-analysis',
    name: 'Source Effectiveness',
    description: 'Data source performance comparison with lead quality metrics',
    icon: <FileJson size={24} />,
    metrics: ['Sources Active', 'Leads per Source', 'Quality Score', 'Cost Efficiency'],
    charts: ['Source Comparison', 'Quality Trends', 'Volume vs Quality'],
    category: 'source',
  },
  {
    id: 'executive-summary',
    name: 'Executive Summary',
    description: 'High-level overview of key performance indicators and trends',
    icon: <FileText size={24} />,
    metrics: ['Total Revenue', 'Growth Rate', 'Customer Acquisition', 'Pipeline Value'],
    charts: ['Revenue Trends', 'KPI Overview', 'Goal Progress'],
    category: 'overview',
  },
];

const SCHEDULED_REPORTS: ScheduledReport[] = [
  {
    id: 'sr-1',
    name: 'Weekly Campaign Summary',
    frequency: 'weekly',
    nextRun: '2025-02-10T09:00:00Z',
    recipients: ['team@company.com', 'manager@company.com'],
    format: 'pdf',
    status: 'active',
    lastRun: '2025-02-03T09:00:00Z',
  },
  {
    id: 'sr-2',
    name: 'Daily Lead Report',
    frequency: 'daily',
    nextRun: '2025-02-04T08:00:00Z',
    recipients: ['sales@company.com'],
    format: 'csv',
    status: 'active',
    lastRun: '2025-02-03T08:00:00Z',
  },
  {
    id: 'sr-3',
    name: 'Monthly Executive Dashboard',
    frequency: 'monthly',
    nextRun: '2025-03-01T10:00:00Z',
    recipients: ['executives@company.com'],
    format: 'pdf',
    status: 'active',
    lastRun: '2025-02-01T10:00:00Z',
  },
  {
    id: 'sr-4',
    name: 'Quarterly Performance Review',
    frequency: 'quarterly',
    nextRun: '2025-04-01T09:00:00Z',
    recipients: ['board@company.com'],
    format: 'xlsx',
    status: 'paused',
    lastRun: '2025-01-01T09:00:00Z',
  },
];

const GENERATED_REPORTS: GeneratedReport[] = [
  {
    id: 'gr-1',
    name: 'Campaign Performance - Q1 2025',
    type: 'Campaign Performance',
    generatedAt: '2025-02-03T14:30:00Z',
    generatedBy: 'admin@company.com',
    format: 'pdf',
    size: '2.4 MB',
    status: 'completed',
  },
  {
    id: 'gr-2',
    name: 'Lead Quality Analysis - January',
    type: 'Lead Quality Analysis',
    generatedAt: '2025-02-01T10:15:00Z',
    generatedBy: 'manager@company.com',
    format: 'xlsx',
    size: '1.8 MB',
    status: 'completed',
  },
  {
    id: 'gr-3',
    name: 'Source Effectiveness - Week 5',
    type: 'Source Effectiveness',
    generatedAt: '2025-02-03T08:00:00Z',
    generatedBy: 'analyst@company.com',
    format: 'csv',
    size: '512 KB',
    status: 'completed',
  },
  {
    id: 'gr-4',
    name: 'Executive Summary - February',
    type: 'Executive Summary',
    generatedAt: '2025-02-03T16:45:00Z',
    generatedBy: 'admin@company.com',
    format: 'pdf',
    size: '3.1 MB',
    status: 'processing',
  },
];

export default function ReportsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: 'active' | 'paused' | 'error' | 'completed' | 'processing' | 'failed') => {
    const badges = {
      active: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: <CheckCircle2 size={14} /> },
      paused: { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: <AlertCircle size={14} /> },
      error: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: <XCircle size={14} /> },
      completed: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: <CheckCircle2 size={14} /> },
      processing: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: <Clock size={14} /> },
      failed: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: <XCircle size={14} /> },
    };

    const badge = badges[status];
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
        {badge.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getFormatIcon = (format: 'pdf' | 'csv' | 'xlsx' | 'json') => {
    const icons = {
      pdf: <FileText size={16} className="text-red-400" />,
      csv: <FileSpreadsheet size={16} className="text-green-400" />,
      xlsx: <FileSpreadsheet size={16} className="text-green-500" />,
      json: <FileJson size={16} className="text-blue-400" />,
    };
    return icons[format];
  };

  const frequencyLabels = {
    daily: 'Every Day',
    weekly: 'Every Week',
    monthly: 'Every Month',
    quarterly: 'Every Quarter',
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Reports</h1>
          <p className="text-slate-400">
            Generate, schedule, and manage analytics reports
          </p>
        </div>

        <button
          onClick={() => alert('Schedule Report feature coming soon')}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
        >
          <Plus size={20} />
          Schedule Report
        </button>
      </div>

      {/* Report Templates */}
      <div className="glass rounded-2xl p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">Report Templates</h2>
          <p className="text-sm text-slate-400 mt-1">
            Pre-configured report templates for common analytics needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {REPORT_TEMPLATES.map((template) => (
            <div
              key={template.id}
              className={`glass-subtle border-2 rounded-xl p-4 cursor-pointer transition-all hover:border-primary-500/50 ${
                selectedTemplate === template.id
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-white/10 hover:bg-white/5'
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary-500/20 rounded-xl text-primary-400">
                  {template.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{template.name}</h3>
                </div>
              </div>

              <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                {template.description}
              </p>

              <div className="space-y-2">
                <div className="text-xs text-slate-500">
                  <span className="font-medium text-slate-400">Metrics:</span> {template.metrics.length}
                </div>
                <div className="text-xs text-slate-500">
                  <span className="font-medium text-slate-400">Charts:</span> {template.charts.length}
                </div>
              </div>

              <button
                className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-primary-500 text-white text-sm rounded-xl hover:bg-primary-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  alert(`Generating ${template.name} report...`);
                }}
              >
                <Play size={16} />
                Generate Now
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Scheduled Reports */}
      <div className="glass rounded-2xl p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">Scheduled Reports</h2>
          <p className="text-sm text-slate-400 mt-1">
            Automated reports delivered on a regular schedule
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">
                  Report Name
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">
                  Frequency
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">
                  Next Run
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">
                  Recipients
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">
                  Format
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {SCHEDULED_REPORTS.map((report) => (
                <tr key={report.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4">
                    <div className="font-medium text-white">{report.name}</div>
                    {report.lastRun && (
                      <div className="text-xs text-slate-500">
                        Last run: {formatDate(report.lastRun)}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Calendar size={16} className="text-slate-500" />
                      {frequencyLabels[report.frequency]}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Clock size={16} className="text-slate-500" />
                      {formatDate(report.nextRun)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Mail size={16} className="text-slate-500" />
                      {report.recipients.length} recipient{report.recipients.length !== 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {getFormatIcon(report.format)}
                      <span className="text-sm text-slate-300 uppercase">{report.format}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(report.status)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="p-1 text-slate-500 hover:text-primary-400 transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="p-1 text-slate-500 hover:text-green-400 transition-colors"
                        title="Run Now"
                      >
                        <Play size={16} />
                      </button>
                      <button
                        className="p-1 text-slate-500 hover:text-blue-400 transition-colors"
                        title="Duplicate"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generated Reports */}
      <div className="glass rounded-2xl p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">Recent Reports</h2>
          <p className="text-sm text-slate-400 mt-1">
            Previously generated reports available for download
          </p>
        </div>

        <div className="space-y-3">
          {GENERATED_REPORTS.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between p-4 glass-subtle rounded-xl hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="p-3 bg-white/10 rounded-xl">
                  {getFormatIcon(report.format)}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{report.name}</h3>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                    <span>{report.type}</span>
                    <span>•</span>
                    <span>{formatDate(report.generatedAt)}</span>
                    <span>•</span>
                    <span>by {report.generatedBy}</span>
                    <span>•</span>
                    <span>{report.size}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(report.status)}
                  
                  {report.status === 'completed' && (
                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white text-sm rounded-xl hover:bg-primary-600 transition-colors"
                      onClick={() => alert(`Downloading ${report.name}...`)}
                    >
                      <Download size={16} />
                      Download
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/10 rounded-xl">
              <FileText size={24} className="text-purple-400" />
            </div>
            <div>
              <div className="text-sm text-slate-400">Total Reports</div>
              <div className="text-2xl font-bold text-white">
                {GENERATED_REPORTS.length + SCHEDULED_REPORTS.length}
              </div>
            </div>
          </div>
          <div className="text-sm text-slate-400">
            {SCHEDULED_REPORTS.filter(r => r.status === 'active').length} scheduled, {GENERATED_REPORTS.filter(r => r.status === 'completed').length} completed
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/10 rounded-xl">
              <Calendar size={24} className="text-green-400" />
            </div>
            <div>
              <div className="text-sm text-slate-400">Next Report</div>
              <div className="text-2xl font-bold text-white">Today</div>
            </div>
          </div>
          <div className="text-sm text-slate-400">
            Daily Lead Report at 8:00 AM
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/10 rounded-xl">
              <Download size={24} className="text-blue-400" />
            </div>
            <div>
              <div className="text-sm text-slate-400">Total Downloads</div>
              <div className="text-2xl font-bold text-white">8.7 MB</div>
            </div>
          </div>
          <div className="text-sm text-slate-400">
            Across all generated reports
          </div>
        </div>
      </div>
    </div>
  );
}
