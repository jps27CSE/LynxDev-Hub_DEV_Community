import type { SdGraph, SdModule } from "../types";

const NO_RETRY = { attempts: 0, backoffMs: 0, jitter: false };
const WITH_RETRY = { attempts: 3, backoffMs: 50, jitter: true };

function baseNodes(
  replicas: number,
  readReplicas: number,
  partitions: number,
  cacheHit: number,
  cdnHit: number,
  breaker: boolean,
): SdGraph["nodes"] {
  return [
    { id: "client-1", type: "client", label: "Users", x: 40, y: 200 },
    {
      id: "lb-1",
      type: "load_balancer",
      label: "Load Balancer",
      x: 170,
      y: 200,
      algorithm: "least_conn",
      rateLimitPerMin: 6000,
    },
    {
      id: "app-1",
      type: "app_server",
      label: "API",
      x: 320,
      y: 200,
      replicas,
      maxConcurrency: 50,
      breakerEnabled: breaker,
    },
    {
      id: "cache-1",
      type: "cache",
      label: "Cache",
      x: 490,
      y: 120,
      hitRate: cacheHit,
      ttlMs: 60000,
      stampedeGuard: true,
    },
    { id: "cdn-1", type: "cdn", label: "CDN", x: 490, y: 280, hitRate: cdnHit },
    {
      id: "db-1",
      type: "database",
      label: "Database",
      x: 680,
      y: 200,
      readReplicas,
      partitions,
      hotKeyShare: 0.1,
    },
    {
      id: "queue-1",
      type: "queue",
      label: "Queue",
      x: 860,
      y: 200,
      maxDepth: 1000,
      retryLimit: 3,
      dlqEnabled: true,
    },
  ];
}

function baseEdges(): SdGraph["edges"] {
  return [
    {
      id: "e1",
      from: "client-1",
      to: "lb-1",
      label: null,
      retry: NO_RETRY,
      partitioned: false,
    },
    {
      id: "e2",
      from: "lb-1",
      to: "app-1",
      label: null,
      retry: NO_RETRY,
      partitioned: false,
    },
    {
      id: "e3",
      from: "app-1",
      to: "cache-1",
      label: "read",
      retry: NO_RETRY,
      partitioned: false,
    },
    {
      id: "e4",
      from: "app-1",
      to: "cdn-1",
      label: "media",
      retry: NO_RETRY,
      partitioned: false,
    },
    {
      id: "e5",
      from: "app-1",
      to: "db-1",
      label: "write",
      retry: WITH_RETRY,
      partitioned: false,
    },
    {
      id: "e6",
      from: "app-1",
      to: "queue-1",
      label: "enqueue",
      retry: NO_RETRY,
      partitioned: false,
    },
  ];
}

function diagramGraph(hardened: boolean): SdGraph {
  return {
    nodes: baseNodes(
      hardened ? 4 : 1,
      hardened ? 2 : 0,
      hardened ? 8 : 1,
      hardened ? 0.9 : 0,
      hardened ? 0.95 : 0,
      hardened,
    ),
    edges: baseEdges(),
    scenario: {
      arrivalRate: 2_000,
      writeShare: 0.15,
      mediaShare: 0.5,
      bytesPerMediaRequest: 2_000_000,
      abusiveShare: 0.05,
      latencyJitterMs: 5,
      cacheColdStart: false,
      replicaLagMs: 20,
    },
  };
}

function taskGraph(hardened: boolean): SdGraph {
  return diagramGraph(hardened);
}

