import { loadAllModules } from "@/config/system-design/registry";
import { Network } from "lucide-react";
import Link from "next/link";

export default async function SystemDesignStats() {
  const modules = await loadAllModules();
  const moduleCount = modules.length;
  const lessonCount = modules.reduce(
    (sum, m) => sum + (m.lessons?.length ?? 0),
    0,
  );
  const taskCount = modules.filter((m) => m.task).length;

  const items = [
    {
      label: "Modules",
      value: moduleCount,
      color: "text-indigo-600 dark:text-indigo-500",
    },
    {
      label: "Lessons",
      value: lessonCount,
      color: "text-indigo-600 dark:text-indigo-500",
    },
    {
      label: "Build tasks",
      value: taskCount,
      color: "text-amber-600 dark:text-amber-500",
    },
  ];

  return (
    <Link href="/system-design">
      <div className="rounded-xl sm:rounded-2xl border border-border bg-card p-4 sm:p-5 hover:border-border focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none transition-all group">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
            <Network className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
              System Design
            </h3>
            <p className="text-xs text-muted-foreground">
              {moduleCount} modules · {lessonCount} lessons
            </p>
          </div>
        </div>
        <div className="flex items-end justify-between gap-2">
          {items.map((item) => (
            <div key={item.label} className="text-center min-w-0 flex-1">
              <p
                className={`text-xl sm:text-2xl font-bold tabular-nums leading-none ${item.color}`}
              >
                {item.value ?? "\u2014"}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}
