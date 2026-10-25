import type {
  SdGraph,
  SdNode,
  SdEdge,
  SdScenario,
  SdFailure,
  SdNodeType,
  SdErrorClass,
  SimulationResult,
  SdNodeResult,
} from "@/config/system-design/types";
import { NODE_TYPES, getNodeTypeSpec } from "./nodes";

/** Simulation time window and step size. */
const SIMULATION_WINDOW_SECONDS = 10;
const TIME_STEP_SECONDS = 0.01;
const TOTAL_STEPS = SIMULATION_WINDOW_SECONDS / TIME_STEP_SECONDS;
/** Cap arrivals per step to prevent DoS from malicious scenario. */
const MAX_ARRIVALS_PER_STEP = 50_000;
/** Probability of stale read when replica lag is configured. */
const STALE_READ_PROBABILITY = 0.1;
/** Jitter multiplier for latency jitter (uniform [-1, 1] * jitterMs). */
const JITTER_MULTIPLIER = 0.5;
/** Tier-1 instance connection limit for teaching string. */
const TIER1_CONNECTION_LIMIT = 300;
/** Default cache hit rate. */
const DEFAULT_CACHE_HIT_RATE = 0.9;
/** Default CDN hit rate. */
const DEFAULT_CDN_HIT_RATE = 0.95;

/**
 * Mulberry32 — fast, deterministic, seedable PRNG.
 * Same seed → same byte sequence across runs and machines.
 */
export function createPrng(seed: number) {
  let state = seed >>> 0;
  return function () {
    state += 0x6d2b79f5;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash a string to a 32-bit integer for seeding. */
function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i);
    h |= 0;
  }
  return h >>> 0;
}

/** Build a deterministic seed from the graph structure. */
function graphSeed(graph: SdGraph): number {
  const parts = [
    ...graph.nodes.map((n) => `${n.id}:${n.type}:${n.x}:${n.y}`).sort(),
    ...graph.edges.map((e) => `${e.from}->${e.to}:${e.id}`).sort(),
    String(graph.scenario.arrivalRate),
    String(graph.scenario.writeShare),
    String(graph.scenario.mediaShare),
    String(graph.scenario.bytesPerMediaRequest),
    String(graph.scenario.abusiveShare),
    String(graph.scenario.latencyJitterMs),
    String(graph.scenario.cacheColdStart ? 1 : 0),
    String(graph.scenario.replicaLagMs),
  ];
  return hashString(parts.join("|"));
}

/** Result of precomputation — adjacency and reachability. */
type Precomputed = {
  valid: boolean;
  invalidReason?: string;
  adjacency: Map<string, string[]>;
  reverseAdj: Map<string, string[]>;
  edgeMap: Map<string, SdEdge>; // `${from}->${to}` -> edge
  nodeById: Map<string, SdNode>;
  terminalNodes: string[];
  pathsToTerminals: Map<string, Map<string, string[]>>; // clientId -> terminalId -> path
};

