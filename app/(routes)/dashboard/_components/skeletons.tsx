import { Skeleton } from "@/components/ui/skeleton";

export function WelcomeBannerSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between gap-6">
        <div className="space-y-3">
          <Skeleton className="h-5 w-40 rounded-full" />
          <Skeleton className="h-8 w-64 sm:w-80" />
          <Skeleton className="h-4 w-56 sm:w-96" />
          <div className="flex gap-2 pt-1.5">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-6 w-20 rounded-full" />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 sm:flex-col sm:items-end shrink-0">
          <Skeleton className="w-14 h-14 rounded-2xl" />
          <Skeleton className="h-3.5 w-20" />
        </div>
      </div>
    </div>
  );
}

export function StatusStripSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border/50 bg-card p-5"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-10" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-9 h-9 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-6 w-8" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function EnrolledCoursesSkeleton() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3.5 w-32" />
        </div>
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {Array.from({ length: 2 }, (_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/50 bg-card p-5"
          >
            <div className="flex items-start gap-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-8" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ContinueLearningSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8">
      <Skeleton className="h-5 w-32 rounded-full mb-4" />
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        <div className="flex items-center gap-4 flex-1">
          <Skeleton className="w-14 h-14 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-52" />
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-14" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
      </div>
      <Skeleton className="h-2 w-full rounded-full mt-6" />
      <Skeleton className="h-3 w-28 mt-4" />
    </div>
  );
}
