import { getAllModuleSlugs, getModule } from "@/config/dsa/registry";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

interface ModulePageProps {
  params: Promise<{ module: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllModuleSlugs().map((module) => ({ module }));
}

export async function generateMetadata({ params }: ModulePageProps): Promise<Metadata> {
  const { module } = await params;
  const mod = getModule(module);
  if (!mod) return { title: "Module Not Found" };
  return { title: `${mod.title} — DSA`, description: mod.description };
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { module } = await params;
  const mod = getModule(module);
  if (!mod) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <Link href="/dsa" className="text-sm text-muted-foreground hover:text-primary">
          &larr; All modules
        </Link>
        <h1 className="text-2xl font-bold mt-2">{mod.title}</h1>
        <p className="text-muted-foreground mt-1">{mod.description}</p>
        <p className="text-xs text-muted-foreground mt-2">{mod.story}</p>
      </div>

      {mod.chapters && mod.chapters.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Chapters</h2>
          <ul className="space-y-1">
            {mod.chapters.map((c) => (
              <li key={c.slug} className="text-sm">
                {c.lessonSlug ? (
                  <Link
                    href={`/dsa/${mod.slug}/lesson/${c.lessonSlug}`}
                    className="text-primary hover:underline"
                  >
                    {c.title}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">{c.title}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-2">Lessons</h2>
        <ul className="space-y-2">
          {mod.lessons.map((l) => (
            <li key={l.slug}>
              <Link
                href={`/dsa/${mod.slug}/lesson/${l.slug}`}
                className="block rounded-lg border border-border/40 bg-card p-3 hover:border-primary/40 transition-colors"
              >
                <span className="font-medium">{l.title}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {l.sections.length} sections
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {mod.kind === "lesson+task" && mod.task && (
        <div className="rounded-lg border border-border/40 bg-card p-4">
          <h2 className="text-lg font-semibold">Build Task</h2>
          <p className="text-sm text-muted-foreground mt-1">{mod.task.brief}</p>
          <Link
            href={`/dsa/${mod.slug}/task`}
            className="inline-block mt-3 text-sm text-primary hover:underline"
          >
            Open task →
          </Link>
        </div>
      )}
    </div>
  );
}