/** Precompute adjacency, validate topology, find the request path from client to each node. */
function precompute(graph: SdGraph, failures: SdFailure[]): Precomputed {
  const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));
  const adjacency = new Map<string, string[]>();
  const reverseAdj = new Map<string, string[]>();

  for (const n of graph.nodes) {
    adjacency.set(n.id, []);
    reverseAdj.set(n.id, []);
  }

  const downNodes = new Set(
    failures.filter((f) => f.kind === "node_down").map((f) => f.nodeId),
  );
  const partitionedEdges = new Set<string>();
  for (const f of failures) {
    if (f.kind === "partition")
      f.edgeIds.forEach((id) => partitionedEdges.add(id));
  }

  const edgeMap = new Map<string, SdEdge>();
  for (const e of graph.edges) {
    edgeMap.set(`${e.from}->${e.to}`, e);
    if (downNodes.has(e.from) || downNodes.has(e.to)) continue;
    if (partitionedEdges.has(e.id)) continue;
    adjacency.get(e.from)?.push(e.to);
    reverseAdj.get(e.to)?.push(e.from);
  }

  const clients = graph.nodes.filter(
    (n) => n.type === "client" && !downNodes.has(n.id),
  );
  if (clients.length === 0) {
    return {
      valid: false,
      invalidReason: "No reachable client node",
      adjacency,
      reverseAdj,
      edgeMap,
      nodeById,
      terminalNodes: [],
      pathsToTerminals: new Map(),
    };
  }

  const visited = new Set<string>();
  const queue = clients.map((c) => c.id);
  for (const id of queue) visited.add(id);

  while (queue.length) {
    const curr = queue.shift()!;
    for (const next of adjacency.get(curr) ?? []) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }

  // Terminal nodes are those with no outgoing edges (excluding down nodes)
  const terminalNodes = graph.nodes
    .filter(
      (n) =>
        !downNodes.has(n.id) &&
        adjacency.get(n.id)!.length === 0 &&
        isDataStore(n.type),
    )
    .map((n) => n.id);

  // If no terminals at all (structural issue), fail
  if (terminalNodes.length === 0) {
    return {
      valid: false,
      invalidReason: "No terminal datastore in graph structure",
      adjacency,
      reverseAdj,
      edgeMap,
      nodeById,
      terminalNodes: [],
      pathsToTerminals: new Map(),
    };
  }

  // For each client, compute paths to each terminal node
  const pathsToTerminals = new Map<string, Map<string, string[]>>();
  for (const client of clients) {
    const paths = new Map<string, string[]>();
    paths.set(client.id, [client.id]);
    const q = [client.id];
    while (q.length) {
      const curr = q.shift()!;
      for (const next of adjacency.get(curr) ?? []) {
        if (!paths.has(next)) {
          paths.set(next, [...paths.get(curr)!, next]);
          q.push(next);
        }
      }
    }
    // Filter to only terminal nodes
    const terminalPaths = new Map<string, string[]>();
    for (const term of terminalNodes) {
      const path = paths.get(term);
      if (path) terminalPaths.set(term, path);
    }
    pathsToTerminals.set(client.id, terminalPaths);
  }

  return {
    valid: true,
    adjacency,
    reverseAdj,
    edgeMap,
    nodeById,
    terminalNodes,
    pathsToTerminals,
  };
}

/** Effective capacity after failures and database partition skew. */
function effectiveCapacity(
  node: SdNode,
  failures: SdFailure[],
  writeShare = 0,
): number {
  const spec = getNodeTypeSpec(node.type);
  let cap = spec.capacity;

  for (const f of failures) {
    if (f.kind === "degraded" && f.nodeId === node.id) cap *= f.factor;
  }

  if (node.type === "app_server" || node.type === "worker") {
    cap *= node.replicas;
  }

  if (node.type === "database") {
    cap *= 1 + node.readReplicas;
    const partitions = node.partitions;
    if (partitions > 1) {
      const readShare = 1 - writeShare;
      const hottestPartitionShare =
        readShare * (node.hotKeyShare + (1 - node.hotKeyShare) / partitions) +
        writeShare / partitions;
      cap /= hottestPartitionShare;
    }
  }

  return cap;
}

/** Service time for a request at a node (read vs write). */
function serviceTime(node: SdNode, isWrite: boolean): number {
  const spec = getNodeTypeSpec(node.type);
  return isWrite ? spec.serviceMs.write : spec.serviceMs.read;
}

/** Check if a node is a cache-like node that can serve locally. */
function isCacheLike(node: SdNode): boolean {
  return node.type === "cache" || node.type === "cdn";
}

/** Check if a node type is a data store (valid terminal). */
function isDataStore(type: SdNodeType): boolean {
  return (
    type === "cache" ||
    type === "database" ||
    type === "object_store" ||
    type === "cdn"
  );
}

/** Simulation state for a single request. */
type RequestState = {
  isWrite: boolean;
  isMedia: boolean;
  isAbusive: boolean;
  payloadBytes: number;
  clientId: string;
  path: string[];
};

