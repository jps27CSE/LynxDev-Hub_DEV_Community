import type { Metadata } from "next";
import Link from "next/link";
import { loadAllDsaModules } from "@/config/dsa/registry";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "DSA Learning Path",
  description:
    "Learn data structures and algorithms interactively: lessons, code, and step-through visual animations.",
};

export default function DsaIndex() {
  const modules = loadAllDsaModules();
  const grouped = modules.reduce<Record<number, typeof modules>>((acc, m) => {
    if (!acc[m.part]) acc[m.part] = [];
    acc[m.part].push(m);
    return acc;
  }, {});

  const partTitles: Record<number, string> = {
    0: "Part 0 — Foundations",
    1: "Part 1 — Core data structures",
    2: "Part 2 — Patterns",
    3: "Part 3 — Advanced",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
      <PageHeader>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">DSA Learning Path</h1>
          <p className="text-muted-foreground mt-2">
            Read a concept, see the algorithm move, then write the code yourself.
          </p>
        </div>
      </PageHeader>

      {Object.keys(grouped)
        .map(Number)
        .sort((a, b) => a - b)
        .map((part) => (
          <section key={part}>
            <h2 className="text-xl font-semibold mb-4">{partTitles[part] ?? `Part ${part}`}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {grouped[part].map((m) => (
                <Link
                  key={m.slug}
                  href={`/dsa/${m.slug}`}
                  className="rounded-xl border border-border/40 bg-card p-5 hover:border-primary/40 transition-colors"
                >
                  <h3 className="font-semibold">{m.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{m.description}</p>
                  <p className="text-xs text-muted-foreground mt-3">
                    {m.lessons.length} lessons
                    {m.kind === "lesson+task" ? " · includes task" : ""}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}
