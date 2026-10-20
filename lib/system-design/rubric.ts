import type {
  SdGraph,
  SdNode,
  SdEdge,
  SdNodeType,
  SimulationResult,
  StepResult,
  SdStep,
  SdPassCriterion,
} from "@/config/system-design/types";
import { simulate } from "./engine";

/** Count nodes of a given type in the graph. */
function countType(graph: SdGraph, type: SdNodeType): number {
  return graph.nodes.filter((n) => n.type === type).length;
}

/** Check if an edge exists between two node IDs. */
function hasEdge(graph: SdGraph, from: string, to: string): boolean {
  return graph.edges.some((e) => e.from === from && e.to === to);
}

/** Find nodes of a type connected from a given node. */
function findConnected(graph: SdGraph, fromId: string, toType: SdNodeType): SdNode[] {
  const edgeTargets = graph.edges.filter((e) => e.from === fromId).map((e) => e.to);
  return graph.nodes.filter((n) => edgeTargets.includes(n.id) && n.type === toType);
}

/** Find nodes of a type that connect TO a given node. */
function findConnectedTo(graph: SdGraph, toId: string, fromType: SdNodeType): SdNode[] {
  const edgeSources = graph.edges.filter((e) => e.to === toId).map((e) => e.from);
  return graph.nodes.filter((n) => edgeSources.includes(n.id) && n.type === fromType);
}

/** Check if a path exists from source type to target type. */
function pathExists(graph: SdGraph, fromType: SdNodeType, toType: SdNodeType): boolean {
  const fromNodes = graph.nodes.filter((n) => n.type === fromType);
  const toNodes = new Set(graph.nodes.filter((n) => n.type === toType).map((n) => n.id));
  if (fromNodes.length === 0 || toNodes.size === 0) return false;

  const adj = new Map<string, string[]>();
  for (const n of graph.nodes) adj.set(n.id, []);
  for (const e of graph.edges) adj.get(e.from)?.push(e.to);

  for (const start of fromNodes) {
    const visited = new Set<string>();
    const stack = [start.id];
    while (stack.length) {
      const curr = stack.pop()!;
      if (visited.has(curr)) continue;
      visited.add(curr);
      if (toNodes.has(curr)) return true;
      for (const next of adj.get(curr) ?? []) stack.push(next);
    }
  }
  return false;
}

/** Generic step builders for common patterns. */
export const stepBuilders = {
  /** "Add a [type] node" */
  addNode(type: SdNodeType, title: string, brief: string, hint: string, reveal: string): SdStep {
    return {
      id: `add-${type}`,
      title,
      brief,
      hint,
      reveal,
      check: (g: SdGraph) => {
        const n = countType(g, type);
        return {
          passed: n > 0,
          progress: n > 0 ? `✓ ${type} added` : `Add a ${type} node to the canvas`,
        };
      },
    };
  },

  /** "Connect [from] to [to]" */
  connect(fromType: SdNodeType, toType: SdNodeType, title: string, brief: string, hint: string, reveal: string): SdStep {
    return {
      id: `connect-${fromType}-to-${toType}`,
      title,
      brief,
      hint,
      reveal,
      check: (g: SdGraph) => {
        const fromNodes = g.nodes.filter((n) => n.type === fromType);
        if (fromNodes.length === 0) {
          return { passed: false, progress: `No ${fromType} exists yet` };
        }
        let connected = 0;
        for (const from of fromNodes) {
          if (findConnected(g, from.id, toType).length > 0) connected++;
        }
        return {
          passed: connected === fromNodes.length && fromNodes.length > 0,
          progress: `${connected} of ${fromNodes.length} ${fromType}(s) connected to ${toType}`,
        };
      },
    };
  },

  /** "Place [type] between [A] and [B]" — checks the node is on the path. */
  placeBetween(
    middleType: SdNodeType,
    beforeType: SdNodeType,
    afterType: SdNodeType,
    title: string,
    brief: string,
    hint: string,
    reveal: string,
  ): SdStep {
    return {
      id: `place-${middleType}-between-${beforeType}-${afterType}`,
      title,
      brief,
      hint,
      reveal,
      check: (g: SdGraph) => {
        const middles = g.nodes.filter((n) => n.type === middleType);
        if (middles.length === 0) {
          return { passed: false, progress: `No ${middleType} exists yet` };
        }
        let correct = 0;
        for (const m of middles) {
          const hasBefore = findConnectedTo(g, m.id, beforeType).length > 0;
          const hasAfter = findConnected(g, m.id, afterType).length > 0;
          if (hasBefore && hasAfter) correct++;
        }
        return {
          passed: correct > 0,
          progress: correct > 0
            ? `✓ ${middleType} sits between ${beforeType} and ${afterType}`
            : `${middleType} exists but isn't wired between ${beforeType} and ${afterType}`,
        };
      },
    };
  },

  /** "Set property on [type]" */
  setProperty<T extends SdNodeType>(
    type: T,
    property: string,
    validator: (node: SdNode) => boolean,
    title: string,
    brief: string,
    hint: string,
    reveal: string,
  ): SdStep {
    return {
      id: `set-${type}-${property}`,
      title,
      brief,
      hint,
      reveal,
      check: (g: SdGraph) => {
        const nodes = g.nodes.filter((n) => n.type === type);
        if (nodes.length === 0) return { passed: false, progress: `No ${type} exists` };
        const ok = nodes.some(validator);
        return {
          passed: ok,
          progress: ok ? `✓ ${property} configured` : `${property} not set correctly on any ${type}`,
        };
      },
    };
  },
};

