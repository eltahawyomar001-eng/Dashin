'use client';

import { useState } from 'react';
import { Card, CardContent, Button, Input, Badge } from '@dashin/ui';
import { Database, Filter, Download, Upload, Trash2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Can } from '@dashin/rbac';

interface DataRecord {
  id: string;
  source: string;
  status: 'pending' | 'validated' | 'rejected' | 'enriched';
  recordCount: number;
  validationScore: number;
  importedAt: string;
  processedAt?: string;
}

const MOCK_RECORDS: DataRecord[] = [
  {
    id: '1',
    source: 'LinkedIn Sales Navigator - Jan 2024',
    status: 'validated',
    recordCount: 1543,
    validationScore: 94,
    importedAt: '2024-02-01T10:00:00Z',
    processedAt: '2024-02-01T10:15:00Z',
  },
  {
    id: '2',
    source: 'Crunchbase Series A Export',
    status: 'enriched',
    recordCount: 892,
    validationScore: 98,
    importedAt: '2024-02-02T14:30:00Z',
    processedAt: '2024-02-02T15:00:00Z',
  },
  {
    id: '3',
    source: 'Apollo.io Healthcare Executives',
    status: 'pending',
    recordCount: 2341,
    validationScore: 0,
    importedAt: '2024-02-04T09:00:00Z',
  },
  {
    id: '4',
    source: 'ZoomInfo Enterprise List',
    status: 'rejected',
    recordCount: 456,
    validationScore: 42,
    importedAt: '2024-02-03T11:20:00Z',
    processedAt: '2024-02-03T11:45:00Z',
  },
];

export default function CleanroomPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<DataRecord['status'] | 'all'>('all');

  const filteredRecords = MOCK_RECORDS.filter(record => {
    const matchesSearch = record.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: DataRecord['status']) => {
    const variants = {
      validated: 'success',
      enriched: 'info',
      rejected: 'danger',
      pending: 'warning',
    } as const;
    return variants[status];
  };

  const getStatusIcon = (status: DataRecord['status']) => {
    switch (status) {
      case 'validated':
      case 'enriched':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <RefreshCw className="h-4 w-4 text-yellow-400 animate-spin" />;
    }
  };

  const totalRecords = MOCK_RECORDS.reduce((sum, r) => sum + r.recordCount, 0);
  const validatedRecords = MOCK_RECORDS.filter(r => r.status === 'validated' || r.status === 'enriched')
    .reduce((sum, r) => sum + r.recordCount, 0);
  const avgValidationScore = Math.round(
    MOCK_RECORDS.filter(r => r.validationScore > 0)
      .reduce((sum, r) => sum + r.validationScore, 0) / MOCK_RECORDS.filter(r => r.validationScore > 0).length
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Database className="h-6 w-6 md:h-8 md:w-8 text-primary-400" />
            Data Cleanroom
          </h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">Validate, enrich, and prepare data for campaigns</p>
        </div>
        <div className="flex items-center gap-3">
          <Can permission="datasources:create">
            <Button variant="secondary" className="gap-2">
              <Upload className="h-4 w-4" />
              Import Data
            </Button>
          </Can>
          <Can permission="datasources:view">
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              Export Clean Data
            </Button>
          </Can>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Records</p>
                <p className="text-3xl font-bold text-white mt-1">{totalRecords.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary-500/20 flex items-center justify-center">
                <Database className="h-6 w-6 text-primary-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Validated</p>
                <p className="text-3xl font-bold text-white mt-1">{validatedRecords.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Avg Quality</p>
                <p className="text-3xl font-bold text-white mt-1">{avgValidationScore}%</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Data Sources</p>
                <p className="text-3xl font-bold text-white mt-1">{MOCK_RECORDS.length}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-accent-500/20 flex items-center justify-center">
                <Filter className="h-6 w-6 text-accent-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card variant="glass">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Database className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search data sources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={statusFilter === 'all' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'validated' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setStatusFilter('validated')}
              >
                Validated
              </Button>
              <Button
                variant={statusFilter === 'enriched' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setStatusFilter('enriched')}
              >
                Enriched
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setStatusFilter('pending')}
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === 'rejected' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setStatusFilter('rejected')}
              >
                Rejected
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Records List */}
      <div className="space-y-4">
        {filteredRecords.map((record) => (
          <Card key={record.id} variant="glass">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {getStatusIcon(record.status)}
                    <h3 className="text-lg font-semibold text-white">{record.source}</h3>
                    <Badge variant={getStatusBadge(record.status)}>
                      {record.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-slate-400 text-sm">Records</p>
                      <p className="text-white font-medium">{record.recordCount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Quality Score</p>
                      <p className="text-white font-medium">
                        {record.validationScore > 0 ? `${record.validationScore}%` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Imported</p>
                      <p className="text-white font-medium">
                        {new Date(record.importedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {record.processedAt && (
                      <div>
                        <p className="text-slate-400 text-sm">Processed</p>
                        <p className="text-white font-medium">
                          {new Date(record.processedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {record.status === 'pending' && (
                    <div className="flex items-center gap-2 text-sm text-yellow-400">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Validation in progress...</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Can permission="datasources:view">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </Can>
                  <Can permission="datasources:delete">
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </Can>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRecords.length === 0 && (
        <Card variant="glass">
          <CardContent className="p-12 text-center">
            <Database className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No data records found</h3>
            <p className="text-slate-400 mb-6">
              {searchTerm ? 'Try adjusting your search or filters' : 'Import data to start cleaning and validating'}
            </p>
            <Can permission="datasources:create">
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>
            </Can>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
