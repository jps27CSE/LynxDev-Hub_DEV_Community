import type { SdModule, SdTaskDef } from "../types";
import { defaultNode, getNodeTypeSpec } from "@/lib/system-design/nodes";
/**
 * Module 2 — requirements, converted to the leaf model (plan 17, slice B2).
 *
 * **Netflix anchor.** One paragraph of the migration post does the work:
 *
 *   - *"The majority of our systems, including all customer-facing services, had
 *     been migrated to the cloud prior to 2015."*
 *   - *"Since then, we've been taking the time necessary to figure out a secure
 *     and durable cloud path for our billing infrastructure as well as all
 *     aspects of our customer and employee data management."*
 *
 * Two systems, one company, one cloud — and a year between them. The post never
 * says *why* billing had different requirements; it only says the path had to be
 * "secure and durable". So the reasons given in these lessons are labelled as
 * reasoning, not as Netflix's own words. That distinction is the whole discipline
 * of a case study: quote what is published, mark what you inferred.
 *
 * **The task's numbers were measured, not chosen.** `npm`-run simulations of the
 * start and solution graphs on 2026-10-28: start invalid (`No terminal datastore`),
 * solution 0% errors at 3,000 r/s with every node at 0.75 utilisation or below.
 * The 80% rule is the same sentence the learner meets in modules 3 and 4, so the
 * gate teaches one habit three times rather than three unrelated thresholds.
 *
 * **The task graph intentionally starts a new canvas.** `check:system-design`'s
 * chain check warns that this startGraph has no `database` while module 1's
 * solution did. That is the exercise: this canvas is the *membership* service,
 * the second system from "Two systems, one company", and the requirement being
 * tested is durability — so there is no store to inherit. The task brief says so
 * in its first sentence, which is where a reviewer reading the warning lands.
 */
const task: SdTaskDef = {
  brief:
    "The requirement is written down, which means it can fail: zero errors at a peak of 3,000 requests per second, member records that survive a restart, and no component above 80% utilisation at that peak. This canvas is the membership service, not the playback API from module 1 — it starts as one app server and no storage. Make it meet the sentence.",
  startGraph: {
    nodes: [
      { ...defaultNode("client", "client-1", 60, 180), label: "Members" },
      {
        ...defaultNode("app_server", "app-1", 300, 180),
        label: "Membership app",
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
      arrivalRate: 3_000,
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
        ...defaultNode("app_server", "app-1", 300, 180),
        label: "Membership app",
        replicas: 2,
      },
      {
        ...defaultNode("database", "db-1", 520, 180),
        label: "Member records",
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
        label: "durable writes",
        retry: { attempts: 0, backoffMs: 0, jitter: false },
        partitioned: false,
      },
    ],
    scenario: {
      arrivalRate: 3_000,
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
      id: "durable-store",
      title: "Make the record survive a restart",
      brief:
        "The requirement says member records survive a restart. Nothing on this canvas stores anything yet.",
      hint: "Look at the Data section in the palette, then draw the connection.",
      reveal:
        "A request that ends at the app server leaves no trace. Add a database and connect the app to it.",
      check: (g) => {
        const stored = g.edges.some((edge) => {
          const from = g.nodes.find((n) => n.id === edge.from);
          const to = g.nodes.find((n) => n.id === edge.to);
          return (
            from?.type === "app_server" &&
            (to?.type === "database" ||
              to?.type === "object_store" ||
              to?.type === "cache")
          );
        });
        return {
          passed: stored,
          progress: stored
            ? "✓ Storage connected"
            : "Connect the app server to a data store",
        };
      },
    },
    {
      id: "meet-the-peak",
      title: "Meet the peak the requirement states",
      brief:
        "3,000 requests per second, and no component above 80% utilisation. One instance serves 2,000.",
      hint: "Open the app server in the Inspector and raise its replicas.",
      reveal:
        "3,000 ÷ 0.8 = 3,750 requests per second of capacity. At 2,000 per instance that is two instances, not one.",
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
      label: "Error rate = 0% at 3,000 requests per second",
      required: true,
      explain:
        "The number in the requirement, not a round one: at 3,000 one instance saturates and starts shedding. The requirement was written down so this could be failed loudly rather than discovered at launch.",
      assert: (r) => r.valid && r.errorRate === 0,
    },
    {
      id: "headroom",
      label: "No component above 80% utilisation at peak",
      required: true,
      explain:
        "A design that exactly fits its peak is one request away from its first error. 80% leaves room for a burst, a slow query and a deploy. You will meet this same rule in modules 3 and 4.",
      assert: (r) => r.valid && r.perNode.every((n) => n.utilisation <= 0.8),
    },
  ],
};

export default task;

export const title = "Requirements";
