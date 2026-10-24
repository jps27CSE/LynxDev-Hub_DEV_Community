/**
 * The shared contract for the system-design learning path.
 *
 * Every type that content, the engine, the rubric and the canvas all agree on
 * lives in this one dependency-free file. That is not tidiness — it is the only
 * arrangement that avoids a runtime import cycle.
 *
 * `SdPassCriterion.assert` lives in content (`config/system-design/modules/*`)
 * but consumes `SimulationResult`, which only the engine
 * (`lib/system-design/engine.ts`) produces. Put `SimulationResult` in the
 * engine and this file must import it from `lib/`, while the engine imports
 * `SdGraph` from here — a cycle the bundler resolves by hand, not by type.
 * One direction (`config` and `lib` both import this file, and this file
 * imports nothing) is what makes that safe.
 *
 * KEEP THIS FILE DEPENDENCY-FREE — no React, no `config/db`, no imports at
 * all. Feature-tracker item I.9: a `"use client"` component reading a *value*
 * out of a module that reaches `config/db` drags mysql2 and the Node
 * `net`/`tls`/`timers` builtins into the browser bundle and fails the build with
 * `Can't resolve 'net'` — while `tsc` passes, because the violation is a
 * bundler concern and not a type error. `tsc` will not catch a mistake here.
 * `npm run build` will.
 */

/* -------------------------------------------------------------------------- */
/* Nodes                                                                      */
/* -------------------------------------------------------------------------- */

/** Which key the load balancer hands the next connection to. */
export type SdLbAlgorithm = "rr" | "least_conn";

type SdNodeBase = {
  id: string;
  /**
   * The user's name for this instance, seeded from `SdNodeTypeSpec.label` and
   * editable in the Inspector. Two nodes of the same type can carry different
   * labels — "primary" and "replica" — so this is deliberately not the same
   * thing as the type's display name.
   */
  label: string;
  /** Canvas coordinates. Presentation only — never read by the engine. */
  x: number;
  y: number;
};

/**
 * Nine node types, split by `type` rather than one flat shape with nullable
 * fields. The win is at the authoring site: across 14 modules there are ~84
 * step checks and pass criteria, and with the flat shape every one of them
 * needs a null guard, while a missed guard is a runtime crash instead of a
 * compile error. Here, `graph.nodes.find((n) => n.type === "cache")` narrows to
 * `SdCacheNode` and `n.hitRate` is a plain number.
 *
 * The cost is symmetry: a new property means touching the type here *and* the
 * Zod mirror in `lib/system-design/validation.ts`.
 */

export type SdClientNode = SdNodeBase & { type: "client" };

export type SdLoadBalancerNode = SdNodeBase & {
  type: "load_balancer";
  algorithm: SdLbAlgorithm;
  /** Requests per minute allowed through. `null` = unlimited. */
  rateLimitPerMin: number | null;
};

export type SdAppServerNode = SdNodeBase & {
  type: "app_server";
  replicas: number;
  /** Bulkhead: concurrent requests this instance will admit. `null` = no cap. */
  maxConcurrency: number | null;
  breakerEnabled: boolean;
};

export type SdCacheNode = SdNodeBase & {
  type: "cache";
  /** 0..1 chance a request is served here without forwarding. */
  hitRate: number;
  ttlMs: number;
  stampedeGuard: boolean;
};

export type SdDatabaseNode = SdNodeBase & {
  type: "database";
  readReplicas: number;
  partitions: number;
  /** 0..1 share of reads aimed at one key. 0 = evenly spread. */
  hotKeyShare: number;
};

export type SdQueueNode = SdNodeBase & {
  type: "queue";
  maxDepth: number;
  retryLimit: number;
  dlqEnabled: boolean;
};

export type SdWorkerNode = SdNodeBase & {
  type: "worker";
  replicas: number;
};

export type SdCdnNode = SdNodeBase & {
  type: "cdn";
  /** 0..1 share of media requests answered at the edge. Module 10's knob. */
  hitRate: number;
};

export type SdObjectStoreNode = SdNodeBase & { type: "object_store" };

export type SdNode =
  | SdClientNode
  | SdLoadBalancerNode
  | SdAppServerNode
  | SdCacheNode
  | SdDatabaseNode
  | SdQueueNode
  | SdWorkerNode
  | SdCdnNode
  | SdObjectStoreNode;

export type SdNodeType = SdNode["type"];

/**
 * Retry policy for one hop. Lives on the edge rather than the node because a
 * retry is a property of the call, not of the service: "the API retries the
 * resize service three times" is a fact about one connection, not about the API
 * server.
 */
