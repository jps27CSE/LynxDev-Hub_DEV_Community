import { getAllModuleSlugs, getModule } from "@/config/system-design/registry";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ModuleOverview } from "@/components/system-design/ModuleLayout";
import { ModuleLayout } from "@/components/system-design/ModuleLayout";

interface ModulePageProps {
  params: Promise<{ module: string }>;
}

export const dynamicParams = false;

// Generate static params with just the module slugs
// Module data is loaded client-side in the page component
export async function generateStaticParams() {
  return getAllModuleSlugs().map((module) => ({ module }));
}

export async function generateMetadata({
  params,
}: ModulePageProps): Promise<Metadata> {
  const { module } = await params;
  const mod = await getModule(module);
  if (!mod) return { title: "Module Not Found" };
  return {
    title: `${mod.title} — System Design Learning`,
    description: mod.description,
  };
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { module } = await params;
  const mod = await getModule(module);

  if (!mod) notFound();

  // The overview page renders titles and counts, never prose. Passing the full
  // lesson objects would put every lesson's body into the page payload; passing
  // the task's graphs would add the two biggest objects on the module for a
  // component that reads one string from them. See `ModuleOverview`.
  const overview: ModuleOverview = {
    slug: mod.slug,
    order: mod.order,
    part: mod.part,
    partTitle: mod.partTitle,
    kind: mod.kind,
    title: mod.title,
    description: mod.description,
    story: mod.story,
    chapters: mod.chapters,
    lessons: mod.lessons.map((lesson) => ({
      slug: lesson.slug,
      title: lesson.title,
      sectionCount: lesson.sections.length,
      sourceCount: lesson.sources?.length ?? 0,
    })),
    interviewByte: mod.interviewByte,
    task: mod.task ? { brief: mod.task.brief } : undefined,
    recap: mod.recap,
    attribution: mod.attribution,
  };

  return <ModuleLayout module={overview} />;
}
