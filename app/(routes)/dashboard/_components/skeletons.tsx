import { Skeleton } from "@/components/ui/skeleton";

export function WelcomeBannerSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-3 sm:p-6 lg:p-8">
      <Skeleton className="h-4 w-32 sm:w-40 rounded-full mb-3" />
      <Skeleton className="h-5 w-52 sm:h-7 sm:w-72 lg:h-8 lg:w-80" />
      <Skeleton className="h-3 w-full sm:h-3.5 sm:w-96 mt-2" />
      <div className="flex items-center gap-3 mt-3 sm:justify-end">
        <Skeleton className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="flex gap-1 sm:gap-1.5 mt-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-4 sm:h-5 w-12 sm:w-16 rounded-full" />
        ))}
      </div>
    </div>
  );
}

export function StatusStripSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className="rounded-xl sm:rounded-2xl border border-border/50 bg-card p-3 sm:p-4 lg:p-5"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <Skeleton className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg sm:rounded-xl" />
            <div className="space-y-1.5 sm:space-y-2 min-w-0 flex-1">
              <Skeleton className="h-5 w-8 sm:w-10 lg:h-7" />
              <Skeleton className="h-3 w-14 sm:w-20 sm:w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl sm:rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-9 h-9 rounded-lg" />
        <div className="space-y-1.5 min-w-0">
          <Skeleton className="h-3.5 w-24 sm:w-28" />
          <Skeleton className="h-3 w-32 sm:w-40" />
        </div>
      </div>
      <div className="flex items-end justify-between gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="text-center min-w-0 flex-1">
            <Skeleton className="h-5 w-6 sm:h-6 sm:w-8 mx-auto" />
            <Skeleton className="h-2.5 w-10 sm:h-3 sm:w-12 mt-1.5 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function EnrolledCoursesSkeleton() {
  return (
    <div className="overflow-hidden">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-40 sm:h-6 sm:w-48" />
          <Skeleton className="h-3 w-28 sm:h-3.5 sm:w-32" />
        </div>
        <Skeleton className="h-8 w-20 sm:h-9 sm:w-24 rounded-md" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {Array.from({ length: 2 }, (_, i) => (
          <div
            key={i}
            className="rounded-xl sm:rounded-2xl border border-border/50 bg-card p-3 sm:p-4 lg:p-5"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <Skeleton className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl" />
              <div className="flex-1 space-y-2 min-w-0">
                <Skeleton className="h-3.5 w-3/4 sm:h-4" />
                <Skeleton className="h-2.5 w-24 sm:h-3 sm:w-32" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-2.5 w-12 sm:h-3 sm:w-16" />
                <Skeleton className="h-2.5 w-6 sm:h-3 sm:w-8" />
              </div>
              <Skeleton className="h-1.5 w-full sm:h-2 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ContinueLearningSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-border bg-card p-4 sm:p-6 lg:p-8">
      <Skeleton className="h-5 w-28 sm:w-32 rounded-full mb-3 sm:mb-4" />
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl flex-shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <Skeleton className="h-4 w-3/4 sm:h-5" />
            <Skeleton className="h-3 w-36 sm:w-52" />
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <div className="space-y-1 text-right">
            <Skeleton className="h-5 w-10 sm:h-6 sm:w-14 ml-auto" />
            <Skeleton className="h-2.5 w-12 sm:h-3 sm:w-20 ml-auto" />
          </div>
          <Skeleton className="h-8 w-20 sm:h-10 sm:w-28 rounded-md" />
        </div>
      </div>
      <Skeleton className="h-1.5 w-full sm:h-2 rounded-full mt-4 sm:mt-6" />
      <Skeleton className="h-3 w-24 sm:w-28 mt-3 sm:mt-4" />
    </div>
  );
}