/** Result of simulating a single request. */
type RequestResult = {
  failed: boolean;
  failClass?: SdErrorClass;
  failedAtNodeId?: string;
  latencyMs: number;
};

/** Run a single request through the graph. */
function runRequest(
  state: RequestState,
  context: SimulationContext,
  prng: () => number,
): RequestResult {
  const {
    nodeById,
    edgeMap,
    pathsToTerminals,
    downNodes,
    partitionedEdges,
    degradedNodes,
    replicaLagNodes,
    arrivalRate,
    latencyJitterMs,
    cacheColdStart,
    replicaLagMs,
    nodeStats,
  } = context;

  let requestLatency = 0;
  let requestFailed = false;
  let failedAtNode: SdNode | null = null;
  let failClass: SdErrorClass = "unreachable";

  for (let hop = 0; hop < state.path.length - 1; hop++) {
    const fromId = state.path[hop];
    const toId = state.path[hop + 1];
    const toNode = nodeById.get(toId)!;

    // Track arrival at this node
    const toStats = nodeStats.get(toId)!;
    toStats.arrivals++;

    const edge = edgeMap.get(`${fromId}->${toId}`);
    if (!edge || partitionedEdges.has(edge.id)) {
      requestFailed = true;
      failedAtNode = toNode;
      failClass = "unreachable";
      break;
    }

    const spec = getNodeTypeSpec(toNode.type);
    const cap = effectiveCapacity(toNode, context.failures, context.writeShare);
    const serviceMs = serviceTime(toNode, state.isWrite);

    // Calculate utilization based on actual arrival rate at this node
    const actualArrivalRate = toStats.arrivals / SIMULATION_WINDOW_SECONDS;
    const utilization = cap > 0 ? actualArrivalRate / cap : 0;
    const baseQueueWait =
      utilization >= 1
        ? Infinity
        : (utilization / (cap * (1 - utilization))) * 1000;

    const jitter =
      latencyJitterMs > 0
        ? (prng() - JITTER_MULTIPLIER) * 2 * latencyJitterMs
        : 0;
    const queueWait = Math.max(0, baseQueueWait + jitter);
    const thisHopLatency = serviceMs + queueWait;

    requestLatency += thisHopLatency;

    toStats.queueWaits.push(queueWait);
    toStats.services.push(serviceMs);

    // Cache hit check
    if (isCacheLike(toNode) && hop < state.path.length - 1) {
      const cacheNode = toNode as any;
      const hitRate =
        cacheColdStart && toStats.processed === 0 ? 0 : cacheNode.hitRate;
      if (prng() < hitRate) {
        toStats.processed++;
        toStats.latencies.push(requestLatency);
        if (state.payloadBytes) {
          toStats.bytesOut += state.payloadBytes;
        }
        requestFailed = false;
        return { failed: false, latencyMs: requestLatency };
      }
    }

    // Saturation check
    if (utilization >= 1) {
      requestFailed = true;
      failedAtNode = toNode;
      failClass = "shed";
      break;
    }

    // Rate limiting on load balancer for abusive clients
    if (
      toNode.type === "load_balancer" &&
      state.isAbusive &&
      (toNode as any).rateLimitPerMin
    ) {
      const limitPerSec = (toNode as any).rateLimitPerMin / 60;
      if (arrivalRate * context.abusiveShare > limitPerSec) {
        requestFailed = true;
        failedAtNode = toNode;
        failClass = "rejected";
        break;
      }
    }

    // Replica lag check on database reads
    if (toNode.type === "database" && !state.isWrite) {
      const lag = replicaLagMs + (replicaLagNodes.get(toId) ?? 0);
      if (lag > 0 && prng() < STALE_READ_PROBABILITY) {
        requestFailed = true;
        failedAtNode = toNode;
        failClass = "stale";
        break;
      }
    }
  }

  if (requestFailed) {
    return {
      failed: true,
      failClass,
      failedAtNodeId: failedAtNode?.id,
      latencyMs: requestLatency,
    };
  }

  return { failed: false, latencyMs: requestLatency };
}

