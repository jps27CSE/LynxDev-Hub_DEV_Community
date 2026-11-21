"use client";

import Link from "next/link";
import { Map, Clock, Layers } from "lucide-react";
import { useRoadmapProgress } from "@/hooks/useRoadmapProgress";
import { collectLeafIds } from "@/config/roadmaps/utils";
import type { Roadmap } from "@/config/roadmaps/types";

const CATEGORY_COLOR: Record<Roadmap["category"], string> = {
  frontend: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  backend: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  fullstack: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  ai: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  "system-design": "text-rose-400 bg-rose-400/10 border-rose-400/20",
  devops: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  data: "text-orange-400 bg-orange-400/10 border-orange-400/20",
};

const LEVEL_LABEL: Record<Roadmap["level"], string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export default function RoadmapCard({ roadmap }: { roadmap: Roadmap }) {
  const leaves = collectLeafIds(roadmap.root);
  const { statuses, hydrated } = useRoadmapProgress(roadmap.slug);
  const done = leaves.filter((id) => statuses[id] === "done").length;
  const pct = leaves.length > 0 ? Math.round((done / leaves.length) * 100) : 0;

  const r = 18;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <Link
      href={`/roadmaps/${roadmap.slug}`}
      className="group block rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-5 hover:border-primary/40 hover:bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Map className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-base group-hover:text-primary transition-colors">
              {roadmap.title}
            </h2>
            <span
              className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full border mt-1 ${CATEGORY_COLOR[roadmap.category]}`}
            >
              {roadmap.category}
            </span>
          </div>
        </div>

        {/* Progress ring */}
        <div className="relative w-12 h-12 shrink-0">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
            <circle
              cx="22"
              cy="22"
              r={r}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-muted/40"
            />
            <circle
              cx="22"
              cy="22"
              r={r}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={hydrated ? offset : c}
              className="text-primary transition-all duration-500"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
            {hydrated ? `${pct}%` : "—"}
          </span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
        {roadmap.description}
      </p>

      <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" />
          {leaves.length} topics
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />~{roadmap.estimatedHours ?? "—"}h
        </span>
        <span className="ml-auto">{LEVEL_LABEL[roadmap.level]}</span>
      </div>

      {roadmap.updatedAt && (
        <div className="mt-3 text-[10px] text-muted-foreground/80">
          Updated{" "}
          {new Date(roadmap.updatedAt).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })}
        </div>
      )}
    </Link>
  );
}
