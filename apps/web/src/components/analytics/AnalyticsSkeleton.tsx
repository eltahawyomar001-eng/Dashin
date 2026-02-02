import { Card, CardContent, Skeleton } from '@dashin/ui';

export function AnalyticsOverviewSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Chart */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-9 w-32 rounded" />
          </div>
          <Skeleton className="h-80 w-full rounded" />
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Chart */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-64 w-full rounded" />
          </CardContent>
        </Card>

        {/* Right Stats */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-36" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function CampaignAnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-7 w-16" />
              <div className="flex items-center gap-1">
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Chart */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-28 rounded" />
              <Skeleton className="h-9 w-28 rounded" />
            </div>
          </div>
          <Skeleton className="h-96 w-full rounded" />
        </CardContent>
      </Card>

      {/* Source Breakdown & Campaign List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-72 w-full rounded" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-44" />
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-5 w-12" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function LeadAnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6 space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-36" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Funnel & Score Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-80 w-full rounded" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-80 w-full rounded" />
          </CardContent>
        </Card>
      </div>

      {/* Qualification Criteria Analysis */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-52" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversion Trends */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-72 w-full rounded" />
        </CardContent>
      </Card>
    </div>
  );
}
