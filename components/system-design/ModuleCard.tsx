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
        "group relative flex min-h-64 flex-col overflow-hidden rounded-xl border border-border bg-card p-5",
        "transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Part {module.part} · {module.partTitle}
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {String(module.order).padStart(2, "0")}
        </span>
      </div>
      <div className="mt-8">
        <h2 className="mt-3 text-xl font-semibold leading-snug tracking-tight">
          {module.title}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {module.description}
        </p>
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
        <span className="text-xs text-muted-foreground">
          {module.lessons.length} lessons
        </span>
        <span className="text-sm font-medium text-primary transition-transform group-hover:translate-x-1">
          Open module <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}