export type SdEdgeRetry = {
  attempts: number;
  backoffMs: number;
  jitter: boolean;
};

export type SdEdge = {
  id: string;
  /** Node ids, not indexes — indexes shift the moment anything is deleted. */
  from: string;
  to: string;
  label: string | null;
  retry: SdEdgeRetry;
  /** Set by the `partition` failure kind: these edges stop carrying traffic. */
  partitioned: boolean;
};

/* -------------------------------------------------------------------------- */
/* Scenario                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * The knobs the learner turns. `arrivalRate` is the only one §5.3 originally
 * described, and on its own it cannot answer most of §10.1's pass criteria:
 * the curriculum is about a photo app, where a read costs 2 ms and the same
 * write costs 8 ms, a photo carries 2 MB, and module 9's whole task is one
 * abusive client hidden inside otherwise-normal traffic.
 *
 * Each addition below exists because a specific criterion is otherwise
 * unprovable — see the decision log in the plan.
 */
export type SdScenario = {
  /** Requests per second offered at the client. */
  arrivalRate: number;
  /**
   * 0..1 share of arrivals that are **writes**. 0 = every request is a read.
   *
   * Named `writeShare`, not `readWriteShare`: the latter reads as "the share of
   * reads and writes combined", which is 1.0 always.
   */
  writeShare: number;
  /** 0..1 share of arrivals that carry a media payload (module 10). */
  mediaShare: number;
  /** Payload size per media request, in bytes. Ignored on non-media arrivals. */
  bytesPerMediaRequest: number;
  /** 0..1 share of arrivals from the abusive client (module 9's bot). */
  abusiveShare: number;
  /** Network jitter added per hop. */
  latencyJitterMs: number;
  /** Every cache starts empty, so the first requests all miss. */
  cacheColdStart: boolean;
  /** Baseline lag on every read replica. The `replica_lag` failure overrides it. */
  replicaLagMs: number;
};

export type SdGraph = {
  nodes: SdNode[];
  edges: SdEdge[];
  scenario: SdScenario;
};

/* -------------------------------------------------------------------------- */
/* Failure injection                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Why a request failed. Kept as classes rather than one `errorRate` scalar
 * because the failure *mode* is the lesson: a dead node produces errors the
 * user can see, a lagging replica produces silently wrong data, and module 6's
 * criterion is specifically about the second.
 */
export type SdErrorClass = "unreachable" | "stale" | "rejected" | "shed";

export type SdFailure =
  /** The node is gone — requests routed through it fail as `unreachable`. */
  | { kind: "node_down"; nodeId: string; id: string }
  /** Capacity multiplied by `factor` — "the region is struggling". */
  | { kind: "degraded"; nodeId: string; factor: number; id: string }
  /** Named edges stop carrying traffic — "services can no longer talk". */
  | { kind: "partition"; edgeIds: string[]; id: string }
  /** Reads through this node's replica return stale data, not an error. */
  | { kind: "replica_lag"; nodeId: string; lagMs: number; id: string };

/* -------------------------------------------------------------------------- */
/* Engine output                                                              */
/* -------------------------------------------------------------------------- */

export type SdNodeResult = {
  id: string;
  /** 0..1. Above 1 means saturated and requests are being shed. */
  utilisation: number;
  /** Little's Law: throughput × latency. The number people never see. */
  concurrency: number;
  /**
   * Time spent in this node's own service, excluding queue wait. Named for
   * `SdNodeTypeSpec.serviceMs` rather than `latencyMs`, because
   * `SimulationResult.latency.p95` already means *total* latency including the
   * queue — one word, two meanings, across two types read together.
   */
  serviceMs: number;
  queueWaitMs: number;
  saturated: boolean;
  down: boolean;
};

export type SimulationResult = {
  valid: boolean;
  invalidReason?: string;
  throughput: number;
  latency: { p50: number; p95: number; p99: number };
  errorRate: number;
  /** Share of requests in each failure class, 0..1. */
  errorClasses: Partial<Record<SdErrorClass, number>>;
  /** Off-origin throughput, so module 10 can ask whether the origin is idle. */
  bandwidthMbps: number;
  perNode: SdNodeResult[];
  bottleneck: { nodeId: string; reason: string; concurrency: number } | null;
  /**
   * Plain-language "why". Not garnish — a simulator that emits numbers without
   * explaining them is a toy. The learner reads these instead of the numbers.
   */
  teaching: string[];
};

/* -------------------------------------------------------------------------- */
/* Rubric — steps check intent, criteria check consequence                    */
/* -------------------------------------------------------------------------- */

