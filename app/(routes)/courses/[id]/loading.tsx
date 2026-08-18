import { Skeleton } from "@/components/ui/skeleton";

export default function CourseDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-6">
        <Skeleton className="h-5 w-32" />
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-border bg-card mb-10 p-6 sm:p-8">
        <div className="flex items-start gap-4 sm:gap-5">
          <Skeleton className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl" />
          <div className="flex-1">
            <Skeleton className="h-9 w-64 sm:w-80" />
            <Skeleton className="h-[22px] sm:h-[26px] w-full max-w-lg mt-2" />
            <Skeleton className="h-[22px] sm:h-[26px] w-3/4 max-w-md mt-1.5" />
          </div>
        </div>
        <div className="flex items-center gap-5 sm:gap-7 mt-5 pt-5 border-t border-border/40">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>

        <div className="mt-6 rounded-2xl border border-border/50 bg-background/60 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="space-y-1.5">
                <Skeleton className="h-7 w-10" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-11 w-24 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-1.5 w-full rounded-full mt-3" />
        </div>
      </div>

      <div className="flex items-center justify-between mb-5">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-52" />
        </div>
        <Skeleton className="hidden sm:block h-[26px] w-20 rounded-full" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start gap-4">
              <Skeleton className="w-10 h-10 rounded-full mt-0.5 shrink-0 ring-4 ring-border/40" />
              <div className="flex-1 min-w-0 space-y-1.5">
                <Skeleton className="h-5 w-64 sm:w-80" />
                <Skeleton className="h-4 w-44" />
              </div>
              <Skeleton className="h-4 w-4 mt-2 shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
