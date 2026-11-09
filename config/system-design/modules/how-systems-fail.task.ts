import type { SdEdge, SdGraph, SdTaskDef } from "../types";
import { defaultNode } from "@/lib/system-design/nodes";
/**
 * Module 12 — how systems fail, converted to the leaf model (plan 17, slice B7).
 *
 * **Netflix anchor.** In July 2011 Netflix published the Simian Army: a set of
 * tools that break production on purpose. Chaos Monkey "randomly disables
 * production instances to make sure we can survive without one"; Chaos Gorilla
 * takes out a whole availability zone; Chaos Kong takes out a whole region.
 * That progression is the module — each tool answers the same question at a
 * different size of blast radius, and `github.com/Netflix/SimianArmy` is the
 * code, not the marketing.
 *
 * **The task.** The playback API serves 12,000 requests a second from four app
 * instances and a store with no replica. Measured: 58.3% of requests are shed,
 * the API runs at 150% of its capacity and the store at 160%, and throughput
 * settles at 5,000 — the store's ceiling. The fix is not "add redundancy
 * somewhere": each tier must be sized so that losing a third of it still leaves
 * capacity. Measured: 10 app instances (60%) and 4 read replicas (48%) serve
 * every request, and still serve every request when both tiers are degraded to
 * two thirds (90% and 72%).
 *
 * **What the canvas cannot show, and what this module does instead.**
 * `replicas` is a capacity multiplier, not redundancy: a `node_down` failure on
 * `app-1` removes the node from the graph and kills every replica at once, so
 * "one of thirteen instances died" is not expressible. `degraded` is — it
 * multiplies capacity — which is why the acceptance test is *capacity after
 * loss* rather than instance death. `tests/system-design-content.test.ts`
 * asserts both halves so the caveat cannot rot: the solution survives a tier
 * degraded to two thirds, and a `node_down` on the store still invalidates the
 * topology.
 *
 * **Why the old task was replaced.** It required `replicas >= 2` and graded
 * `app.utilisation < 0.4` at 1,000 r/s, where a single instance already sits at
 * 50% — so the criterion measured arithmetic, not survival, and the module's
 * own subject (failure) was graded by nothing at all.
 *
 * **Chain note.** `check:system-design` warns that this `startGraph` drops the
 * `cdn` and `object_store` nodes module 11's solution carried. Intentional: the
 * media tier was module 11's canvas, and this module's question — what happens
 * when a tier disappears — is clearest with one terminal, because a second
 * terminal makes the engine reroute every request to it instead of failing any.
 */

const plain = { attempts: 0, backoffMs: 0, jitter: false } as const;

function wire(
  id: string,
  from: string,
  to: string,
  label: string | null = null,
): SdEdge {
  return { id, from, to, label, retry: { ...plain }, partitioned: false };
}

/** Concept graph: the healthy design at a load it can actually serve. */
const conceptScenario = {
  arrivalRate: 1_000,
  writeShare: 0.1,
  mediaShare: 0,
  bytesPerMediaRequest: 2_000_000,
  abusiveShare: 0,
  latencyJitterMs: 0,
  cacheColdStart: false,
  replicaLagMs: 0,
} as const;

function topGraph(
  arrivalRate: number,
  appReplicas: number,
  readReplicas: number,
): SdGraph {
  return {
    nodes: [
      { ...defaultNode("client", "client-1", 40, 200), label: "Viewers" },
      { ...defaultNode("load_balancer", "lb-1", 220, 200), label: "Edge" },
      {
        ...defaultNode("app_server", "app-1", 440, 200),
        label: "Playback API",
        replicas: appReplicas,
      },
      {
        ...defaultNode("database", "db-1", 680, 200),
        label: "Playback store",
        readReplicas,
      },
    ],
    edges: [
      wire("e1", "client-1", "lb-1"),
      wire("e2", "lb-1", "app-1"),
      wire("e3", "app-1", "db-1", "session write"),
    ],
    scenario: { ...conceptScenario, arrivalRate },
  };
}

const conceptGraph = topGraph(1_000, 4, 0);
const stormGraph = topGraph(9_000, 4, 0);
const hardenedGraph = topGraph(12_000, 10, 4);
const taskStartGraph = topGraph(12_000, 4, 0);
const taskSolutionGraph = topGraph(12_000, 10, 4);