export type StepResult = {
  passed: boolean;
  /** Partial progress, not just a verdict. "3 of 4 nodes placed". */
  progress: string;
};

export type SdStep = {
  id: string;
  title: string;
  /** The ask, in beginner language. */
  brief: string;
  /** Tier 2 of the hint ladder. */
  hint: string;
  /** Tier 3 — the reasoning, not the answer. */
  reveal: string;
  check: (g: SdGraph) => StepResult;
};

export type SdPassCriterion = {
  id: string;
  /** The number, written the way it will be shown: "p95 < 150 ms at 50k r/s". */
  label: string;
  /** `false` is advisory — displayed, never blocking. */
  required: boolean;
  assert: (r: SimulationResult) => boolean;
  /** Why this number and not just what it is. Shown while it is blocking. */
  explain: string;
};

/* -------------------------------------------------------------------------- */
/* Content                                                                    */
/* -------------------------------------------------------------------------- */

export type SdLessonSection =
  | { kind: "scenario"; title: string; body: string }
  | { kind: "concept"; title: string; body: string }
  /** One per lesson (§10.3). A graph, so it renders on the same canvas. */
  | { kind: "diagram"; caption: string; graph: SdGraph }
  /** Retrieval practice, before the answer is shown (§10.2). */
  | { kind: "your_turn"; prompt: string }
  | { kind: "compare"; body: string }
  | { kind: "recap"; points: string[] };

export type SdLesson = {
  slug: string;
  title: string;
  sections: SdLessonSection[];
  /** Synthesis is ours; the source we learned it from is not (§10.4). */
  attribution: string;
};

/**
 * Shape · strong answer · **the trap**.
 *
 * The trap is the load-bearing third. Every concept is paired with the answer
 * that sounds right and gets a candidate rejected — a reverse proxy mistaken
 * for a load balancer, a cache in front of writes, a retry with no jitter.
 * That is what an interview actually tests.
 */
export type SdInterviewByte = {
  shape: string;
  strongAnswer: string;
  trap: string;
};

export type SdTaskDef = {
  /** The break, in one line: "The app dies at 500 users. Make it survive 20,000." */
  brief: string;
  /** Pre-wired and deliberately broken (§1, gap 2). Never a blank canvas. */
  startGraph: SdGraph;
  /** Cumulative — module N's solution builds on module N−1's (§10.1). */
  solutionGraph: SdGraph;
  steps: SdStep[];
  passCriteria: SdPassCriterion[];
};

export type SdChapter = {
  /** Unique identifier for the chapter */
  slug: string;
  /** Display title for the chapter */
  title: string;
  /** Description or summary of the chapter */
  description?: string;
  /** Nested sub-chapters (for hierarchical chapter structure) */
  children?: SdChapter[];
  /** Optional lesson slug if this chapter wraps a single lesson */
  lessonSlug?: string;
};

export type SdModule = {
  /** Always identical to the filename under `config/system-design/modules/`. */
  slug: string;
  order: number;
  /** Roadmap part — 0 Mindset, 1 Scale up, 3 Reliability (§10.0). */
  part: number;
  partTitle: string;
  title: string;
  description: string;
  /** Where our app is now, and what just broke. */
  story: string;
  storyIllustration?: {
    chapters?: SdChapter[];
    caption: string;
    before: {
      title: string;
      description: string;
      diagram?: {
        nodes: any[];
        edges: any[];
        scenario: SdScenario;
      };
    };
    after: {
      title: string;
      description: string;
      diagram?: {
        nodes: any[];
        edges: any[];
        scenario: SdScenario;
      };
    };
  };
  /** Chapters organize the learning content into sections */
  chapters?: SdChapter[];
  lessons: SdLesson[];
  interviewByte: SdInterviewByte;
  task: SdTaskDef;
  recap: string[];
  attribution: string;
};

/* -------------------------------------------------------------------------- */
/* Progress                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Persisted, not recomputed. `criteriaMet` in particular: recomputing it means
 * a threshold tweak in a later deploy silently un-passes a completed module
 * and re-blocks the user. A passed gate is permanent (§3.2, §6.2).
 */
export type SdTaskState = {
  graph: SdGraph;
  steps: string[];
  criteriaMet: string[];
  /** Recorded for the platform's own use, never shown as a score. */
  attempts: number;
  /** Criteria opened via the escape hatch — revealed, never passed. */
  revealed: string[];
  updatedAt: string;
};

/** camelCase here; mapped to the snake_case `sd_user_state` columns at the DB edge. */
export type SdUserState = {
  lessonsCompleted: string[];
  tasks: Record<string, SdTaskState>;
};
