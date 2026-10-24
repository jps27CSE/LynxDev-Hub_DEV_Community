"use client";

import { cn } from "@/lib/utils";
import type { SimulationResult, SdNodeResult } from "@/config/system-design/types";

interface ResultsRailProps {
  result: SimulationResult | null;
  selectedNodeId?: string | null;
}

const fmt = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toFixed(n < 10 ? 1 : 0);
};

const fmtMs = (ms: number) => {
  if (ms < 1) return `${(ms * 1000).toFixed(0)}µs`;
  if (ms < 1000) return `${ms.toFixed(1)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

const fmtPct = (pct: number) => `${(pct * 100).toFixed(1)}%`;

const utilizationColor = (util: number) => {
  if (util >= 1) return "text-sd-danger";
  if (util >= 0.7) return "text-sd-warn";
  return "text-sd-success";
};

export function ResultsRail({ result, selectedNodeId }: ResultsRailProps) {
  if (!result) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-4">
        <svg className="w-12 h-12 mb-2 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 20V10M12 20V4M6 20v-6" />
          <path d="M14 16h4M8 16h4" />
        </svg>
        <p className="text-sm">Run a simulation to see results</p>
      </div>
    );
  }

  const bottleneckNode = result.perNode.find((n: SdNodeResult) => n.id === result.bottleneck?.nodeId);
  const selectedNode = selectedNodeId ? result.perNode.find((n: SdNodeResult) => n.id === selectedNodeId) : null;

  return (
    <div className="flex-1 flex flex-col space-y-4 overflow-y-auto p-2">
      {/* Global Summary */}
      <section className="space-y-3 p-3 bg-muted/30 rounded-lg border border-border">
        <h3 className="font-medium text-sm text-foreground">Global Summary</h3>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Throughput"
            value={fmt(result.throughput)}
            unit="req/s"
            icon={<ThroughputIcon />}
          />
          <StatCard
            label="Error Rate"
            value={fmtPct(result.errorRate)}
            unit=""
            icon={<ErrorIcon />}
            warning={result.errorRate > 0.01}
          />
          <StatCard
            label="p50 Latency"
            value={fmtMs(result.latency.p50)}
            icon={<LatencyIcon />}
          />
          <StatCard
            label="p95 Latency"
            value={fmtMs(result.latency.p95)}
            icon={<LatencyIcon />}
          />
          <StatCard
            label="p99 Latency"
            value={fmtMs(result.latency.p99)}
            icon={<LatencyIcon />}
          />
          <StatCard
            label="Bandwidth"
            value={result.bandwidthMbps.toFixed(1)}
            unit="Mbps"
            icon={<BandwidthIcon />}
          />
        </div>
      </section>

      {/* Error Class Breakdown */}
      {Object.keys(result.errorClasses).length > 0 && (
        <section className="space-y-2 p-3 bg-muted/30 rounded-lg border border-border">
          <h3 className="font-medium text-sm text-foreground">Error Classes</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(result.errorClasses).map(([cls, value]: [string, number]) => (
              <ErrorClassBadge key={cls} cls={cls as any} value={value} />
            ))}
          </div>
        </section>
      )}

      {/* Bottleneck */}
      {result.bottleneck && (
        <section className="rounded-xl border border-sd-warn/30 bg-sd-warn/5 p-3">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div>
              <h4 className="font-medium text-sm text-amber-700 dark:text-amber-300">Bottleneck Detected</h4>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                {result.bottleneck.reason}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Teaching Strings */}
      {result.teaching.length > 0 && (
        <section className="space-y-2">
          <h3 className="font-medium text-sm text-foreground">Insights</h3>
          <div className="space-y-1">
            {result.teaching.map((t: string, i: number) => (
              <TeachingCard key={i} text={t} />
            ))}
          </div>
        </section>
      )}

      {/* Per-Node Table */}
      <section>
        <h3 className="font-medium text-sm text-foreground mb-2">Per-Node Breakdown</h3>
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground">
                <th className="text-left px-2 py-1">Node</th>
                <th className="text-right px-2 py-1">Util</th>
                <th className="text-right px-2 py-1">Concurrency</th>
                <th className="text-right px-2 py-1">Service</th>
                <th className="text-right px-2 py-1">Queue</th>
                <th className="text-center px-2 py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {result.perNode
                .filter((n: SdNodeResult) => n.id !== "client-1")
                .map((node: SdNodeResult) => (
                  <tr
                    key={node.id}
                    className={cn(
                      "border-t border-border/50 hover:bg-muted/30 transition-colors",
                      selectedNodeId === node.id && "bg-primary/5"
                    )}
                    onClick={() => {}}
                  >
                    <td className="px-2 py-1.5 font-mono text-foreground truncate max-w-[120px]">{node.id}</td>
                    <td className="px-2 py-1.5 text-right">
                      <span className={cn("font-mono", utilizationColor(node.utilisation))}>
                        {fmtPct(node.utilisation)}
                      </span>
                      {node.saturated && <span className="ml-1 text-red-500">●</span>}
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono text-muted-foreground">
                      {fmt(node.concurrency)}
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono">{fmtMs(node.serviceMs)}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{fmtMs(node.queueWaitMs)}</td>
                    <td className="px-2 py-1.5 text-center">
                      {node.down ? (
                        <span className="text-red-500 text-xs">DOWN</span>
                      ) : node.saturated ? (
                        <span className="text-red-500 text-xs">SATURATED</span>
                      ) : (
                        <span className="text-green-500 text-xs">OK</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Selected Node Detail */}
      {selectedNodeId && selectedNode && (
        <section className="p-3 bg-muted/30 rounded-lg border border-border">
          <h4 className="font-medium text-sm mb-2">Node Details: {selectedNode.id}</h4>
          <dl className="grid grid-cols-2 gap-1 text-xs">
            <dt className="text-muted-foreground">Utilisation</dt>
            <dd className={cn("font-mono font-medium", utilizationColor(selectedNode.utilisation))}>
              {fmtPct(selectedNode.utilisation)}
            </dd>
            <dt className="text-muted-foreground">Concurrency</dt>
            <dd className="font-mono">{fmt(selectedNode.concurrency)}</dd>
            <dt className="text-muted-foreground">Service Time</dt>
            <dd className="font-mono">{fmtMs(selectedNode.serviceMs)}</dd>
            <dt className="text-muted-foreground">Queue Wait</dt>
            <dd className="font-mono">{fmtMs(selectedNode.queueWaitMs)}</dd>
            <dt className="text-muted-foreground">Saturated</dt>
            <dd>{selectedNode.saturated ? "Yes" : "No"}</dd>
            <dt className="text-muted-foreground">Down</dt>
            <dd>{selectedNode.down ? "Yes" : "No"}</dd>
          </dl>
        </section>
      )}
    </div>
  );
}

// --- Sub-components ---

function StatCard({ label, value, unit, icon, warning }: {
  label: string;
  value: string;
  unit?: string;
  icon: React.ReactNode;
  warning?: boolean;
}) {
  return (
    <div className="p-2 bg-card border border-border rounded-lg">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        {icon}
      </div>
      <div className="flex items-baseline gap-1 mt-1">
        <span className={cn("font-mono text-lg font-medium", warning && "text-red-500")}>{value}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

function ErrorClassBadge({ cls, value }: { cls: "unreachable" | "stale" | "rejected" | "shed"; value: number }) {
  const colors = {
    unreachable: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    stale: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    rejected: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    shed: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  };
  const labels = {
    unreachable: "Unreachable",
    stale: "Stale Reads",
    rejected: "Rate Limited",
    shed: "Shed Load",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded text-xs font-mono border", colors[cls])}>
      {labels[cls]}: {fmtPct(value)}
    </span>
  );
}

function TeachingCard({ text }: { text: string }) {
  return (
    <div className="p-2 bg-blue-50/50 dark:bg-blue-900/20 rounded border border-blue-500/20">
      <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-1">
        <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        <span>{text}</span>
      </p>
    </div>
  );
}

// --- Icons ---

function ThroughputIcon() {
  return (
    <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 16 12 14 15 10 9 8 17 6 17" />
      <line x1="12" y1="22" x2="12" y2="10" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function LatencyIcon() {
  return (
    <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="8" width="20" height="8" rx="2" />
      <path d="M10 12v-4h4v4" />
    </svg>
  );
}

function BandwidthIcon() {
  return (
    <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v20M17 5H7" />
      <path d="M17 19H7" />
    </svg>
  );
}