const task: SdTaskDef =   {
    brief:
      "The playback API serves 12,000 requests a second from four app instances and a store with no replica. Size every tier so that losing a third of it still leaves the remaining capacity sufficient: zero requests shed, all 12,000 served, and no tier above two thirds of its capacity.",
    startGraph: taskStartGraph,
    solutionGraph: taskSolutionGraph,
    steps: [
      {
        id: "size-the-api",
        title: "Size the API for a lost third",
        brief:
          "Ten app instances give 20,000 requests a second of capacity, so 12,000 is 60% and a third can be lost without crossing capacity.",
        hint: "Select the Playback API and raise Replicas. Six instances still leave it over 100% at this load.",
        reveal:
          "At 12,000 requests a second an instance serves 2,000, so you need 1.5× the load to survive a lost third: 18,000, which is nine instances and above the 65% headroom line. Ten gives 20,000 and sits at 60%.",
        check: (graph) => {
          const app = graph.nodes.find((node) => node.type === "app_server");
          const replicas = app?.type === "app_server" ? app.replicas : 0;
          const passed = replicas >= 10;
          return {
            passed,
            progress: passed
              ? `✓ ${replicas} instances — ${((12_000 / (replicas * 2_000)) * 100).toFixed(0)}% at 12,000 r/s`
              : `${replicas} instances — ${((12_000 / Math.max(1, replicas * 2_000)) * 100).toFixed(0)}% at 12,000 r/s, raise to 10`,
          };
        },
      },
      {
        id: "size-the-store",
        title: "Size the store for a lost third",
        brief:
          "Three read replicas give the store 20,000 requests a second of capacity against 12,000 of load.",
        hint: "Select the Playback store and raise Read Replicas. With none it is already over capacity.",
        reveal:
          "The store serves 5,000 requests a second per replica set. Against 12,000 of load, one replica is 60% and two are 40%; three leaves enough room that losing a third still passes.",
        check: (graph) => {
          const db = graph.nodes.find((node) => node.type === "database");
          const replicas = db?.type === "database" ? db.readReplicas : 0;
          const capacity = 5_000 * (1 + replicas);
          const passed = replicas >= 3;
          return {
            passed,
            progress: passed
              ? `✓ ${replicas} read replica(s) — ${capacity.toLocaleString()} r/s of capacity`
              : `${replicas} read replica(s) — ${capacity.toLocaleString()} r/s of capacity, raise to 3`,
          };
        },
      },
      {
        id: "keep-the-load",
        title: "Do not shrink the problem",
        brief:
          "12,000 requests a second is what the system is being asked to serve. Lowering the arrival rate changes the question, not the answer.",
        hint: "Check the scenario's arrival rate in the inspector.",
        reveal:
          "At 1,000 requests a second every tier is idle and every criterion passes while the production incident continues. A capacity problem is solved by sizing capacity, not by removing the traffic.",
        check: (graph) => {
          const arrivals = graph.scenario.arrivalRate;
          return {
            passed: arrivals >= 12_000,
            progress:
              arrivals >= 12_000
                ? `✓ ${arrivals.toLocaleString()} r/s — the load is unchanged`
                : `${arrivals.toLocaleString()} r/s is below the 12,000 r/s the system is expected to serve`,
          };
        },
      },
    ],
    passCriteria: [
      {
        id: "zero-errors",
        label: "Zero requests shed",
        required: true,
        explain:
          "Four instances and a store with no replica cannot serve 12,000 requests a second: the start graph sheds 58.3% of them. Every failure class has to be zero, not just the one the bottleneck reports.",
        assert: (result) =>
          result.valid &&
          (result.errorClasses.shed ?? 0) === 0 &&
          (result.errorClasses.unreachable ?? 0) === 0 &&
          (result.errorClasses.stale ?? 0) === 0 &&
          (result.errorClasses.rejected ?? 0) === 0,
      },
      {
        id: "capacity-served",
        label: "At least 11,900 requests a second served",
        required: true,
        explain:
          "Shedding nothing at the door is not the same as serving the load. Throughput has to reach the offered rate, or the design has moved the failure rather than fixed it.",
        assert: (result) => result.valid && result.throughput >= 11_900,
      },
      {
        id: "api-headroom",
        label: "API tier under 65% utilisation",
        required: true,
        explain:
          "Under 65% is what makes a lost third survivable: degrade the tier to two thirds and it lands at 90%, still serving. At 100% it has no room for the loss at all.",
        assert: (result) => {
          const app = result.perNode.find((node) => node.id === "app-1");
          return result.valid && !!app && app.utilisation < 0.65;
        },
      },
      {
        id: "store-headroom",
        label: "Store under 65% utilisation",
        required: true,
        explain:
          "The store is the tier that caps throughput at 5,000 in the start graph. Sizing the API alone leaves the store as the bottleneck, which is why it gets its own criterion.",
        assert: (result) => {
          const db = result.perNode.find((node) => node.id === "db-1");
          return result.valid && !!db && db.utilisation < 0.65;
        },
      },
    ]
  }

export default task;

export const title = "How Systems Fail & Blast Radius";