/** Context passed to runRequest. */
type SimulationContext = {
  nodeById: Map<string, SdNode>;
  edgeMap: Map<string, SdEdge>;
  pathsToTerminals: Map<string, Map<string, string[]>>;
  downNodes: Set<string>;
  partitionedEdges: Set<string>;
  degradedNodes: Map<string, number>;
  replicaLagNodes: Map<string, number>;
  failures: SdFailure[];
  graph: SdGraph;
  arrivalRate: number;
  writeShare: number;
  mediaShare: number;
  bytesPerMedia: number;
  abusiveShare: number;
  latencyJitterMs: number;
  cacheColdStart: boolean;
  replicaLagMs: number;
  nodeStats: Map<string, NodeStats>;
};

/** Per-node statistics during simulation. */
type NodeStats = {
  processed: number;
  errors: Partial<Record<SdErrorClass, number>>;
  latencies: number[];
  queueWaits: number[];
  services: number[];
  bytesOut: number;
  arrivals: number;
};

/** Run the full simulation loop. */
function runSimulation(
  graph: SdGraph,
  failures: SdFailure[],
  pre: Precomputed,
  prng: () => number,
): {
  nodeStats: Map<string, NodeStats>;
  totalArrivals: number;
  totalCompleted: number;
  totalErrors: number;
  totalBytesOut: number;
  allLatencies: number[];
  errorClasses: Partial<Record<SdErrorClass, number>>;
} {
  const { nodeById, pathsToTerminals, terminalNodes } = pre;

  const downNodes = new Set(
    failures.filter((f) => f.kind === "node_down").map((f) => f.nodeId),
  );

  const arrivalRate = graph.scenario.arrivalRate;
  const writeShare = graph.scenario.writeShare;
  const mediaShare = graph.scenario.mediaShare;
  const bytesPerMedia = graph.scenario.bytesPerMediaRequest;
  const abusiveShare = graph.scenario.abusiveShare;
  const latencyJitterMs = graph.scenario.latencyJitterMs;
  const cacheColdStart = graph.scenario.cacheColdStart;
  const replicaLagMs = graph.scenario.replicaLagMs;

  const degradedNodes = new Map<string, number>();
  for (const f of failures) {
    if (f.kind === "degraded") degradedNodes.set(f.nodeId, f.factor);
  }

  const replicaLagNodes = new Map<string, number>();
  for (const f of failures) {
    if (f.kind === "replica_lag") replicaLagNodes.set(f.nodeId, f.lagMs);
  }

  const partitionedEdges = new Set<string>();
  for (const f of failures) {
    if (f.kind === "partition")
      f.edgeIds.forEach((id) => partitionedEdges.add(id));
  }

  // Track per-node statistics
  const nodeStats = new Map<string, NodeStats>();

  for (const n of graph.nodes) {
    nodeStats.set(n.id, {
      processed: 0,
      errors: { unreachable: 0, stale: 0, rejected: 0, shed: 0 },
      latencies: [],
      queueWaits: [],
      services: [],
      bytesOut: 0,
      arrivals: 0,
    });
  }

  let totalArrivals = 0;
  let totalCompleted = 0;
  let totalErrors = 0;
  let totalBytesOut = 0;
  const allLatencies: number[] = [];
  const errorClasses: Partial<Record<SdErrorClass, number>> = {
    unreachable: 0,
    stale: 0,
    rejected: 0,
    shed: 0,
  };

  const context: SimulationContext = {
    nodeById,
    edgeMap: pre.edgeMap,
    pathsToTerminals,
    downNodes,
    partitionedEdges,
    degradedNodes,
    replicaLagNodes,
    failures,
    graph,
    arrivalRate,
    writeShare,
    mediaShare,
    bytesPerMedia,
    abusiveShare,
    latencyJitterMs,
    cacheColdStart,
    replicaLagMs,
    nodeStats,
  };

  const clientNodes = graph.nodes.filter(
    (n) => n.type === "client" && !downNodes.has(n.id),
  );

  for (let step = 0; step < TOTAL_STEPS; step++) {
    const arrivalsThisStep = arrivalRate * TIME_STEP_SECONDS;
    const nArrivals = Math.min(
      MAX_ARRIVALS_PER_STEP,
      Math.floor(arrivalsThisStep + prng()),
    );

    for (let i = 0; i < nArrivals; i++) {
      totalArrivals++;
      const isWrite = prng() < writeShare;
      const isMedia = prng() < mediaShare;
      const isAbusive = prng() < abusiveShare;
      const payloadBytes = isMedia ? bytesPerMedia : 0;

      if (clientNodes.length === 0) {
        totalErrors++;
        errorClasses.unreachable = (errorClasses.unreachable ?? 0) + 1;
        continue;
      }
      const client = clientNodes[Math.floor(prng() * clientNodes.length)];

      // Pick a random terminal node for this request
      const clientTerminalPaths = pathsToTerminals.get(client.id);
      if (!clientTerminalPaths || clientTerminalPaths.size === 0) {
        // No reachable terminals from this client (e.g., due to node_down/partition)
        totalErrors++;
        errorClasses.unreachable = (errorClasses.unreachable ?? 0) + 1;
        const cs = nodeStats.get(client.id)!;
        cs.errors.unreachable = (cs.errors.unreachable ?? 0) + 1;
        continue;
      }
      const terminalIds = Array.from(clientTerminalPaths.keys());
      const targetTerminal =
        terminalIds[Math.floor(prng() * terminalIds.length)];
      const path = clientTerminalPaths.get(targetTerminal)!;

      const requestState: RequestState = {
        isWrite,
        isMedia,
        isAbusive,
        payloadBytes,
        clientId: client.id,
        path,
      };

      const result = runRequest(requestState, context, prng);

      if (result.failed) {
        totalErrors++;
        if (result.failClass) {
          errorClasses[result.failClass] =
            (errorClasses[result.failClass] ?? 0) + 1;
        }
        if (result.failedAtNodeId) {
          const fs = nodeStats.get(result.failedAtNodeId)!;
          if (result.failClass) {
            fs.errors[result.failClass] =
              (fs.errors[result.failClass] ?? 0) + 1;
          }
        }
      } else {
        totalCompleted++;
        allLatencies.push(result.latencyMs);
        if (requestState.payloadBytes)
          totalBytesOut += requestState.payloadBytes;
      }
    }
  }

  return {
    nodeStats,
    totalArrivals,
    totalCompleted,
    totalErrors,
    totalBytesOut,
    allLatencies,
    errorClasses,
  };
}