/** Common pass criteria builders. */
export const criterionBuilders = {
  /** Latency percentile threshold. */
  latencyPct(pct: 50 | 95 | 99, thresholdMs: number, label: string, explain: string, required = true): SdPassCriterion {
    return {
      id: `latency-p${pct}`,
      label,
      required,
      explain,
      assert: (r: SimulationResult) => r.latency[`p${pct}` as keyof typeof r.latency] < thresholdMs,
    };
  },

  /** Throughput threshold. */
  throughput(minReqPerSec: number, label: string, explain: string, required = true): SdPassCriterion {
    return {
      id: `throughput-${minReqPerSec}`,
      label,
      required,
      explain,
      assert: (r: SimulationResult) => r.throughput >= minReqPerSec,
    };
  },

  /** Error rate threshold. */
  errorRate(maxRate: number, label: string, explain: string, required = true): SdPassCriterion {
    return {
      id: `error-rate-${maxRate}`,
      label,
      required,
      explain,
      assert: (r: SimulationResult) => r.errorRate <= maxRate,
    };
  },

  /** Specific error class rate. */
  errorClass(cls: "unreachable" | "stale" | "rejected" | "shed", maxRate: number, label: string, explain: string, required = true): SdPassCriterion {
    return {
      id: `error-${cls}`,
      label,
      required,
      explain,
      assert: (r: SimulationResult) => (r.errorClasses[cls] ?? 0) <= maxRate,
    };
  },

  /** Bandwidth off-origin threshold (module 10). */
  bandwidthMbps(maxMbps: number, label: string, explain: string, required = true): SdPassCriterion {
    return {
      id: `bandwidth-${maxMbps}`,
      label,
      required,
      explain,
      assert: (r: SimulationResult) => r.bandwidthMbps <= maxMbps,
    };
  },

  /** Per-node average latency (approximation since engine doesn't return per-node percentiles). */
  nodeAvgLatency(nodeId: string, thresholdMs: number, label: string, explain: string, required = true): SdPassCriterion {
    return {
      id: `node-${nodeId}-avg-latency`,
      label,
      required,
      explain,
      assert: (r: SimulationResult) => {
        const pn = r.perNode.find((n) => n.id === nodeId);
        if (!pn) return false;
        // Approximation: average latency = serviceMs + queueWaitMs
        // For true percentiles, engine would need per-node latency arrays.
        const avgLatencyMs = pn.serviceMs + pn.queueWaitMs;
        return avgLatencyMs < thresholdMs;
      },
    };
  },

  /** Zero stale reads (module 6). */
  zeroStaleReads(label: string, explain: string, required = true): SdPassCriterion {
    return {
      id: "zero-stale-reads",
      label,
      required,
      explain,
      assert: (r: SimulationResult) => (r.errorClasses.stale ?? 0) === 0,
    };
  },

  /** Write throughput still succeeds (module 7). */
  writesSucceed(minWriteThroughput: number, label: string, explain: string, required = true): SdPassCriterion {
    return {
      id: "writes-succeed",
      label,
      required,
      explain,
      assert: (r: SimulationResult) => {
        const writeErrors = (r.errorClasses.unreachable ?? 0) + (r.errorClasses.shed ?? 0);
        // Write throughput = total throughput * writeShare (from scenario)
        // Since we don't have scenario in result, approximate from error classes
        // If no write errors, assume writes succeed at some rate
        // Better: engine should return write throughput separately
        const estimatedWriteThroughput = r.throughput * 0.05; // default writeShare
        return writeErrors === 0 && estimatedWriteThroughput >= minWriteThroughput;
      },
    };
  },
};

/** Run a step check against a graph. */
export function runStepCheck(step: SdStep, graph: SdGraph): StepResult {
  return step.check(graph);
}

/** Run all steps for a task and return which pass. */
export function runAllSteps(steps: SdStep[], graph: SdGraph): { passedIds: string[]; results: Map<string, StepResult> } {
  const results = new Map<string, StepResult>();
  const passedIds: string[] = [];
  for (const step of steps) {
    const result = step.check(graph);
    results.set(step.id, result);
    if (result.passed) passedIds.push(step.id);
  }
  return { passedIds, results };
}

/** Evaluate pass criteria against a simulation result. */
export function evaluateCriteria(criteria: SdPassCriterion[], result: SimulationResult): {
  passedIds: string[];
  failedIds: string[];
  details: Map<string, { passed: boolean; label: string }>;
} {
  const passedIds: string[] = [];
  const failedIds: string[] = [];
  const details = new Map<string, { passed: boolean; label: string }>();

  for (const c of criteria) {
    const passed = c.assert(result);
    details.set(c.id, { passed, label: c.label });
    if (passed) passedIds.push(c.id);
    else failedIds.push(c.id);
  }

  return { passedIds, failedIds, details };
}

/** Check if all required criteria pass. */
export function allRequiredPass(criteria: SdPassCriterion[], result: SimulationResult): boolean {
  return criteria.filter((c) => c.required).every((c) => c.assert(result));
}

/** Get the first blocking required criterion for the UI. */
export function getBlockingCriterion(criteria: SdPassCriterion[], result: SimulationResult): SdPassCriterion | null {
  for (const c of criteria) {
    if (c.required && !c.assert(result)) return c;
  }
  return null;
}

/** The escape hatch: load the module's solution graph and mark criteria as revealed. */
export function applyEscapeHatch(
  solutionGraph: SdGraph,
  criteria: SdPassCriterion[],
): { revealed: string[]; result: SimulationResult } {
  const result = simulate(solutionGraph);
  const revealed = criteria.filter((c) => c.required && c.assert(result)).map((c) => c.id);
  return { revealed, result };
}