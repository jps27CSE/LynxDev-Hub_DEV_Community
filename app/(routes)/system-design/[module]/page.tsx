import { getAllModuleSlugs, getModule } from "@/config/system-design/registry";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ModuleLayout } from "@/components/system-design/ModuleLayout";
import type { SdModule } from "@/config/system-design/types";

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

  // Create a clean module object without functions that can't be serialized
  // for static generation. The full module with steps will be available client-side.
  const cleanModule: SdModule = {
    slug: mod.slug,
    order: mod.order,
    part: mod.part,
    partTitle: mod.partTitle,
    title: mod.title,
    description: mod.description,
    story: mod.story,
    chapters: mod.chapters,
    lessons: mod.lessons,
    interviewByte: mod.interviewByte,
    task: {
      brief: mod.task.brief,
      startGraph: mod.task.startGraph,
      solutionGraph: mod.task.solutionGraph,
      // steps and passCriteria are omitted - loaded client-side
      steps: [] as any[],
      passCriteria: [] as any[],
    },
    recap: mod.recap,
    attribution: mod.attribution,
  };

  return <ModuleLayout module={cleanModule} />;
}