// Query key factories for React Query
// These provide consistent query keys across the application

export const campaignKeys = {
  all: ['campaigns'] as const,
  lists: () => [...campaignKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) =>
    [...campaignKeys.lists(), filters] as const,
  details: () => [...campaignKeys.all, 'detail'] as const,
  detail: (id: string) => [...campaignKeys.details(), id] as const,
  analytics: (id: string) => [...campaignKeys.all, 'analytics', id] as const,
};

export const leadKeys = {
  all: ['leads'] as const,
  lists: () => [...leadKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...leadKeys.lists(), filters] as const,
  details: () => [...leadKeys.all, 'detail'] as const,
  detail: (id: string) => [...leadKeys.details(), id] as const,
};

export const analyticsKeys = {
  all: ['analytics'] as const,
  overview: ['analytics', 'overview'] as const,
  campaigns: () => [...analyticsKeys.all, 'campaigns'] as const,
  campaign: (id: string, dateRange?: { from: string; to: string }) =>
    [...analyticsKeys.campaigns(), id, dateRange] as const,
  leads: () => [...analyticsKeys.all, 'leads'] as const,
  lead: (dateRange?: { from: string; to: string }) =>
    [...analyticsKeys.leads(), dateRange] as const,
};

export const dataSourceKeys = {
  all: ['dataSources'] as const,
  lists: () => [...dataSourceKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) =>
    [...dataSourceKeys.lists(), filters] as const,
  details: () => [...dataSourceKeys.all, 'detail'] as const,
  detail: (id: string) => [...dataSourceKeys.details(), id] as const,
};

export const scrapingJobKeys = {
  all: ['scrapingJobs'] as const,
  lists: () => [...scrapingJobKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) =>
    [...scrapingJobKeys.lists(), filters] as const,
  details: () => [...scrapingJobKeys.all, 'detail'] as const,
  detail: (id: string) => [...scrapingJobKeys.details(), id] as const,
  logs: (id: string) => [...scrapingJobKeys.all, 'logs', id] as const,
};
