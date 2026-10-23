import Link from "next/link";
import type { SdModule } from "@/config/system-design/types";

export function ModuleLayout({ module }: { module: SdModule }) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link
          href="/system-design"
          className="transition-colors hover:text-foreground"
        >
          System design
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <span aria-current="page" className="text-foreground">
          {module.title}
        </span>
      </nav>

      <header className="mt-8 border-b border-border pb-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          <span>
            Part {module.part}: {module.partTitle}
          </span>
          <span aria-hidden="true">·</span>
          <span>Module {String(module.order).padStart(2, "0")}</span>
        </div>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">
          {module.title}
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
          {module.description}
        </p>
      </header>

      <section
        aria-labelledby="story-heading"
        className="my-8 grid gap-4 border-l-2 border-primary/50 bg-muted/30 px-5 py-5 sm:grid-cols-[9rem_1fr] sm:gap-8 sm:px-7"
      >
        <h2
          id="story-heading"
          className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground"
        >
          Where we are
        </h2>
        <p className="whitespace-pre-wrap leading-7">{module.story}</p>
      </section>

      <section aria-labelledby="lessons-heading" className="mt-10">
        <div className="flex items-end justify-between gap-4 border-b border-border pb-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Read · reason · apply
            </p>
            <h2
              id="lessons-heading"
              className="mt-2 text-2xl font-semibold tracking-tight"
            >
              Lessons
            </h2>
          </div>
          <span className="font-mono text-sm text-muted-foreground">
            {module.lessons.length} total
          </span>
        </div>

        {module.lessons.length === 0 ? (
          <p className="py-8 text-sm text-muted-foreground">
            Lessons for this module are not published yet.
          </p>
        ) : (
          <ol className="divide-y divide-border">
            {module.lessons.map((lesson, index) => (
              <li key={lesson.slug}>
                <Link
                  href={`/system-design/${module.slug}/lesson/${lesson.slug}`}
                  className="group flex items-center gap-4 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="font-mono text-sm text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium group-hover:text-primary">
                      {lesson.title}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {lesson.sections.length} sections · {lesson.attribution}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-lg text-primary transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section
        aria-labelledby="interview-heading"
        className="mt-12 rounded-xl border border-border bg-card p-5 sm:p-7"
      >
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
          Interview byte
        </p>
        <h2 id="interview-heading" className="mt-2 text-xl font-semibold">
          Make the answer count
        </h2>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Shape
            </h3>
            <p className="mt-2 text-sm leading-6">
              {module.interviewByte.shape}
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Strong answer
            </h3>
            <p className="mt-2 text-sm leading-6">
              {module.interviewByte.strongAnswer}
            </p>
          </div>
          <div className="border-l-2 border-amber-500/50 pl-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              The trap
            </h3>
            <p className="mt-2 text-sm leading-6">
              {module.interviewByte.trap}
            </p>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="build-heading"
        className="relative mt-8 overflow-hidden rounded-xl border border-primary/30 bg-primary/5 p-6 sm:p-8"
      >
        <div
          aria-hidden="true"
          className="absolute -right-10 -top-12 h-40 w-40 rounded-full border border-primary/20"
        />
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
          Build task
        </p>
        <h2
          id="build-heading"
          className="mt-2 text-2xl font-semibold tracking-tight"
        >
          Put the design under load.
        </h2>
        <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
          {module.task.brief}
        </p>
        <Link
          href={`/system-design/${module.slug}/task`}
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Open build task <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section
        aria-labelledby="recap-heading"
        className="mt-10 border-t border-border pt-7"
      >
        <h2 id="recap-heading" className="text-xl font-semibold">
          Keep in mind
        </h2>
        <ul className="mt-4 space-y-3">
          {module.recap.map((point, index) => (
            <li
              key={`${index}-${point}`}
              className="flex gap-3 text-sm leading-6 text-muted-foreground"
            >
              <span aria-hidden="true" className="font-mono text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-xs leading-5 text-muted-foreground">
          Content synthesis: {module.attribution}
        </p>
      </section>
    </main>
  );
}
