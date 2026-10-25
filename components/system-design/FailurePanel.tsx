"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { SdGraph, SdNode, SdFailure } from "@/config/system-design/types";

interface FailurePanelProps {
  graph: SdGraph;
  failures: SdFailure[];
  onFailuresChange: (failures: SdFailure[]) => void;
}

type FailureKind = "node_down" | "degraded" | "partition" | "replica_lag";

const failureKinds: {
  kind: FailureKind;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    kind: "node_down",
    label: "Node Down",
    description:
      "Completely remove a node from the topology. Traffic routed through it fails.",
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
  {
    kind: "degraded",
    label: "Degraded",
    description:
      "Reduce a node's capacity (e.g., region struggling at 40% capacity).",
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
        <rect x="2" y="11" width="20" height="7" rx="2" />
        <path d="M6 11V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v0" />
      </svg>
    ),
  },
  {
    kind: "partition",
    label: "Network Partition",
    description:
      "Cut specific connections between nodes. Services can no longer talk.",
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 2v20M17 5H7" />
        <path d="M17 19H7" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
  {
    kind: "replica_lag",
    label: "Replica Lag",
    description:
      "Add lag to a database replica. Reads return stale data, not errors.",
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

// Shared helper functions
const getNodeLabel = (graph: SdGraph, id: string): string => {
  const node = graph.nodes.find((n) => n.id === id);
  return node ? `${node.label} (${node.type})` : id;
};

const isDegraded = (
  f: SdFailure,
): f is SdFailure & { kind: "degraded"; factor: number } =>
  f.kind === "degraded";
const isReplicaLag = (
  f: SdFailure,
): f is SdFailure & { kind: "replica_lag"; lagMs: number } =>
  f.kind === "replica_lag";
const isNodeDown = (f: SdFailure): f is SdFailure & { kind: "node_down" } =>
  f.kind === "node_down";
const isPartition = (f: SdFailure): f is SdFailure & { kind: "partition" } =>
  f.kind === "partition";

export function FailurePanel({
  graph,
  failures,
  onFailuresChange,
}: FailurePanelProps) {
  const [expandedKind, setExpandedKind] = useState<FailureKind | null>(null);

  const getFailuresOfKind = useCallback(
    (kind: FailureKind) =>
      failures.filter(
        (f): f is Extract<SdFailure, { kind: FailureKind }> => f.kind === kind,
      ),
    [failures],
  );

  const addFailure = useCallback(
    (kind: FailureKind, payload: Omit<SdFailure, "kind">) => {
      const id = `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      onFailuresChange([...failures, { kind, ...payload, id } as SdFailure]);
    },
    [failures, onFailuresChange],
  );

  const removeFailure = useCallback(
    (id: string) => {
      const newFailures = failures.filter((f) => f.id !== id);
      onFailuresChange(newFailures);
    },
    [failures, onFailuresChange],
  );

  const updateFailure = useCallback(
    (id: string, updates: Partial<SdFailure>) => {
      const newFailures = failures.map((f) =>
        f.id === id ? ({ ...f, ...updates } as SdFailure) : f,
      );
      onFailuresChange(newFailures);
    },
    [failures, onFailuresChange],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm text-foreground">
          Failure Injection
        </h3>
        <span className="text-xs text-muted-foreground">
          {failures.length} active
        </span>
      </div>

      <div className="space-y-2">
        {failureKinds.map(({ kind, label, description, icon }) => {
          const kindFailures = getFailuresOfKind(kind);
          const isExpanded = expandedKind === kind;

          return (
            <div
              key={kind}
              className={cn(
                "border border-border rounded-lg overflow-hidden",
                isExpanded && "ring-1 ring-sd-accent",
              )}
            >
              <button
                onClick={() =>
                  setExpandedKind((k) => (k === kind ? null : kind))
                }
                className={cn(
                  "w-full px-3 py-2 flex items-center gap-2 text-left transition-colors",
                  "hover:bg-muted/50",
                )}
              >
                <span className="text-muted-foreground">{icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{label}</div>
                  <div className="text-xs text-muted-foreground">
                    {description}
                  </div>
                </div>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded text-xs font-mono",
                    kindFailures.length > 0
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  {kindFailures.length} active
                </span>
                <svg
                  className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform",
                    isExpanded && "rotate-180",
                  )}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isExpanded && (
                <div className="p-3 border-t border-border space-y-3 bg-muted/30">
                  {/* Add new failure of this kind */}
                  <AddFailureForm
                    kind={kind}
                    graph={graph}
                    onAdd={(payload) => addFailure(kind, payload)}
                  />

                  {/* List active failures of this kind */}
                  {kindFailures.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Active ({kindFailures.length})
                      </div>
                      <ul className="space-y-1">
                        {kindFailures.map((failure) => (
                          <FailureItem
                            key={failure.id}
                            kind={kind}
                            failure={failure}
                            graph={graph}
                            onUpdate={(updates) =>
                              updateFailure(failure.id, updates)
                            }
                            onRemove={() => removeFailure(failure.id)}
                          />
                        ))}
                      </ul>
                    </div>
                  )}

                  {kindFailures.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      No active {label.toLowerCase()} failures. Add one above to
                      test resilience.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {failures.length > 0 && (
        <button
          onClick={() => onFailuresChange([])}
          className="w-full rounded-xl border border-sd-danger/30 px-3 py-2 text-sm text-sd-danger transition-colors hover:bg-sd-danger/10"
        >
          Clear All Failures
        </button>
      )}
    </div>
  );
}

// --- Sub-components ---

function AddFailureForm({
  kind,
  graph,
  onAdd,
}: {
  kind: string;
  graph: any;
  onAdd: (payload: any) => void;
}) {
  const [formState, setFormState] = useState<Record<string, any>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    let failure: any;
    switch (kind) {
      case "node_down":
        failure = { kind: "node_down", nodeId: formState.nodeId, id } as const;
        break;
      case "degraded":
        failure = {
          kind: "degraded",
          nodeId: formState.nodeId,
          factor: formState.factor ?? 0.5,
          id,
        } as const;
        break;
      case "partition":
        failure = {
          kind: "partition",
          edgeIds: [formState.edgeId],
          id,
        } as const;
        break;
      case "replica_lag":
        failure = {
          kind: "replica_lag",
          nodeId: formState.nodeId,
          lagMs: formState.lagMs ?? 100,
          id,
        } as const;
        break;
      default:
        failure = { kind, id } as const;
    }
    onAdd(failure);
    setFormState({});
  };

  const nodeOptions = graph.nodes
    .filter((n: any) => {
      if (kind === "replica_lag") return n.type === "database";
      return n.type !== "client";
    })
    .map((n: any) => ({ value: n.id, label: `${n.label} (${n.type})` }));

  const edgeOptions = graph.edges.map((e: any) => ({
    value: e.id,
    label: `${e.from} → ${e.to}`,
  }));

  switch (kind) {
    case "node_down":
      return (
        <form onSubmit={handleSubmit} className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <span className="w-20 text-muted-foreground">Node</span>
            <select
              value={formState.nodeId || ""}
              onChange={(e) =>
                setFormState((s) => ({ ...s, nodeId: e.target.value }))
              }
              className="flex-1 px-2 py-1 bg-background border border-border rounded text-sm"
            >
              <option value="">Select node to take down</option>
              {nodeOptions.map((opt: any) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Add Node Down
          </button>
        </form>
      );

    case "degraded":
      return (
        <form onSubmit={handleSubmit} className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <span className="w-20 text-muted-foreground">Node</span>
            <select
              value={formState.nodeId || ""}
              onChange={(e) =>
                setFormState((s) => ({ ...s, nodeId: e.target.value }))
              }
              className="flex-1 px-2 py-1 bg-background border border-border rounded text-sm"
            >
              <option value="">Select node to degrade</option>
              {nodeOptions.map((opt: any) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="w-20 text-muted-foreground">Factor</span>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.1"
              value={formState.factor || 0.5}
              onChange={(e) =>
                setFormState((s) => ({
                  ...s,
                  factor: parseFloat(e.target.value),
                }))
              }
              className="flex-1 h-2 bg-muted rounded-lg appearance-none accent-primary"
            />
            <span className="w-10 text-right font-mono text-sm">
              {(formState.factor || 0.5).toFixed(1)}x
            </span>
          </label>
          <button
            type="submit"
            className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Add Degradation
          </button>
        </form>
      );

    case "partition":
      return (
        <form onSubmit={handleSubmit} className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <span className="w-20 text-muted-foreground">Edge</span>
            <select
              value={formState.edgeId || ""}
              onChange={(e) =>
                setFormState((s) => ({ ...s, edgeId: e.target.value }))
              }
              className="flex-1 px-2 py-1 bg-background border border-border rounded text-sm"
            >
              <option value="">Select connection to cut</option>
              {edgeOptions.map((opt: any) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Add Partition
          </button>
        </form>
      );

    case "replica_lag":
      return (
        <form onSubmit={handleSubmit} className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <span className="w-20 text-muted-foreground">Database</span>
            <select
              value={formState.nodeId || ""}
              onChange={(e) =>
                setFormState((s) => ({ ...s, nodeId: e.target.value }))
              }
              className="flex-1 px-2 py-1 bg-background border border-border rounded text-sm"
            >
              <option value="">Select database</option>
              {nodeOptions.map((opt: any) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="w-20 text-muted-foreground">Lag (ms)</span>
            <input
              type="number"
              min="1"
              max="60000"
              value={formState.lagMs || 100}
              onChange={(e) =>
                setFormState((s) => ({ ...s, lagMs: parseInt(e.target.value) }))
              }
              className="flex-1 px-2 py-1 bg-background border border-border rounded text-sm"
            />
            <span className="w-10 text-right text-muted-foreground text-sm">
              ms
            </span>
          </label>
          <button
            type="submit"
            className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Add Replica Lag
          </button>
        </form>
      );

    default:
      return null;
  }
}

function FailureItem({
  kind,
  failure,
  graph,
  onUpdate,
  onRemove,
}: {
  kind: string;
  failure: SdFailure;
  graph: SdGraph;
  onUpdate: (updates: Partial<SdFailure>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 p-2 bg-card border border-border rounded">
      <span className="px-2 py-0.5 text-xs font-mono bg-muted rounded text-muted-foreground">
        #{failure.id.slice(-4)}
      </span>
      <div className="flex-1 min-w-0 text-sm text-muted-foreground truncate">
        {isNodeDown(failure) &&
          `Node down: ${getNodeLabel(graph, failure.nodeId)}`}
        {isDegraded(failure) &&
          `Degraded: ${getNodeLabel(graph, failure.nodeId)} × ${failure.factor}x`}
        {isPartition(failure) &&
          `Partition: ${failure.edgeIds[0] ? graph.edges.find((e) => e.id === failure.edgeIds[0])?.from + " → " + graph.edges.find((e) => e.id === failure.edgeIds[0])?.to : "unknown"}`}
        {isReplicaLag(failure) &&
          `Replica lag: ${getNodeLabel(graph, failure.nodeId)} +${failure.lagMs}ms`}
      </div>
      {isDegraded(failure) && (
        <input
          type="range"
          min="0.1"
          max="0.9"
          step="0.1"
          value={failure.factor}
          onChange={(e) => onUpdate({ factor: parseFloat(e.target.value) })}
          className="w-32 h-2 bg-muted rounded-lg appearance-none accent-primary"
        />
      )}
      {isReplicaLag(failure) && (
        <input
          type="number"
          min="1"
          max="60000"
          value={failure.lagMs}
          onChange={(e) => onUpdate({ lagMs: parseInt(e.target.value) })}
          className="w-20 px-2 py-1 bg-background border border-border rounded text-sm"
        />
      )}
      <button
        onClick={onRemove}
        className="p-1 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
        title="Remove"
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </button>
    </div>
  );
}
