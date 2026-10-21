"use client";

import { cn } from "@/lib/utils";
import { NODE_TYPES, NODE_TYPE_ORDER, NODE_CATEGORY_LABELS, type SdNodeType, type SdNodeCategory } from "@/lib/system-design/nodes";
import { createLucideIcon } from "@/components/ui/lucide-icons";

interface NodePaletteProps {
  onDragStart: (type: SdNodeType, event: React.DragEvent) => void;
  disabledTypes?: SdNodeType[];
}

export function NodePalette({ onDragStart, disabledTypes = [] }: NodePaletteProps) {
  const categories: SdNodeCategory[] = ["traffic", "compute", "data", "async"];

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto p-3">
      {categories.map((category) => {
        const typesInCategory = NODE_TYPE_ORDER.filter(
          (t) => NODE_TYPES[t].category === category && !disabledTypes.includes(t)
        );
        if (typesInCategory.length === 0) return null;

        return (
          <div key={category} className="space-y-2">
            <h4 className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {NODE_CATEGORY_LABELS[category]}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {typesInCategory.map((type) => {
                const spec = NODE_TYPES[type];
                const Icon = createLucideIcon(spec.iconKey);
                return (
                  <button
                    key={type}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("application/json", JSON.stringify({ type }));
                      onDragStart(type, e);
                    }}
                    className={cn(
                      "group relative flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border bg-background",
                      "hover:border-primary/50 hover:bg-accent transition-all duration-200",
                      "active:scale-[0.98]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      "min-w-0"
                    )}
                    title={spec.blurb}
                  >
                    <div className="relative w-10 h-10 flex items-center justify-center rounded bg-muted">
                      <Icon className="w-5 h-5 text-foreground" strokeWidth={2} />
                    </div>
                    <span className="text-xs font-medium text-center truncate w-full">
                      {spec.label}
                    </span>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
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