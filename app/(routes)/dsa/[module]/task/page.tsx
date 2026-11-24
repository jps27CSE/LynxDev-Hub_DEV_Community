import { getAllModuleSlugs, getModule } from "@/config/dsa/registry";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import DsaTaskView from "@/components/dsa/DsaTaskView";

interface TaskPageProps {
  params: Promise<{ module: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllModuleSlugs()
    .map((module) => getModule(module))
    .filter((m) => m && m.kind === "lesson+task")
    .map((m) => ({ module: m!.slug }));
}

export async function generateMetadata({ params }: TaskPageProps): Promise<Metadata> {
  const { module } = await params;
  const mod = getModule(module);
  if (!mod || !mod.task) return { title: "Task Not Found" };
  return { title: `${mod.task.brief.slice(0, 60)} — ${mod.title} — DSA` };
}

export default async function TaskPage({ params }: TaskPageProps) {
  const { module } = await params;
  const mod = getModule(module);
  if (!mod || !mod.task) notFound();

  const serializableTask = {
    brief: mod.task.brief,
    steps: mod.task.steps.map((s) => ({
      id: s.id,
      title: s.title,
      brief: s.brief,
      hint: s.hint,
      reveal: s.reveal,
    })),
    passCriteria: mod.task.passCriteria.map((c) => ({
      id: c.id,
      label: c.label,
      required: c.required,
      explain: c.explain,
    })),
    solutionState: mod.task.solutionState,
  };

  return (
    <div>
      <div className="max-w-3xl mx-auto px-4 pt-4">
        <Link href={`/dsa/${mod.slug}`} className="text-sm text-muted-foreground hover:text-primary">
          &larr; {mod.title}
        </Link>
      </div>
      <DsaTaskView moduleSlug={mod.slug} task={serializableTask} />
    </div>
  );
}
