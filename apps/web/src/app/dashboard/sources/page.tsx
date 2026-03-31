'use client';

import { useState } from 'react';
import { Plus, Search, AlertCircle } from 'lucide-react';
import { Can } from '@dashin/rbac';
import {
  PageHeader,
  Container,
  Button,
  Input,
  DataSourceList,
  Modal,
  EmptyState,
  Spinner,
  useToast,
} from '@dashin/ui';
import {
  useDataSources,
  useDeleteDataSource,
  useToggleDataSourceStatus,
} from '../../../hooks/useDataSources';

export default function DataSourcesPage() {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sourceToDeleteId, setSourceToDeleteId] = useState<string | null>(null);
  const [sourceToDeleteName, setSourceToDeleteName] = useState('');

  // Real data from Supabase
  const { data: sourcesData, isLoading, isError, error } = useDataSources({
    search: searchQuery || undefined,
    type: filterType !== 'all' ? (filterType as any) : undefined,
    status: filterStatus !== 'all' ? (filterStatus as any) : undefined,
  });
  const deleteMutation = useDeleteDataSource();
  const toggleStatusMutation = useToggleDataSourceStatus();

  const dataSources = sourcesData?.data ?? [];

  const handleEdit = (dataSource: any) => {
    showToast({
      type: 'info',
      title: 'Edit Data Source',
      message: `Editing ${dataSource.name} — full editor coming soon.`,
    });
  };

  const handleDelete = (dataSource: any) => {
    setSourceToDeleteId(dataSource.id);
    setSourceToDeleteName(dataSource.name);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (sourceToDeleteId) {
      deleteMutation.mutate(sourceToDeleteId);
      setDeleteDialogOpen(false);
      setSourceToDeleteId(null);
    }
  };

  const handleRun = (dataSource: any) => {
    showToast({
      type: 'info',
      title: 'Scraping Job Started',
      message: `Started scraping ${dataSource.name}`,
    });
  };

  const handleToggleStatus = (dataSource: any) => {
    toggleStatusMutation.mutate({
      id: dataSource.id,
      currentStatus: dataSource.status,
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

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search data sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
        >
          <option value="all">All Types</option>
          <option value="website">Website</option>
          <option value="api">API</option>
          <option value="social_media">Social Media</option>
          <option value="database">Database</option>
          <option value="file">File</option>
          <option value="linkedin">LinkedIn</option>
          <option value="apollo">Apollo</option>
          <option value="zoominfo">ZoomInfo</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="error">Error</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="glass-panel p-8 rounded-xl text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Failed to load data sources</h3>
          <p className="text-slate-400">{(error as Error)?.message ?? 'Unknown error'}</p>
        </div>
      )}

      {/* Data Source List */}
      {!isLoading && !isError && dataSources.length > 0 && (
        <DataSourceList
          dataSources={dataSources as any}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRun={handleRun}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* Empty State */}
      {!isLoading && !isError && dataSources.length === 0 && (
        <EmptyState
          title="No data sources found"
          description={
            searchQuery
              ? 'Try adjusting your search or filters'
              : 'Add your first data source to start collecting data'
          }
          action={
            !searchQuery ? (
              <Can permission="datasources:create" fallback={null}>
                <Button variant="primary" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Data Source
                </Button>
              </Can>
            ) : undefined
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteDialogOpen && (
        <Modal
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          title="Delete Data Source"
        >
          <div className="space-y-4">
            <p className="text-slate-300">
              Are you sure you want to delete <strong>{sourceToDeleteName}</strong>? This will also
              remove all associated scraping jobs.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Container>
  );
}
