"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface ModelDisclosureProps {
  className?: string;
}

const limitations = [
  {
    title: "Queueing model, not a benchmark",
    description:
      "This simulator uses an M/M/1 queueing model with fixed service times. It does not measure real code execution, network stack overhead, GC pauses, or OS scheduling. Numbers are pedagogical approximations, not hardware benchmarks.",
  },
  {
    title: "No network partition granularity",
    description:
      "Network partitions are modeled as binary edge cuts. Real partitions have partial degradation, asymmetric reachability, and split-brain scenarios that this model cannot capture.",
  },
  {
    title: "No disk I/O or storage limits",
    description:
      "Database and object store nodes model CPU/service time only. Disk IOPS, write-ahead logs, compaction, and storage capacity limits are not modeled.",
  },
  {
    title: "No GC pauses or runtime effects",
    description:
      "Languages with garbage collection (Go, Java, Node.js) experience stop-the-world pauses under load. This simulator assumes smooth, continuous service.",
  },
  {
    title: "Tail latency amplification ignored",
    description:
      "The model uses average service times. In reality, tail latency (p99, p999) amplifies across tiers — a 1% slowdown at one tier can cause 10× tail latency at the edge.",
  },
  {
    title: "Cache eviction policy not modeled",
    description:
      "Cache hit rate is a static parameter. Real caches use LRU, LFU, or adaptive policies where hit rate depends on access pattern, key distribution, and memory pressure.",
  },
  {
    title: "No cold start modeling for serverless",
    description:
      "Function-as-a-service cold starts (100ms–2s) are not modeled. The simulator assumes all instances are warm and ready.",
  },
  {
    title: "Single-class M/M/1 queue",
    description:
      "All requests at a node share one FIFO queue. Real systems use priority queues, weighted fair queuing, or per-tenant isolation that changes contention behavior.",
  },
];

const assumptions = [
  "All service times are exponentially distributed (M/M/1)",
  "Arrival process is Poisson (memoryless)",
  "Service times are independent of queue length",
  "No request priorities or classes",
  "Infinite buffer space (no drops except at saturation)",
  "Network latency is captured per-hop via jitter parameter",
  "Failure injections are instantaneous and permanent until removed",
  "Load balancer distributes perfectly (round-robin or least-connections)",
];

export function ModelDisclosure({ className }: ModelDisclosureProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <details className={cn("border border-border rounded-lg bg-muted/30", className)}>
      <summary className="flex items-center justify-between p-3 cursor-pointer list-none">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <span className="font-medium text-sm">How this model works — and what it ignores</span>
        </div>
        <svg
          className={cn("w-4 h-4 text-muted-foreground transition-transform", "duration-200")}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </summary>

      <div className="px-3 pb-3 space-y-4">
        <div>
          <h4 className="font-medium text-sm mb-2 text-foreground">Core Assumptions</h4>
          <ul className="space-y-1 text-xs text-muted-foreground">
            {assumptions.map((a, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-primary mt-0.5">•</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-sm mb-2 text-foreground">What This Model Ignores</h4>
          <ul className="space-y-3 text-xs">
            {limitations.map((lim, i) => (
              <li key={i} className="p-2 bg-muted/50 rounded border border-border/50">
                <h5 className="font-medium text-xs text-foreground mb-1">{lim.title}</h5>
                <p className="text-xs text-muted-foreground">{lim.description}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            <strong>Remember:</strong> This is a teaching tool, not a capacity planner. Use it to build intuition about
            bottlenecks, trade-offs, and failure modes — not to size production infrastructure.
          </p>
        </div>
      </div>
    </details>
  );
}