/** Compute final statistics from simulation results. */
function computeStatistics(
  graph: SdGraph,
  failures: SdFailure[],
  simResult: ReturnType<typeof runSimulation>,
): Omit<SimulationResult, "valid" | "invalidReason" | "teaching"> & {
  perNode: SdNodeResult[];
  bottleneck: SimulationResult["bottleneck"];
} {
  const {
    nodeStats,
    totalArrivals,
    totalCompleted,
    totalErrors,
    totalBytesOut,
    allLatencies,
    errorClasses,
  } = simResult;

  const throughput = totalCompleted / SIMULATION_WINDOW_SECONDS;
  allLatencies.sort((a, b) => a - b);
  const p50 = allLatencies[Math.floor(allLatencies.length * 0.5)] ?? 0;
  const p95 = allLatencies[Math.floor(allLatencies.length * 0.95)] ?? 0;
  const p99 = allLatencies[Math.floor(allLatencies.length * 0.99)] ?? 0;
  const errorRate = totalArrivals > 0 ? totalErrors / totalArrivals : 0;
  const bandwidthMbps =
    (totalBytesOut * 8) / (SIMULATION_WINDOW_SECONDS * 1_000_000);

  const perNode: SdNodeResult[] = [];
  let bottleneckNode: {
    nodeId: string;
    reason: string;
    concurrency: number;
  } | null = null;
  let maxUtil = 0;

  for (const n of graph.nodes) {
    const stats = nodeStats.get(n.id)!;
    const cap = effectiveCapacity(n, failures, graph.scenario.writeShare);
    const actualArrivalRate = stats.arrivals / SIMULATION_WINDOW_SECONDS;
    const util = cap > 0 ? actualArrivalRate / cap : 0;
    const avgLatency =
      stats.latencies.length > 0
        ? stats.latencies.reduce((a, b) => a + b, 0) / stats.latencies.length
        : 0;
    const avgQueueWait =
      stats.queueWaits.length > 0
        ? stats.queueWaits.reduce((a, b) => a + b, 0) / stats.queueWaits.length
        : 0;
    const avgService =
      stats.services.length > 0
        ? stats.services.reduce((a, b) => a + b, 0) / stats.services.length
        : 0;

    // Little's Law per node: concurrency = λ * W where λ = arrival rate at node, W = service + queue time
    const concurrency =
      actualArrivalRate * ((avgService + avgQueueWait) / 1000);

    if (util > maxUtil && n.type !== "client") {
      maxUtil = util;
      bottleneckNode = {
        nodeId: n.id,
        concurrency,
        reason: `${n.label} at ${(util * 100).toFixed(0)}% utilisation — ${cap.toLocaleString()} req/s capacity vs ${actualArrivalRate.toLocaleString()} req/s offered`,
      };
    }

    perNode.push({
      id: n.id,
      utilisation: util,
      concurrency,
      serviceMs: avgService,
      queueWaitMs: avgQueueWait,
      saturated: util >= 1,
      down: failures.some((f) => f.kind === "node_down" && f.nodeId === n.id),
    });
  }

  return {
    throughput,
    latency: { p50, p95, p99 },
    errorRate,
    errorClasses,
    bandwidthMbps,
    perNode,
    bottleneck: bottleneckNode,
  };
}

