import { getAllModuleSlugs, getModule } from "@/config/system-design/registry";
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
    slugs.map(async (slug) => ({ slug, mod: await getModule(slug) })),
  );
  return loaded
    .filter(({ mod }) => mod?.kind === "sim" && !!mod.task)
    .map(({ slug }) => ({ module: slug }));
}

export async function generateMetadata({
  params,
}: TaskPageProps): Promise<Metadata> {
  const { module } = await params;
  const mod = await getModule(module);
  if (!mod || mod.kind !== "sim" || !mod.task) {
    return { title: "Build Task Not Found" };
  }
  return {
    title: `Build Task: ${mod.title} — System Design Learning`,
    description: mod.task.brief,
  };
}

export default async function TaskPage({ params }: TaskPageProps) {
  const { module } = await params;
  const mod = await getModule(module);

  if (!mod || mod.kind !== "sim" || !mod.task) notFound();

  return <TaskWorkspace moduleSlug={module} />;
}
