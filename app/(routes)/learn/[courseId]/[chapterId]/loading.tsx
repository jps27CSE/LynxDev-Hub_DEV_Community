import { Skeleton } from "@/components/ui/skeleton";

export default function LessonLoading() {
  return (
    <div className="flex flex-col lg:h-screen lg:overflow-hidden">
      <div className="border-b border-border/40 bg-card pl-14 pr-4 sm:pr-6 lg:px-8 py-3 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="lg:w-2/5 border-b lg:border-b-0 lg:border-r border-border/40 bg-card max-h-[35dvh] lg:max-h-none overflow-hidden shrink-0">
          <div className="p-4 sm:p-6">
            <Skeleton className="h-[26px] w-36 rounded-full" />
            <Skeleton className="h-7 w-56 mt-4" />
            <div className="mt-4 space-y-px">
              <Skeleton className="h-7 w-full" />
              <Skeleton className="h-7 w-full" />
              <Skeleton className="h-7 w-5/6" />
              <Skeleton className="h-7 w-2/3" />
              <Skeleton className="h-7 w-full" />
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-7 w-1/2" />
            </div>
            <Skeleton className="h-8 w-full rounded-md mt-6" />
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
          <div className="flex-1 p-3 sm:p-4 bg-[#1e1e1e]">
            <Skeleton className="h-full w-full rounded-md bg-white/5" />
          </div>
          <div className="border-t border-border/40 bg-card p-3 sm:p-4 shrink-0">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-8 w-28 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