/** Generate teaching strings from statistics. */
function generateTeaching(
  graph: SdGraph,
  stats: ReturnType<typeof computeStatistics>,
  writeShare: number,
  arrivalRate: number,
): string[] {
  const teaching: string[] = [];

  if (stats.bottleneck) {
    teaching.push(
      `Your ${stats.bottleneck.reason}. At ${arrivalRate} req/s it needs ${Math.round(stats.bottleneck.concurrency)} concurrent connections (L = λW), but a tier-1 instance holds ~${TIER1_CONNECTION_LIMIT}. That is why requests queue here.`,
    );
  }

  const cacheNodes = graph.nodes.filter((n) => n.type === "cache");
  const readShare = 1 - writeShare;
  if (
    cacheNodes.length === 0 &&
    graph.nodes.some((n) => n.type === "database")
  ) {
    teaching.push(
      `Reads are ${Math.round(readShare * 100)}% of your traffic and you are hitting the database for all of them. A cache in front would absorb most of this.`,
    );
  }

  const hasLb = graph.nodes.some((n) => n.type === "load_balancer");
  const appServers = graph.nodes.filter((n) => n.type === "app_server");
  if (!hasLb && appServers.length > 1) {
    teaching.push(
      "You have multiple app servers but no load balancer. Requests cannot spread — add one in front.",
    );
  }

  return teaching;
}

/** Main simulation entry point. */
export function simulate(
  graph: SdGraph,
  failures: SdFailure[] = [],
): SimulationResult {
  const seed = graphSeed(graph);
  const prng = createPrng(seed);

  const pre = precompute(graph, failures);
  if (!pre.valid) {
    return {
      valid: false,
      invalidReason: pre.invalidReason,
      throughput: 0,
      latency: { p50: 0, p95: 0, p99: 0 },
      errorRate: 1,
      errorClasses: {},
      bandwidthMbps: 0,
      perNode: [],
      bottleneck: null,
      teaching: [`Invalid topology: ${pre.invalidReason}`],
    };
  }

  const simResult = runSimulation(graph, failures, pre, prng);
  const computed = computeStatistics(graph, failures, simResult);
  const teaching = generateTeaching(
    graph,
    computed,
    graph.scenario.writeShare,
    graph.scenario.arrivalRate,
  );

  return {
    valid: true,
    ...computed,
    teaching,
  };
}
