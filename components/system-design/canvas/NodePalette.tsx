"use client";

import { cn } from "@/lib/utils";
import {
  NODE_TYPES,
  NODE_TYPE_ORDER,
  NODE_CATEGORY_LABELS,
  type SdNodeType,
  type SdNodeCategory,
} from "@/lib/system-design/nodes";
import { createLucideIcon } from "@/components/ui/lucide-icons";

interface NodePaletteProps {
  onDragStart: (type: SdNodeType, event: React.DragEvent) => void;
  disabledTypes?: SdNodeType[];
}

/**
 * One row per node type, not a tile grid.
 *
 * Nine types in two wide columns needed ~590px of height, which a bottom panel
 * capped at ~half of a narrow rail can never give — the last group (Async →
 * Queue) was always cut mid-tile. A 26px row with the label on the same line as
 * the icon needs ~381px in total, which fits inside the 47% cap and leaves the
 * steps above — the part a learner actually reads — the larger share.
 */
export function NodePalette({
  onDragStart,
  disabledTypes = [],
}: NodePaletteProps) {
  const categories: SdNodeCategory[] = ["traffic", "compute", "data", "async"];

  return (
    <div className="flex flex-col gap-1.5 p-1">
      {categories.map((category) => {
        const typesInCategory = NODE_TYPE_ORDER.filter(
          (t) =>
            NODE_TYPES[t].category === category && !disabledTypes.includes(t),
        );
        if (typesInCategory.length === 0) return null;

        return (
          <div key={category}>
            <h4 className="mb-0.5 px-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {NODE_CATEGORY_LABELS[category]}
            </h4>
            <div className="flex flex-col gap-1">
              {typesInCategory.map((type) => {
                const spec = NODE_TYPES[type];
                const Icon = createLucideIcon(spec.iconKey);
                return (
                  <button
                    key={type}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData(
                        "application/json",
                        JSON.stringify({ type }),
                      );
                      onDragStart(type, e);
                    }}
                    title={spec.blurb}
                    className={cn(
                      "flex w-full cursor-grab items-center gap-2 rounded-md border border-border bg-background px-2 py-0.5 text-left",
                      "hover:border-primary/50 hover:bg-accent transition-colors",
                      "active:scale-[0.99] active:cursor-grabbing",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    )}
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded bg-muted">
                      <Icon
                        className="size-3 text-foreground"
                        strokeWidth={2}
                      />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[11px] font-medium">
                      {spec.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
