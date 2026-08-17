import { Skeleton } from "@/components/ui/skeleton";

export default function LessonLoading() {
  return (
    <div className="flex flex-col lg:h-screen lg:overflow-hidden">
      <div className="border-b border-border/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="lg:w-2/5 border-b lg:border-b-0 lg:border-r border-border/40 bg-card p-6 space-y-3 max-h-[45dvh] lg:max-h-none overflow-hidden">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <div className="flex-1 flex flex-col lg:flex-row min-h-0 min-w-0">
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            <div className="flex-1 min-h-[250px] p-4 bg-[#1e1e1e]">
              <Skeleton className="h-full w-full rounded-md bg-white/5" />
            </div>
            <div className="border-t border-border/40 bg-card p-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}