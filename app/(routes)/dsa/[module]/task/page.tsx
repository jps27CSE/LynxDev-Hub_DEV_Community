import { getAllModuleSlugs, getModule } from "@/config/dsa/registry";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
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

export async function generateMetadata({
  params,
}: TaskPageProps): Promise<Metadata> {
  const { module } = await params;
  const mod = getModule(module);
  if (!mod || !mod.task) return { title: "Task Not Found" };
  return { title: `${mod.title} — build task — DSA` };
}

export default async function TaskPage({ params }: TaskPageProps) {
  const { module } = await params;
  const mod = getModule(module);
  if (!mod || !mod.task) notFound();

  // `steps[].check` and `passCriteria[].assert` are functions. Strip them here,
  // at the only place a task reaches the client boundary, instead of trusting
  // every future caller to remember.
  const task = mod.task;

  return (
    <DsaTaskView
      moduleSlug={mod.slug}
      moduleTitle={mod.title}
      task={{
        brief: task.brief,
        steps: task.steps.map((step) => ({
          id: step.id,
          title: step.title,
          brief: step.brief,
          hint: step.hint,
          reveal: step.reveal,
        })),
        passCriteria: task.passCriteria.map((criterion) => ({
          id: criterion.id,
          label: criterion.label,
          required: criterion.required,
          explain: criterion.explain,
        })),
        startState: task.startState,
        solutionState: task.solutionState,
      }}
    />
  );
}
