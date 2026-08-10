"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChapterHubProps } from "./ChapterHubClient";

const ChapterHubClient = dynamic(() => import("./ChapterHubClient"), {
  ssr: false,
  loading: () => <ChapterHubSkeleton />,
});

function ChapterHubSkeleton() {
  return (
    <div className="bg-background flex flex-col min-h-dvh">
      <div className="border-b border-border/40 bg-card pl-14 pr-4 sm:pr-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Skeleton className="h-8 w-24 lg:hidden" />
            <Skeleton className="h-8 w-28 hidden md:block" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-start">
        <aside className="hidden lg:flex w-72 flex-shrink-0 border-r border-border/40 bg-[#07090e] sticky top-0 h-dvh flex-col overflow-hidden">
          <div className="p-4 pb-2">
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
          <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-3 w-5" />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <Skeleton
                      className={`h-4 ${i % 2 === 0 ? "w-3/4" : "w-2/3"}`}
                    />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-0.5 w-full mt-2" />
              </div>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8 space-y-3">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-8 sm:h-9 w-2/3" />
              <div className="flex items-center gap-x-3 gap-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-14" />
              </div>
            </div>

            <div className="space-y-12">
              <section className="space-y-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </section>

              <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-6 space-y-3">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>

              <section className="space-y-4">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </section>

              <div className="rounded-xl border border-green-500/20 bg-green-500/[0.03] p-6 space-y-3">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>

              <section className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-6 w-10 rounded-full" />
                  <Skeleton className="h-8 w-40 ml-auto" />
                </div>
                <div className="space-y-5">
                  {[0, 1].map((i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-border bg-[#10141b] p-6 pb-4 space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <Skeleton className="h-3 w-6 mt-1" />
                        <Skeleton className="h-5 flex-1 w-full" />
                        <Skeleton className="h-7 w-7 rounded-md flex-shrink-0" />
                      </div>
                      <div className="flex flex-wrap items-center gap-2 ml-8">
                        <Skeleton className="h-5 w-14 rounded-full" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                      <Skeleton className="h-16 w-full rounded-lg ml-8" />
                    </div>
                  ))}
                </div>
              </section>

              <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.03] p-6 space-y-3">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>

            <div className="flex items-center gap-4 mt-12 pt-8 border-t border-border/40">
              <Skeleton className="h-12 flex-1 rounded-md" />
              <Skeleton className="h-12 flex-1 rounded-md" />
            </div>
          </div>
        </main>

        <aside className="hidden xl:flex w-56 flex-shrink-0 border-l border-border/40 bg-[#07090e] sticky top-0 h-dvh flex-col overflow-y-auto">
          <div className="p-4">
            <Skeleton className="h-3 w-24 mb-3" />
            <div className="space-y-1.5">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  className={`h-4 ${i % 2 === 0 ? "w-full" : "w-2/3"}`}
                />
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border/40">
              <Skeleton className="h-3 w-16 mb-2.5" />
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-7 w-7 rounded-md" />
                ))}
              </div>
              <Skeleton className="h-3 w-40 mt-3" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function ChapterHubLoader(props: ChapterHubProps) {
  return <ChapterHubClient {...props} />;
}
