import type { ReactNode } from "react";
import { Info, TriangleAlert, Lightbulb, OctagonAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type CalloutTone = "note" | "tip" | "warning" | "trap";

const TONES = {
  note: {
    Icon: Info,
    ring: "border-sky-400/25 bg-sky-400/[0.06]",
    accent: "text-sky-300",
    label: "Note",
  },
  tip: {
    Icon: Lightbulb,
    ring: "border-lime-400/25 bg-lime-400/[0.06]",
    accent: "text-lime-300",
    label: "Takeaway",
  },
  warning: {
    Icon: TriangleAlert,
    ring: "border-amber-400/25 bg-amber-400/[0.06]",
    accent: "text-amber-300",
    label: "Watch out",
  },
  trap: {
    Icon: OctagonAlert,
    ring: "border-red-400/25 bg-red-400/[0.06]",
    accent: "text-red-300",
    label: "Bug we hit",
  },
} satisfies Record<
  CalloutTone,
  { Icon: typeof Info; ring: string; accent: string; label: string }
>;

/**
 * Callout for the things a reader should not skim past: caveats, migration
 * notes, and the bugs we actually shipped. "Bug we hit" exists because the
 * most useful engineering-blog content is the failure, not the happy path.
 */
export function Callout({
  tone = "note",
  title,
  children,
}: {
  tone?: CalloutTone;
  title?: string;
  children: ReactNode;
}) {
  const { Icon, ring, accent, label } = TONES[tone];

  return (
    <aside
      className={cn("my-8 rounded-xl border px-5 py-4 flex gap-3.5", ring)}
    >
      <Icon className={cn("size-[18px] shrink-0 mt-0.5", accent)} aria-hidden />
      <div className="min-w-0">
        <p className={cn("text-sm font-semibold mb-1", accent)}>
          {title ?? label}
        </p>
        <div className="text-[0.95rem] leading-relaxed text-foreground/80 [&_code]:text-cyan-200/90 [&_code]:font-mono [&_code]:text-[0.85em]">
          {children}
        </div>
      </div>
    </aside>
  );
}
