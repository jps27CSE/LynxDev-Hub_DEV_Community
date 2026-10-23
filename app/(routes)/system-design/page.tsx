import { loadAllModules } from "@/config/system-design/registry";
import type { Metadata } from "next";
import { ModuleCard } from "@/components/system-design/ModuleCard";

export const metadata: Metadata = {
  title: "System Design Learning Path",
  description:
    "Interactive system design learning: from 100 users to chaos. Build, break, and fix real architectures.",
};

export default async function SystemDesignIndex() {
  const modules = await loadAllModules();

  if (modules.length === 0) {
    return (
      <div className="mx-auto flex min-h-[55vh] max-w-3xl flex-col justify-center px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
          A hands-on learning path
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          System design, under pressure.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
          Read a concept, see how the system behaves, then build the design
          yourself. The first lessons are being prepared.
        </p>
        <div className="mt-10 border-l-2 border-primary/40 pl-5">
          <p className="font-medium">The path is coming together</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Modules will appear here as their reviewed lessons are published.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 lg:py-14">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-10 sm:px-10 sm:py-14">
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-24 h-72 w-72 rounded-full border border-primary/20"
        />
        <div
          aria-hidden="true"
          className="absolute -right-4 -top-12 h-48 w-48 rounded-full border border-primary/20"
        />
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
          System design / field notes
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          From 100 users to chaos.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          Follow one growing app. Learn the trade-offs, watch the bottlenecks
          move, and build a design that survives.
        </p>
      </section>

      <section aria-labelledby="modules-heading">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Curriculum
            </p>
            <h2
              id="modules-heading"
              className="mt-2 text-2xl font-semibold tracking-tight"
            >
              Choose a module
            </h2>
          </div>
          <p className="hidden font-mono text-xs text-muted-foreground sm:block">
            {modules.length} modules
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {modules.map((module) => (
            <ModuleCard key={module.slug} module={module} />
          ))}
        </div>
      </section>
    </div>
  );
}
