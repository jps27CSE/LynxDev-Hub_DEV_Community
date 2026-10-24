"use client";

import { cn } from "@/lib/utils";
import { createLucideIcon } from "@/components/ui/lucide-icons";
import type { SdNode } from "@/config/system-design/types";
import { getNodeTypeSpec } from "@/lib/system-design/nodes";

interface NodeCardProps {
  node: SdNode;
  scale: number;
  pan: { x: number; y: number };
  selected: boolean;
  onSelect: (id: string) => void;
  onConnectStart: (nodeId: string, port: "input" | "output") => void;
  utilisation?: number;
}

const PORT_RADIUS = 6;

export function NodeCard({
  node,
  scale,
  pan,
  selected,
  onSelect,
  onConnectStart,
  utilisation,
}: NodeCardProps) {
  const spec = getNodeTypeSpec(node.type);
  const Icon = createLucideIcon(spec.iconKey);

  const screenX = pan.x + node.x * scale;
  const screenY = pan.y + node.y * scale;
  const cardWidth = 160;
  const cardHeight = 72;

  const getUtilisationColor = (util?: number) => {
    if (util === undefined) return "bg-muted";
    if (util >= 1) return "bg-red-500";
    if (util >= 0.7) return "bg-amber-500";
    return "bg-green-500";
  };

  return (
    <div
      className={cn(
        "absolute select-none transition-transform duration-100",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        "cursor-grab",
      )}
      style={{
        left: screenX,
        top: screenY,
        transform: `scale(${scale})`,
        transformOrigin: "0 0",
        pointerEvents: "auto",
      }}
    >
      <div
        className={cn(
          "relative flex flex-col items-center gap-1.5 p-2.5 rounded-lg border bg-card",
          "min-w-[160px] max-w-[180px]",
          selected ? "border-primary shadow-lg" : "border-border shadow-sm",
          "hover:border-primary/50 transition-all duration-150",
        )}
        style={{ width: cardWidth, height: cardHeight }}
      >
        <div className="flex items-center justify-between w-full mb-1">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "relative flex items-center justify-center w-8 h-8 rounded bg-muted",
                "overflow-hidden",
              )}
            >
              <Icon className="w-4 h-4 text-foreground" strokeWidth={2} />
              {node.type === "app_server" && node.replicas > 1 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {node.replicas}x
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-medium truncate block">
                {node.label}
              </span>
              <span className="text-[10px] text-muted-foreground capitalize">
                {node.type.replace("_", " ")}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {utilisation !== undefined && (
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  getUtilisationColor(utilisation),
                )}
                title={`Utilisation: ${(utilisation * 100).toFixed(0)}%`}
              />
            )}
          </div>
        </div>

        <div
          className="port absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 cursor-crosshair rounded-full border-2 border-primary/60 bg-background transition-all hover:scale-125 hover:border-primary hover:bg-primary/20"
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onSelect(node.id);
            onConnectStart(node.id, "input");
          }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onSelect(node.id);
            onConnectStart(node.id, "input");
          }}
          title="Click to connect here"
        />
        <div
          className="port absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 cursor-crosshair rounded-full border-2 border-primary/60 bg-background transition-all hover:scale-125 hover:border-primary hover:bg-primary/20"
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onSelect(node.id);
            onConnectStart(node.id, "output");
          }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onSelect(node.id);
            onConnectStart(node.id, "output");
          }}
          title="Click to connect from here"
        />

        {node.type === "load_balancer" && (
          <div className="mt-1.5 text-[10px] text-muted-foreground flex items-center gap-1">
            <span>Algorithm:</span>
            <span className="font-mono capitalize">{node.algorithm}</span>
          </div>
        )}

        {node.type === "app_server" && (
          <div className="mt-1.5 text-[10px] text-muted-foreground flex items-center gap-1 flex-wrap">
            <span>Replicas:</span>
            <span className="font-mono">{node.replicas}</span>
            {node.maxConcurrency && (
              <span className="text-muted-foreground/50">
                | Max concurrency: {node.maxConcurrency}
              </span>
            )}
            {node.breakerEnabled && (
              <span className="text-muted-foreground/50">
                | Circuit breaker
              </span>
            )}
          </div>
        )}

        {node.type === "cache" && (
          <div className="mt-1.5 text-[10px] text-muted-foreground flex items-center gap-1 flex-wrap">
            <span>Hit rate:</span>
            <span className="font-mono">
              {(node.hitRate * 100).toFixed(0)}%
            </span>
            <span className="text-muted-foreground/50">
              | TTL: {node.ttlMs / 1000}s
            </span>
            {node.stampedeGuard && (
              <span className="text-muted-foreground/50">| Stampede guard</span>
            )}
          </div>
        )}

        {node.type === "database" && (
          <div className="mt-1.5 text-[10px] text-muted-foreground flex items-center gap-1 flex-wrap">
            <span>Read replicas:</span>
            <span className="font-mono">{node.readReplicas}</span>
            <span className="text-muted-foreground/50">
              | Partitions: {node.partitions}
            </span>
            {node.hotKeyShare > 0 && (
              <span className="text-muted-foreground/50">
                | Hot key: {(node.hotKeyShare * 100).toFixed(0)}%
              </span>
            )}
          </div>
        )}

        {node.type === "queue" && (
          <div className="mt-1.5 text-[10px] text-muted-foreground flex items-center gap-1 flex-wrap">
            <span>Max depth:</span>
            <span className="font-mono">{node.maxDepth}</span>
            <span className="text-muted-foreground/50">
              | Retry: {node.retryLimit}
            </span>
            {node.dlqEnabled && (
              <span className="text-muted-foreground/50">| DLQ</span>
            )}
          </div>
        )}

        {node.type === "worker" && (
          <div className="mt-1.5 text-[10px] text-muted-foreground flex items-center gap-1">
            <span>Replicas:</span>
            <span className="font-mono">{node.replicas}</span>
          </div>
        )}

        {node.type === "cdn" && (
          <div className="mt-1.5 text-[10px] text-muted-foreground flex items-center gap-1">
            <span>Hit rate:</span>
            <span className="font-mono">
              {(node.hitRate * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
