import type { SdModule, SdTaskDef } from "../types";
import { defaultNode, getNodeTypeSpec } from "@/lib/system-design/nodes";
/**
 * Module 4 — back-of-the-envelope estimation, converted to the leaf model
 * (plan 17, slice B2).
 *
 * **Netflix anchor.** The migration post supplies the two facts this module
 * needs, and nothing else:
 *
 *   - *"On January 6, 2016, Netflix expanded its service to over 130 new
 *     countries"* — capacity had to be estimated before the demand existed;
 *   - *"we simply could not have racked the servers fast enough"* — lead time is
 *     one of the numbers, and it is the one that ends the argument;
 *   - *"eight times as many streaming members"* and viewing up *"three orders of
 *     magnitude in eight years"* — the unit of estimation is the exponent.
 *
 * **Every figure is a teaching model unless it is quoted.** The post publishes
 * growth ratios, not absolute totals, so the worked example uses a stated
 * 80-million-member assumption and says so at every step. That is the lesson's
 * own rule applied to itself: an assumption you can see is an argument; one you
 * cannot see is a trap.
 *
 * **The task's numbers were measured.** Start graph at 6,000 r/s: 33.3% errors,
 * app at 1.50 utilisation. Four app replicas plus one read replica: 0% errors,
 * 0.75. Capacity planning is the estimate turned into instance counts.
 *
 * The start graph is module 3's solution unchanged — same load balancer, two app
 * replicas, no read replica. That is deliberate: the previous module taught the
 * *structure*, and this one changes only the *numbers* it has to carry. A chain
 * that deleted the load balancer here would unteach the lesson one module later.
 */
const task: SdTaskDef =   {
    brief:
      "The estimate says 6,000 requests per second at peak. That is the number you build against: zero errors, no component above 80% utilisation. Turn the estimate into instance counts — and notice that the store needs attention too.",
    startGraph: {
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
        arrivalRate: 6_000,
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
          label: "Edge",
        },
        {
          ...defaultNode("app_server", "app-1", 420, 180),
          label: "Playback API",
          replicas: 4,
        },
        {
          ...defaultNode("database", "db-1", 620, 180),
          label: "Title store",
          readReplicas: 1,
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
        arrivalRate: 6_000,
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
        id: "size-the-app-tier",
        title: "Size the app tier from the estimate",
        brief:
          "6,000 requests per second at 80% utilisation means 7,500 of capacity. One instance serves 2,000, and there are two of them.",
        hint: "Select the app server and raise its replicas — the load balancer from the last module is already in place.",
        reveal:
          "6,000 ÷ 0.8 = 7,500 requests per second. At 2,000 per instance that is four instances — three would sit at exactly 100% and become the first thing to fail.",
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
      {
        id: "size-the-store",
        title: "The store is the next number",
        brief:
          "One database serves 5,000 requests per second, and 80% of that is 4,000. The estimate is 6,000.",
        hint: "A read replica in the Inspector, or a cache on the read path, both move this.",
        reveal:
          "6,000 requests against a 5,000-per-second store is 120% utilisation — the store sheds before the app does. One read replica doubles the ceiling; a cache removes most of the read traffic instead.",
        check: (g) => {
          const load = g.scenario.arrivalRate;
          const storeCapacity = g.nodes
            .filter((n) => n.type === "database")
            .reduce(
              (total, node) =>
                total +
                getNodeTypeSpec("database").capacity * (1 + node.readReplicas),
              0,
            );
          const hasCache = g.nodes.some((n) => n.type === "cache");
          const needed = load / 0.8;
          return {
            passed: storeCapacity >= needed || hasCache,
            progress: hasCache
              ? "✓ Cache absorbs the read share"
              : `${storeCapacity.toLocaleString()} of ${Math.ceil(
                  needed,
                ).toLocaleString()} requests per second of store capacity`,
          };
        },
      },
    ],
    passCriteria: [
      {
        id: "zero-errors",
        label: "Error rate = 0% at 6,000 requests per second",
        required: true,
        explain:
          "The estimate is the load you plan for. At 6,000 the two app instances run at 150% and shed a third of the traffic — the arithmetic was always going to say this, which is why you do it before the launch.",
        assert: (r) => r.valid && r.errorRate === 0,
      },
      {
        id: "headroom",
        label: "No component above 80% utilisation at peak",
        required: true,
        explain:
          "The same rule as modules 2 and 3, now as capacity planning: 6,000 ÷ 2,000 per instance ÷ 0.8 = four instances, not three. Three is a design at exactly 100%, and the first extra request in the peak minute is an error.",
        assert: (r) => r.valid && r.perNode.every((n) => n.utilisation <= 0.8),
      },
    ]
  }

export default task;

export const title = "Back-of-the-envelope estimation";
