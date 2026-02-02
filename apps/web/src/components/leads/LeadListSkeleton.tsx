import { Card, CardContent, Skeleton } from '@dashin/ui';

export function LeadListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              {/* Left section: Contact info */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    {/* Name */}
                    <Skeleton className="h-5 w-32" />
                    {/* Title & Company */}
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                {/* Contact details */}
                <div className="ml-13 space-y-1">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>

              {/* Middle section: Score & Priority */}
              <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-12 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>

              {/* Right section: Status & Actions */}
              <div className="flex flex-col items-end gap-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-2 mt-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function LeadDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-5 w-64" />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded" />
          <Skeleton className="h-10 w-24 rounded" />
          <Skeleton className="h-10 w-10 rounded" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact Information */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Qualification Details */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
