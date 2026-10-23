import { getAllModuleSlugs, getModule } from "@/config/system-design/registry";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TaskWorkspace } from "@/components/system-design/TaskWorkspace";

interface TaskPageProps {
  params: Promise<{ module: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllModuleSlugs().map((module) => ({ module }));
}

export async function generateMetadata({
  params,
}: TaskPageProps): Promise<Metadata> {
  const { module } = await params;
  const mod = await getModule(module);
  if (!mod) return { title: "Build Task Not Found" };
  return {
    title: `Build Task: ${mod.title} — System Design Learning`,
    description: mod.task.brief,
  };
}

export default async function TaskPage({ params }: TaskPageProps) {
  const { module } = await params;
  const mod = await getModule(module);

  if (!mod) notFound();

  return (
    <TaskWorkspace
      moduleTitle={mod.title}
      taskBrief={mod.task.brief}
      moduleSlug={module}
    />
  );
}
