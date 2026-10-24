import { cn } from "@/lib/utils";
import Link from "next/link";
import type { SdModule } from "@/config/system-design/types";

interface ModuleCardProps {
  module: SdModule;
}

export function ModuleCard({ module }: ModuleCardProps) {
  return (
    <Link
      href={`/system-design/${module.slug}`}
      className={cn(
        "group relative flex min-h-64 flex-col overflow-hidden rounded-2xl border border-border bg-card p-6",
        "transition-all duration-200 ease-out hover:-translate-y-1 hover:border-sd-accent/40 hover:shadow-lg",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sd-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      {/* Part chip */}
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sd-accent-soft px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-sd-accent">
          Part {module.part}
          <span className="text-sd-accent/70">·</span>
          {module.partTitle}
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {String(module.order).padStart(2, "0")}
        </span>
      </div>

      <div className="mt-6 flex-1">
        <h2 className="text-xl font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-sd-accent">
          {module.title}
        </h2>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
          {module.description}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-sd-accent" />
          {module.lessons.length} lessons
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-sd-accent transition-transform group-hover:translate-x-1">
          Open
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}
