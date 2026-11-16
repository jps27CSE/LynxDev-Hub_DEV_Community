import { notFound } from "next/navigation";
import { getRoadmapBySlug } from "@/lib/roadmaps";
import { getAllCourses } from "@/lib/course-data";
import { createLogger } from "@/lib/logger";
import RoadmapTree from "../_components/RoadmapTree";

const log = createLogger("roadmaps/[slug]");

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const roadmap = await getRoadmapBySlug(slug);
  if (!roadmap) return { title: "Roadmap not found" };
  return {
    title: roadmap.title,
    description: roadmap.description,
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

  // Resolve platform course titles to ids (cached). Degrade gracefully on failure.
  const courseIdByTitle: Record<string, number> = {};
  try {
    const courses = await getAllCourses();
    for (const c of courses) {
      courseIdByTitle[c.title.trim().toLowerCase()] = c.id;
    }
  } catch (error) {
    log.error("failed to load courses for roadmap links", error);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <a href="/roadmaps" className="text-xs text-muted-foreground hover:text-foreground">
          ← All roadmaps
        </a>
        <h1 className="text-3xl font-bold tracking-tight mt-2">{roadmap.title}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">{roadmap.description}</p>
        <div className="flex flex-wrap gap-2 mt-3 text-xs text-muted-foreground">
          <span className="px-2 py-0.5 rounded-full border border-border/50 bg-card/40">
            {roadmap.category}
          </span>
          <span className="px-2 py-0.5 rounded-full border border-border/50 bg-card/40">
            {roadmap.level}
          </span>
          {roadmap.estimatedHours && (
            <span className="px-2 py-0.5 rounded-full border border-border/50 bg-card/40">
              ~{roadmap.estimatedHours}h
            </span>
          )}
        </div>
      </div>

      <RoadmapTree roadmap={roadmap} courseIdByTitle={courseIdByTitle} />
    </div>
  );
}