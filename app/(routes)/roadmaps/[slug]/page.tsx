import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { getRoadmapBySlug, getAllRoadmapSlugs } from "@/lib/roadmaps";
import { getPlatformCourseMap } from "@/lib/roadmap-platform";
import RoadmapTree from "../_components/RoadmapTree";

// The roadmap content is identical for every user (progress lives in
// localStorage), so there is no reason to render per request. Prerender all
// known slugs at build time and revalidate hourly so a course re-seed is picked
// up without a redeploy. Auth is enforced at the proxy, not here.
export const revalidate = 3600;

export async function generateStaticParams() {
  return getAllRoadmapSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const roadmap = await getRoadmapBySlug(slug);
  if (!roadmap) return { title: "Roadmap not found" };
  return {
    title: roadmap.title,
    description: roadmap.description,
  };
}

function stripResources(node: any): any {
  return {
    ...node,
    resources: [],
    children: node.children ? node.children.map(stripResources) : undefined,
  };
}

export default async function RoadmapDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const roadmap = await getRoadmapBySlug(slug);
  if (!roadmap) notFound();

  // Resources are lazy-loaded on demand (see _actions.ts) to keep the initial
  // payload small. The tree only needs titles/structure to render.
  const leanRoadmap = { ...roadmap, root: stripResources(roadmap.root) };

  // Resolve course keys to ids (cached). Degrades to `{}` on failure, which
  // hides course links and keeps lesson links (no DB) rendering.
  const platformCourses = await getPlatformCourseMap();

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      <header className="mb-6">
        <Link
          href="/roadmaps"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All roadmaps
        </Link>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{roadmap.title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border border-border/50 bg-card/40 px-2 py-0.5 capitalize">
              {roadmap.category}
            </span>
            <span className="rounded-full border border-border/50 bg-card/40 px-2 py-0.5 capitalize">
              {roadmap.level}
            </span>
            {roadmap.estimatedHours && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-card/40 px-2 py-0.5">
                <Clock className="h-3 w-3" />~{roadmap.estimatedHours}h
              </span>
            )}
          </div>
        </div>

        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {roadmap.description}
        </p>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" /> Done
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#8b5cf6]" /> Learning
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#9ca3af]" /> Skipped
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm border border-black/30 bg-[#ffd93a]" />{" "}
            Core section
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm border border-black/30 bg-[#f4e9d1]" />{" "}
            Topic
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="rounded-full border border-border/60 px-1.5 text-[9px]">
              opt
            </span>
            Optional
          </span>
        </div>
      </header>

      <RoadmapTree roadmap={leanRoadmap} platformCourses={platformCourses} />
    </div>
  );
}
