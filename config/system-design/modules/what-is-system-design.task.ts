import type { SdModule, SdTaskDef } from "../types";
import { defaultNode } from "@/lib/system-design/nodes";
/**
 * Module 1 — the mindset module, and the first converted to the leaf model
 * (plan 17, slice B1).
 *
 * **Running case study: Netflix.** Not a photo-sharing app, and not this site —
 * a system whose failures, numbers and decisions are published by the company
 * that lived them. Every claim below traces to one of these:
 *
 *   - `about.netflix.com/news/completing-the-netflix-cloud-migration` — Netflix's
 *     own account of the August 2008 database corruption, the "vertically scaled
 *     single points of failure" phrase, the forklift-vs-rebuild choice, the
 *     seven-year timeline, the January 2016 completion, and the "hundreds of
 *     micro-services" description.
 *   - `openconnect.netflix.com` — Open Connect, the CDN they built because the
 *     last mile is where video bytes become expensive.
 *
 * Chaos Monkey and Hystrix also anchor this case study, but not here: deliberate
 * failure injection is Module 15's subject and the circuit breaker is Module 13's.
 * Module 1 mentions reliability once, in prose, and deliberately cites neither —
 * a source attached to a claim the lesson does not make is decoration.
 *
 * Numbers that are *ours* (the connection-pool arithmetic, the percentile table)
 * are labelled as teaching models, not measurements. The distinction matters:
 * a lesson that dresses an assumption as a benchmark teaches the learner to
 * trust prose instead of checking it.
 */
const task: SdTaskDef = {
  brief:
    "Netflix, 2008, before the cloud. One application, one database, DVD orders to take and a promise that one machine dying does not stop the company. Build the smallest design the numbers actually justify — and be honest about what breaks first.",
  startGraph: {
    nodes: [
      { ...defaultNode("client", "client-1", 60, 180), label: "Members" },
      {
        ...defaultNode("app_server", "app-1", 300, 180),
        label: "Ordering app",
      },
    ],
    edges: [
      {
        id: "e1",
        from: "client-1",
        to: "app-1",
        label: null,
        retry: { attempts: 0, backoffMs: 0, jitter: false },
        partitioned: false,
      },
    ],
    scenario: {
      arrivalRate: 100,
      writeShare: 0.1,
      mediaShare: 0,
      bytesPerMediaRequest: 2_000_000,
      abusiveShare: 0,
      latencyJitterMs: 0,
      cacheColdStart: false,
      replicaLagMs: 0,
    },
  },
  solutionGraph: {
    nodes: [
      { ...defaultNode("client", "client-1", 60, 180), label: "Members" },
      {
        ...defaultNode("app_server", "app-1", 280, 180),
        label: "Ordering app",
      },
      { ...defaultNode("database", "db-1", 500, 180), label: "Order store" },
    ],
    edges: [
      {
        id: "e1",
        from: "client-1",
        to: "app-1",
        label: null,
        retry: { attempts: 0, backoffMs: 0, jitter: false },
        partitioned: false,
      },
      {
        id: "e2",
        from: "app-1",
        to: "db-1",
        label: null,
        retry: { attempts: 0, backoffMs: 0, jitter: false },
        partitioned: false,
      },
    ],
    scenario: {
      arrivalRate: 100,
      writeShare: 0.1,
      mediaShare: 0,
      bytesPerMediaRequest: 2_000_000,
      abusiveShare: 0,
      latencyJitterMs: 0,
      cacheColdStart: false,
      replicaLagMs: 0,
    },
  },
  steps: [
    {
      id: "add-db",
      title: "Give the orders a place to live",
      brief:
        "Orders, member records and shipping status all have to survive a restart. Add storage.",
      hint: "Look at the Data section in the palette.",
      reveal:
        "Nothing is durable without storage: who ordered what, what shipped, what is owed. Add a Database node.",
      check: (g) => {
        const hasDb = g.nodes.some((n) => n.type === "database");
        return {
          passed: hasDb,
          progress: hasDb ? "✓ Database added" : "Add a database node",
        };
      },
    },
    {
      id: "wire-app-db",
      title: "Connect the app to the database",
      brief:
        "The ordering application needs to read and write. Draw the connection.",
      hint: "Drag an edge from the App Server to the Database.",
      reveal:
        "The flow every request takes: client → app → database. Add an edge from the app server to the database.",
      check: (g) => {
        const appNodes = g.nodes.filter((n) => n.type === "app_server");
        if (appNodes.length === 0)
          return { passed: false, progress: "Add an app server first" };
        const connected = appNodes.some((a) =>
          g.edges.some(
            (e) =>
              e.from === a.id &&
              g.nodes.find((n) => n.id === e.to)?.type === "database",
          ),
        );
        return {
          passed: connected,
          progress: connected
            ? "✓ App connected to database"
            : "Connect app server to database",
        };
      },
    },
  ],
  passCriteria: [
    {
      id: "latency-ok",
      label: "p95 < 50ms at 100 concurrent members",
      required: true,
      explain:
        "At this size ordering should feel instant. A higher number means something is wrong that more load will make much worse — which is exactly how 2008 started.",
      assert: (r) => r.valid && r.latency.p95 < 50,
    },
    {
      id: "no-errors",
      label: "Error rate = 0%",
      required: true,
      explain:
        "A minimal, correct design at 100 concurrent members should serve every request. Errors here are capacity, not traffic.",
      assert: (r) => r.valid && r.errorRate === 0,
    },
  ],
};

export default task;

export const title = "What is system design?";
