import { Skeleton } from "@/components/ui/skeleton";

export default function CourseDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-6">
        <Skeleton className="h-4 w-36" />
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-border bg-card mb-10 p-6 sm:p-8">
        <div className="flex items-start gap-4 sm:gap-5">
          <Skeleton className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-7 sm:h-8 w-64 sm:w-80" />
            <Skeleton className="h-4 w-full max-w-md" />
            <Skeleton className="h-4 w-3/4 max-w-sm" />
          </div>
        </div>
        <div className="flex items-center gap-5 sm:gap-7 mt-5 pt-5 border-t border-border/40">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3.5 w-16" />
        </div>
      </div>

      <div className="mb-5 space-y-2">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-3.5 w-52" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/50 bg-card p-4"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="w-9 h-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-56 sm:w-72" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-3.5 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}