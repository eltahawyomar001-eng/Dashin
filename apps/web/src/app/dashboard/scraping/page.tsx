'use client';

import { useState } from 'react';
import { Card, CardContent, Button, Input, Badge } from '@dashin/ui';
import { Search, Plus, Play, Pause, Trash2, Globe, Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Can } from '@dashin/rbac';

interface ScrapingJob {
  id: string;
  name: string;
  url: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  recordsFound: number;
  lastRun?: string;
  nextRun?: string;
}

const MOCK_JOBS: ScrapingJob[] = [
  {
    id: '1',
    name: 'LinkedIn Sales Navigator - Tech Companies',
    url: 'https://linkedin.com/sales/search/...',
    status: 'running',
    progress: 67,
    recordsFound: 342,
    lastRun: '2024-02-04T10:00:00Z',
  },
  {
    id: '2',
    name: 'Crunchbase - Series A Startups',
    url: 'https://crunchbase.com/search/...',
    status: 'completed',
    progress: 100,
    recordsFound: 1289,
    lastRun: '2024-02-04T08:30:00Z',
  },
  {
    id: '3',
    name: 'Apollo.io - Healthcare Executives',
    url: 'https://apollo.io/search/...',
    status: 'pending',
    progress: 0,
    recordsFound: 0,
    nextRun: '2024-02-04T14:00:00Z',
  },
  {
    id: '4',
    name: 'ZoomInfo - Enterprise Contacts',
    url: 'https://zoominfo.com/search/...',
    status: 'failed',
    progress: 23,
    recordsFound: 89,
    lastRun: '2024-02-04T09:15:00Z',
  },
];

export default function ScrapingPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredJobs = MOCK_JOBS.filter(job =>
    job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: ScrapingJob['status']) => {
    switch (status) {
      case 'running':
        return <Loader className="h-4 w-4 animate-spin text-blue-400" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: ScrapingJob['status']) => {
    const variants = {
      running: 'info',
      completed: 'success',
      failed: 'danger',
      pending: 'default',
    } as const;
    return variants[status];
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Search className="h-6 w-6 md:h-8 md:w-8 text-primary-400" />
            Web Scraping
          </h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">Automated data collection from web sources</p>
        </div>
        <Can permission="scrape:create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Scraping Job
          </Button>
        </Can>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Jobs</p>
                <p className="text-3xl font-bold text-white mt-1">{MOCK_JOBS.length}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary-500/20 flex items-center justify-center">
                <Search className="h-6 w-6 text-primary-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Running</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {MOCK_JOBS.filter(j => j.status === 'running').length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Play className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Completed</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {MOCK_JOBS.filter(j => j.status === 'completed').length}
                </p>
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
                <p className="text-slate-400 text-sm">Records Found</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {MOCK_JOBS.reduce((sum, j) => sum + j.recordsFound, 0).toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-accent-500/20 flex items-center justify-center">
                <Globe className="h-6 w-6 text-accent-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card variant="glass">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search scraping jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scraping Jobs List */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <Card key={job.id} variant="glass">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(job.status)}
                    <h3 className="text-lg font-semibold text-white">{job.name}</h3>
                    <Badge variant={getStatusBadge(job.status)}>
                      {job.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                    <Globe className="h-4 w-4" />
                    <span className="truncate">{job.url}</span>
                  </div>

                  {job.status === 'running' && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-white font-medium">{job.progress}%</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-300"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Records:</span>
                      <span className="text-white font-medium">{job.recordsFound.toLocaleString()}</span>
                    </div>
                    {job.lastRun && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Last run:</span>
                        <span className="text-white font-medium">
                          {new Date(job.lastRun).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {job.nextRun && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Next run:</span>
                        <span className="text-white font-medium">
                          {new Date(job.nextRun).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Can permission="scrape:create">
                    {job.status === 'pending' && (
                      <Button variant="ghost" size="sm">
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    {job.status === 'running' && (
                      <Button variant="ghost" size="sm">
                        <Pause className="h-4 w-4" />
                      </Button>
                    )}
                  </Can>
                  <Can permission="scrape:create">
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

      {filteredJobs.length === 0 && (
        <Card variant="glass">
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No scraping jobs found</h3>
            <p className="text-slate-400 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first scraping job to get started'}
            </p>
            <Can permission="scrape:create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Scraping Job
              </Button>
            </Can>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
