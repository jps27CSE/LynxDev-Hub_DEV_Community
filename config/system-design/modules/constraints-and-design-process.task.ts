import type { SdModule, SdTaskDef } from "../types";
import { defaultNode, getNodeTypeSpec } from "@/lib/system-design/nodes";
/**
 * Module 3 — constraints and the design process, converted to the leaf model
 * (plan 17, slice B2).
 *
 * **Netflix anchor.** The same migration post, read as a process document rather
 * than a reliability story:
 *
 *   - the timeline — begun August 2008, *"after seven years of diligent effort"*,
 *     completed January 2016;
 *   - the sequencing — customer-facing systems before 2015, billing and data
 *     afterwards;
 *   - the constraint — *"we simply could not have racked the servers fast
 *     enough"*, which is a lead-time fact, not a cash fact;
 *   - the published trade — the forklift paragraph, in their own words.
 *
 * The video is a narrated walkthrough of a video-platform architecture. It is a
 * supplement: the lesson reads correctly with the embed removed.
 *
 * **The task's numbers were measured.** Start graph at 1,800 r/s: 0% errors but
 * the app at 0.90 utilisation. Solution: load balancer plus two replicas, 0.45.
 * That gap is the whole lesson — a design can be *working* and still be one
 * request away from the cliff.
 */
const task: SdTaskDef = {
  brief:
    "The review's last question is always the same: what breaks first? This design works at 1,800 requests per second with zero errors — and the app server is already at 90% of its capacity. Put one door in front, give yourself room, and make the numbers show it.",
  startGraph: {
    nodes: [
      { ...defaultNode("client", "client-1", 60, 180), label: "Members" },
      {
        ...defaultNode("app_server", "app-1", 300, 180),
        label: "Playback API",
      },
      {
        ...defaultNode("database", "db-1", 520, 180),
        label: "Title store",
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
      {
        id: "e2",
        from: "app-1",
        to: "db-1",
        label: "reads",
        retry: { attempts: 0, backoffMs: 0, jitter: false },
        partitioned: false,
      },
    ],
    scenario: {
      arrivalRate: 1_800,
      writeShare: 0.05,
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
        ...defaultNode("load_balancer", "lb-1", 240, 180),
        label: "One door",
      },
      {
        ...defaultNode("app_server", "app-1", 420, 180),
        label: "Playback API",
        replicas: 2,
      },
      {
        ...defaultNode("database", "db-1", 620, 180),
        label: "Title store",
      },
    ],
    edges: [
      {
        id: "e1",
        from: "client-1",
        to: "lb-1",
        label: null,
        retry: { attempts: 0, backoffMs: 0, jitter: false },
        partitioned: false,
      },
      {
        id: "e2",
        from: "lb-1",
        to: "app-1",
        label: null,
        retry: { attempts: 0, backoffMs: 0, jitter: false },
        partitioned: false,
      },
      {
        id: "e3",
        from: "app-1",
        to: "db-1",
        label: "reads",
        retry: { attempts: 0, backoffMs: 0, jitter: false },
        partitioned: false,
      },
    ],
    scenario: {
      arrivalRate: 1_800,
      writeShare: 0.05,
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
      id: "one-door",
      title: "Put one door in front",
      brief:
        "Every client request should arrive at a single entry point, and nothing should reach the app server directly — a load balancer that can be bypassed is decoration.",
      hint: "Add a load balancer, wire the client to it, then delete the direct client → app edge.",
      reveal:
        "Client → load balancer → app server. The direct edge is the one that lets a client skip the door during a deploy.",
      check: (g) => {
        const lb = g.nodes.find((n) => n.type === "load_balancer");
        if (!lb) return { passed: false, progress: "Add a load balancer" };
        const wired = g.edges.some(
          (edge) =>
            edge.to === lb.id &&
            g.nodes.find((n) => n.id === edge.from)?.type === "client",
        );
        const bypass = g.edges.some((edge) => {
          const from = g.nodes.find((n) => n.id === edge.from);
          const to = g.nodes.find((n) => n.id === edge.to);
          return from?.type === "client" && to?.type === "app_server";
        });
        if (!wired)
          return {
            passed: false,
            progress: "Connect a client to the balancer",
          };
        return {
          passed: !bypass,
          progress: bypass
            ? "Remove the direct client → app server edge"
            : "✓ One door, no bypass",
        };
      },
    },
    {
      id: "headroom",
      title: "Leave headroom at peak",
      brief:
        "1,800 requests per second, no component above 80% utilisation. One instance serves 2,000.",
      hint: "The app server's replicas live in the Inspector.",
      reveal:
        "1,800 ÷ 0.8 = 2,250 requests per second of required capacity. Two instances give 4,000, which is 45% utilisation — room for a burst and a deploy.",
      check: (g) => {
        const appCapacity = g.nodes
          .filter((n) => n.type === "app_server")
          .reduce(
            (total, node) =>
              total + getNodeTypeSpec("app_server").capacity * node.replicas,
            0,
          );
        const needed = g.scenario.arrivalRate / 0.8;
        return {
          passed: appCapacity >= needed,
          progress: `${appCapacity.toLocaleString()} of ${Math.ceil(
            needed,
          ).toLocaleString()} requests per second of app capacity`,
        };
      },
    },
  ],
  passCriteria: [
    {
      id: "zero-errors",
      label: "Error rate = 0% at 1,800 requests per second",
      required: true,
      explain:
        "The start design already reaches this, and that is the point: a design can be error-free and still one burst away from shedding. The next criterion is the review question.",
      assert: (r) => r.valid && r.errorRate === 0,
    },
    {
      id: "headroom",
      label: "No component above 80% utilisation at peak",
      required: true,
      explain:
        "The app starts at 90%. At that level a single extra request lengthens the queue, and queue wait is what turns a working design into a cliff. This is the module 2 rule applied as a review question: what breaks first?",
      assert: (r) => r.valid && r.perNode.every((n) => n.utilisation <= 0.8),
    },
  ],
};

export default task;

export const title = "Constraints & the design process";