const module: SdModule = {
  slug: "chaos-capstone",
  order: 14,
  part: 3,
  partTitle: "Reliability",
  kind: "sim",
  title: "Chaos — Capstone",
  description:
    "Every chaos toggle at once. Survive node deaths, partitions, degradation, and replica lag with the design you have built across 13 modules.",
  story:
    "This is the capstone. The photo-sharing app has grown from 100 users to a system with load balancing, caching, replicas, sharding, rate limiting, a CDN, timeouts, circuit breakers, bulkheads, idempotency, and a dead-letter queue. Now turn on every chaos toggle at once — kill the leader, partition a replica, degrade a region — and watch whether the design holds. This is what load testing cannot teach.",
  chapters: [
    {
      slug: "chaos-practice",
      title: "Chaos as a practice",
      description:
        "Inject failure on purpose, before production does it for you.",
      children: [
        {
          slug: "why-inject",
          title: "Why inject failure",
          description: "Find weaknesses in a controlled setting.",
        },
        {
          slug: "what-silently-returns-wrong-data",
          title: "What silently returns wrong data",
          description: "Replica lag produces wrong answers, not errors.",
        },
      ],
    },
    {
      slug: "surviving-everything",
      title: "Surviving everything",
      description: "All four failure kinds at once.",
      children: [
        {
          slug: "node-down",
          title: "Node down",
          description: "A node is gone; traffic must reroute.",
        },
        {
          slug: "partition-and-degrade",
          title: "Partition and degrade",
          description: "Network splits and regional degradation.",
        },
      ],
    },
  ],
  lessons: [
    {
      slug: "chaos-as-practice",
      title: "Chaos as a practice",
      attribution: "Synthesised from donnemartin/system-design-primer",
      sections: [
        {
          kind: "scenario",
          title: "Everything breaks at once",
          body: "Load testing shows a design handles 100k req/s. It says nothing about what happens when a node dies, a replica lags, or a network partitions. Real designs die in those moments. Chaos engineering injects those failures on purpose, in a controlled setting, before production does it for you.",
        },
        {
          kind: "concept",
          title: "The four failure kinds",
          body: "Node down: the node is gone and requests through it fail. Degraded: capacity drops (a struggling region). Partition: named edges stop carrying traffic. Replica lag: reads return stale data, not errors. The last is the dangerous one — it produces silently wrong data, not an outage, which is why it is so hard to detect in production.",
        },
        {
          kind: "diagram",
          caption: "The full hardened design",
          graph: diagramGraph(true),
        },
        {
          kind: "your_turn",
          prompt:
            "Pick one node in the hardened design. What happens if it dies? Which users are affected, and for how long?",
        },
        {
          kind: "compare",
          body: "A beginner load-tests and ships. A senior engineer chaos-tests: kills the leader, partitions a replica, degrades a region, and verifies the design degrades gracefully rather than collapsing.",
        },
        {
          kind: "video",
          videoId: "Pfr_6h3Rqew",
          title:
            "System Design Basics in Bangla | Scalability + Availability + Consistency + Fault Tolerance Explained",
          caption:
            "Bangla walkthrough of fault tolerance — the capstone theme.",
        },
        {
          kind: "concept",
          title: "Go deeper (free reads)",
          body: "Free reading on chaos and resilience:\n\n- [Netflix Tech Blog — Chaos Engineering](https://netflixtechblog.com/tagged/chaos-engineering) — origin of chaos engineering.\n- [Principles of Chaos Engineering](https://principlesofchaos.org/) — the manifesto.\n- [Google SRE Book — Embracing Risk](https://sre.google/sre-book/embracing-risk/) — free online.\n- [AWS: Well-Architected Reliability Pillar](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/) — free guide.",
        },
        {
          kind: "recap",
          points: [
            "Load is not failure; failure injection is",
            "Node down, degraded, partition, replica lag",
            "Replica lag produces wrong data, not errors",
            "Chaos finds weaknesses before production does",
          ],
        },
      ],
    },
    {
      slug: "surviving-everything",
      title: "Surviving everything",
      attribution: "Synthesised from donnemartin/system-design-primer",
      sections: [
        {
          kind: "scenario",
          title: "All toggles on",
          body: "Turn on every chaos toggle at once: kill a node, partition an edge, degrade a region, lag a replica. The design should not collapse. Some requests may fail or return stale data, but the system stays up and recovers when the failure clears.",
        },
        {
          kind: "concept",
          title: "Graceful degradation",
          body: "A resilient system degrades gracefully: it serves cached or stale data, returns degraded responses, and sheds load rather than collapsing. The goal is not zero failures; it is bounded blast radius and recovery. Every module you have built contributes: replicas absorb deaths, breakers stop cascades, bulkheads cap damage, DLQs park poison messages.",
        },
        {
          kind: "your_turn",
          prompt:
            "With all four failure kinds active, which user-facing symptom would you accept, and which would you refuse to ship?",
        },
        {
          kind: "compare",
          body: "A beginner claims the design is 'highly available' without testing failure. A senior engineer runs the chaos toggles, measures blast radius, and ships only when degradation is bounded and recovery is automatic.",
        },
        {
          kind: "recap",
          points: [
            "Graceful degradation beats collapse",
            "Bounded blast radius is the goal",
            "Recovery must be automatic",
            "Every module contributes to resilience",
          ],
        },
      ],
    },
  ],
  interviewByte: {
    shape:
      "Every chaos toggle at once. How does your design survive, and what degrades?",
    strongAnswer:
      "With replicas, a node death is absorbed by the load balancer. With a circuit breaker, a dead dependency stops being called and the API serves degraded responses. With a bulkhead, concurrency to a slow dependency is capped. With a CDN and cache, most reads never reach the origin. With rate limiting, a bot cannot drown real users. With idempotency keys and a DLQ, retries are safe and poison messages are parked. Under all four failure kinds, the app degrades: some requests fail or return stale data, but the system stays up and recovers automatically when failures clear.",
    trap: "Claiming the design has zero failures under chaos. A resilient system degrades; it does not pretend nothing broke.",
  },
  task: {
    brief:
      "The full hardened design. Verify it stays up with healthy utilisation across all nodes.",
    startGraph: taskGraph(false),
    solutionGraph: taskGraph(true),
    steps: [
      {
        id: "harden-design",
        title: "Harden the design",
        brief:
          "Enable redundancy across app, database, cache, CDN, and breaker so no single node is a SPOF.",
        hint: "Raise replicas, read replicas, partitions, cache hit rate, CDN hit rate, and enable the breaker.",
        reveal:
          "Set app replicas 4, db read replicas 2, partitions 8, cache hit 0.9, CDN hit 0.95, breaker on, maxConcurrency 50.",
        check: (graph) => {
          const app = graph.nodes.find((n) => n.type === "app_server");
          const db = graph.nodes.find((n) => n.type === "database");
          const cache = graph.nodes.find((n) => n.type === "cache");
          const cdn = graph.nodes.find((n) => n.type === "cdn");
          const passed =
            !!app &&
            (app as any).replicas >= 4 &&
            !!db &&
            (db as any).readReplicas >= 2 &&
            (db as any).partitions >= 8 &&
            !!cache &&
            (cache as any).hitRate >= 0.9 &&
            !!cdn &&
            (cdn as any).hitRate >= 0.95 &&
            !!app &&
            (app as any).breakerEnabled === true;
          return {
            passed,
            progress: passed
              ? "✓ Design hardened"
              : "Enable redundancy on all nodes",
          };
        },
      },
    ],
    passCriteria: [
      {
        id: "p95",
        label: "p95 < 200 ms",
        required: true,
        explain:
          "With caching, replicas, and breakers, latency stays low even under load.",
        assert: (result) => result.valid && result.latency.p95 < 200,
      },
      {
        id: "error-rate",
        label: "Error rate < 5%",
        required: true,
        explain:
          "Redundancy and breakers keep failures bounded so almost all requests succeed.",
        assert: (result) => result.valid && result.errorRate < 0.05,
      },
      {
        id: "app-headroom",
        label: "App utilisation < 50%",
        required: true,
        explain:
          "Four app replicas spread load so no single instance is saturated.",
        assert: (result) => {
          const app = result.perNode.find((node) => node.id === "app-1");
          return result.valid && !!app && app.utilisation < 0.5;
        },
      },
      {
        id: "db-headroom",
        label: "Database utilisation < 50%",
        required: true,
        explain: "Caching and replicas keep the database out of saturation.",
        assert: (result) => {
          const db = result.perNode.find((node) => node.id === "db-1");
          return result.valid && !!db && db.utilisation < 0.5;
        },
      },
    ],
  },
  recap: [
    "Load is not failure; failure injection is",
    "Node down, degraded, partition, replica lag",
    "Replica lag produces wrong data, not errors",
    "Graceful degradation beats collapse",
    "Every module contributes to resilience",
  ],
  attribution:
    "Synthesised from donnemartin/system-design-primer (375k★), algomaster.io and KodeKloud System Design For Beginners",
};

export default module;
