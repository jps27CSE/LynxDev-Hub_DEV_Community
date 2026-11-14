import { getAllModuleSlugs, getTask } from "@/config/system-design/registry";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TaskWorkspace } from "@/components/system-design/TaskWorkspace";

interface TaskPageProps {
  params: Promise<{ module: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = getAllModuleSlugs();
  const loaded = await Promise.all(
    slugs.map(async (slug) => ({ slug, task: await getTask(slug) })),
  );
  return loaded
    .filter(({ task }) => !!task)
    .map(({ slug }) => ({ module: slug }));
}

export async function generateMetadata({
  params,
}: TaskPageProps): Promise<Metadata> {
  const { module } = await params;
  const taskMod = await getTask(module);
  if (!taskMod) {
    return { title: "Build Task Not Found" };
  }
  return {
    title: `Build Task: ${taskMod.title} — System Design Learning`,
    description: taskMod.task.brief,
  };
}

export default async function TaskPage({ params }: TaskPageProps) {
  const { module } = await params;
  const taskMod = await getTask(module);

  if (!taskMod) notFound();

  return <TaskWorkspace moduleSlug={module} />;
}
