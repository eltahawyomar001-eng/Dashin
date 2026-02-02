'use client';

import { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Can } from '@dashin/rbac';
import type { DataSource, DataSourceType, DataSourceStatus } from '@dashin/shared-types';
import {
  PageHeader,
  Container,
  Button,
  Input,
  DataSourceList,
  Modal,
  EmptyState,
  useToast,
} from '@dashin/ui';

// Mock data for demonstration
const MOCK_DATA_SOURCES: DataSource[] = [
  {
    id: '1',
    name: 'LinkedIn Company Profiles',
    description: 'Scrape company information and employee data from LinkedIn',
    type: 'social_media',
    status: 'active',
    config: {
      url: 'https://linkedin.com/company/*',
      method: 'GET',
      selectors: [],
      rateLimit: { requestsPerMinute: 30, delayBetweenRequests: 2000, respectRobotsTxt: true },
      javascriptEnabled: true,
      followRedirects: true,
      timeout: 30000,
      retryAttempts: 3,
      validateSSL: true,
    },
    frequency: 'daily',
    totalRecords: 1250,
    errorCount: 3,
    lastScrapedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    nextScheduledAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(), // 22 hours from now
    createdBy: 'user-1',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    name: 'Industry News API',
    description: 'Fetch latest news articles from TechCrunch API',
    type: 'api',
    status: 'active',
    config: {
      url: 'https://api.techcrunch.com/articles',
      method: 'GET',
      selectors: [],
      rateLimit: { requestsPerMinute: 60, delayBetweenRequests: 1000, respectRobotsTxt: true },
      javascriptEnabled: false,
      followRedirects: true,
      timeout: 15000,
      retryAttempts: 2,
      validateSSL: true,
    },
    frequency: 'hourly',
    totalRecords: 5420,
    errorCount: 0,
    lastScrapedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
    nextScheduledAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 mins from now
    createdBy: 'user-1',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    name: 'Competitor Pricing Pages',
    description: 'Monitor competitor pricing and feature updates',
    type: 'website',
    status: 'error',
    config: {
      url: 'https://competitor.com/pricing',
      method: 'GET',
      selectors: [],
      rateLimit: { requestsPerMinute: 20, delayBetweenRequests: 3000, respectRobotsTxt: true },
      javascriptEnabled: true,
      followRedirects: true,
      timeout: 30000,
      retryAttempts: 3,
      validateSSL: true,
    },
    frequency: 'weekly',
    totalRecords: 87,
    errorCount: 12,
    lastScrapedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    createdBy: 'user-1',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    name: 'Lead Generation Database',
    description: 'Import leads from PostgreSQL database',
    type: 'database',
    status: 'inactive',
    config: {
      url: 'postgresql://localhost:5432/leads',
      method: 'GET',
      selectors: [],
      rateLimit: { requestsPerMinute: 100, delayBetweenRequests: 500, respectRobotsTxt: false },
      javascriptEnabled: false,
      followRedirects: false,
      timeout: 60000,
      retryAttempts: 1,
      validateSSL: true,
    },
    frequency: 'once',
    totalRecords: 0,
    errorCount: 0,
    createdBy: 'user-1',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function DataSourcesPage() {
  const { showToast } = useToast();
  const [dataSources, setDataSources] = useState<DataSource[]>(MOCK_DATA_SOURCES);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<DataSourceType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<DataSourceStatus | 'all'>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState<DataSource | null>(null);

  // Filter data sources
  const filteredSources = dataSources.filter((source) => {
    const matchesSearch = source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || source.type === filterType;
    const matchesStatus = filterStatus === 'all' || source.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleEdit = (dataSource: DataSource) => {
    showToast({
      type: 'info',
      title: 'Edit Data Source',
      message: `Editing ${dataSource.name} (not yet implemented)`,
    });
  };

  const handleDelete = (dataSource: DataSource) => {
    setSourceToDelete(dataSource);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (sourceToDelete) {
      setDataSources(dataSources.filter((s) => s.id !== sourceToDelete.id));
      showToast({
        type: 'success',
        title: 'Data Source Deleted',
        message: `${sourceToDelete.name} has been removed`,
      });
      setDeleteDialogOpen(false);
      setSourceToDelete(null);
    }
  };

  const handleRun = (dataSource: DataSource) => {
    showToast({
      type: 'info',
      title: 'Scraping Job Started',
      message: `Started scraping ${dataSource.name}`,
    });
  };

  const handleToggleStatus = (dataSource: DataSource) => {
    const newStatus = dataSource.status === 'active' ? 'inactive' : 'active';
    setDataSources(dataSources.map((s) =>
      s.id === dataSource.id ? { ...s, status: newStatus } : s
    ));
    showToast({
      type: 'success',
      title: 'Status Updated',
      message: `${dataSource.name} is now ${newStatus}`,
    });
  };

  return (
    <Container>
      <PageHeader
        title="Data Sources"
        description="Manage your web scraping and data collection sources"
        actions={
          <Can permission="datasources:create" fallback={null}>
            <Button variant="primary" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Data Source
            </Button>
          </Can>
        }
      />

      {/* Filters */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search data sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as DataSourceType | 'all')}
          className="glass w-full rounded-xl px-4 py-3 text-white transition-all duration-200 focus-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-[url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyNCAyNCcgZmlsbD0nbm9uZScgc3Ryb2tlPSdjdXJyZW50Q29sb3InIHN0cm9rZS13aWR0aD0nMicgc3Ryb2tlLWxpbmVjYXA9J3JvdW5kJyBzdHJva2UtbGluZWpvaW49J3JvdW5kJz48cG9seWxpbmUgcG9pbnRzPSc2IDkgMTIgMTUgMTggOSc+PC9wb2x5bGluZT48L3N2Zz4=)] bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat pr-10"
        >
          <option value="all">All Types</option>
          <option value="website">Website</option>
          <option value="api">API</option>
          <option value="social_media">Social Media</option>
          <option value="database">Database</option>
          <option value="file">File</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as DataSourceStatus | 'all')}
          className="glass w-full rounded-xl px-4 py-3 text-white transition-all duration-200 focus-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-[url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyNCAyNCcgZmlsbD0nbm9uZScgc3Ryb2tlPSdjdXJyZW50Q29sb3InIHN0cm9rZS13aWR0aD0nMicgc3Ryb2tlLWxpbmVjYXA9J3JvdW5kJyBzdHJva2UtbGluZWpvaW49J3JvdW5kJz48cG9seWxpbmUgcG9pbnRzPSc2IDkgMTIgMTUgMTggOSc+PC9wb2x5bGluZT48L3N2Zz4=)] bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat pr-10"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="error">Error</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Data Source List */}
      {filteredSources.length === 0 ? (
        <EmptyState
          icon={<Filter className="h-16 w-16" />}
          title="No data sources found"
          description={
            searchQuery || filterType !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first data source to get started'
          }
        />
      ) : (
        <DataSourceList
          dataSources={filteredSources}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRun={handleRun}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Delete Data Source"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete Data Source
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-slate-300">
            Are you sure you want to delete <strong className="text-white">{sourceToDelete?.name}</strong>?
            This will also delete all associated scraping jobs and data.
          </p>
          <p className="text-sm text-slate-400">
            This action cannot be undone.
          </p>
        </div>
      </Modal>
    </Container>
  );
}
