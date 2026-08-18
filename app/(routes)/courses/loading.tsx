import { Skeleton } from "@/components/ui/skeleton";

export default function CoursesLoading() {
  return (
    <>
      <div className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-grid-paper" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="pt-6">
            <Skeleton className="h-5 w-36" />
          </div>
          <div className="py-16 sm:py-24">
            <div className="max-w-3xl">
              <Skeleton className="h-[26px] w-44 rounded-full" />
              <Skeleton className="h-10 sm:h-[52px] lg:h-[66px] w-72 sm:w-[30rem] mt-6" />
              <div className="mt-4 space-y-1">
                <Skeleton className="h-[29px] w-full max-w-xl" />
                <Skeleton className="h-[29px] w-5/6 max-w-xl" />
                <Skeleton className="h-[29px] w-3/4 max-w-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-center justify-between mb-10">
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-5 w-52" />
          </div>
          <Skeleton className="hidden sm:block h-4 w-44" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/50 bg-card p-6 overflow-hidden"
            >
              <div className="flex items-start gap-4">
                <Skeleton className="w-14 h-14 rounded-2xl ring-1 ring-border flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-7 w-full" />
                  <Skeleton className="h-7 w-3/4" />
                  <Skeleton className="h-[23px] w-full mt-1.5" />
                  <Skeleton className="h-[23px] w-2/3" />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border/30">
                <Skeleton className="h-[27px] w-20 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
