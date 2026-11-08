import type { SdEdge, SdGraph, SdTaskDef } from "../types";
import { defaultNode } from "@/lib/system-design/nodes";
/**
 * Module 6 — load balancers and stateless services, converted to the leaf model
 * (plan 17, slice B5).
 *
 * **Netflix anchor.** The two halves of "how does a request find a server":
 *
 *   - **Zuul**, which its README calls *"an L7 application gateway that
 *     provides capabilities for dynamic routing, monitoring, resiliency,
 *     security"* — the balancer that sits *in* the path;
 *   - **Eureka**, *"a RESTful service … for the purpose of discovery, load
 *     balancing and failover of middle-tier servers"* — the registry that sits
 *     *outside* it, so an instance can be replaced without anyone being told.
 *
 * Those two sentences are the module: one box that has to be in front, and one
 * idea — replaceable instances — that makes being behind something a safe place
 * to be.
 *
 * **The task was structurally impossible, and the rebuild is measured.** The
 * previous version offered 20,000 r/s to a single load balancer whose capacity
 * in `NODE_TYPES` is exactly 20,000, and its only pass criterion was
 * `assert: (r) => r.valid` — structural validity. Measured on the old solution
 * graph: **90% errors, 2,000 of 20,000 requests served, and the criterion
 * green.**
 *
 * Worse, the engine cannot spread load across *parallel* app nodes: path
 * selection is per terminal datastore (`lib/system-design/engine.ts`,
 * `pathsToTerminals`), so with `app-1..app-3` all leading to one database only
 * the first is ever reached. Measured on the old three-node solution:
 * **app-1 at 200% while app-2 and app-3 sit at 0%.**
 *
 * So the rebuilt task uses the model's own unit for N instances — `replicas` on
 * one app node — and its numbers are measured at 4,000 r/s, where a healthy
 * finish exists: **monolith → 50.0% errors, app at 200%, p95 13.2 ms; balancer
 * + 4 replicas → 0% errors, app at 50%, store at 80%, p95 4.0 ms.** The store
 * at 80% is deliberate: that is the hand-off to module 7, which inherits this
 * shape at 12,000 r/s and finds the cache missing.
 */

/** Every edge in this module is plain: no retries, no partitions. */
const plain = { attempts: 0, backoffMs: 0, jitter: false } as const;

function wire(
  id: string,
  from: string,
  to: string,
  label: string | null = null,
): SdEdge {
  return { id, from, to, label, retry: { ...plain }, partitioned: false };
}

/** The scenario every graph in this module runs on: 4,000 r/s, 5% writes. */
const scenario = {
  arrivalRate: 4_000,
  writeShare: 0.05,
  mediaShare: 0,
  bytesPerMediaRequest: 2_000_000,
  abusiveShare: 0,
  latencyJitterMs: 0,
  cacheColdStart: false,
  replicaLagMs: 0,
} as const;

/** The monolith: one box doing everything, at twice what it can serve. */
const monolithGraph: SdGraph = {
  nodes: [
    { ...defaultNode("client", "client-1", 40, 200), label: "Members" },
    {
      ...defaultNode("app_server", "app-1", 300, 200),
      label: "Monolith",
      replicas: 1,
    },
    { ...defaultNode("database", "db-1", 620, 200), label: "Title store" },
  ],
  edges: [wire("e1", "client-1", "app-1"), wire("e2", "app-1", "db-1")],
  scenario: { ...scenario },
};

/** The same load behind one address and four identical instances. */
const scaledGraph: SdGraph = {
  nodes: [
    { ...defaultNode("client", "client-1", 40, 200), label: "Members" },
    { ...defaultNode("load_balancer", "lb-1", 220, 200), label: "Edge" },
    {
      ...defaultNode("app_server", "app-1", 420, 200),
      label: "Playback API",
      replicas: 4,
    },
    { ...defaultNode("database", "db-1", 640, 200), label: "Title store" },
  ],
  edges: [
    wire("e1", "client-1", "lb-1"),
    wire("e2", "lb-1", "app-1"),
    wire("e3", "app-1", "db-1"),
  ],
  scenario: { ...scenario },
};

const task: SdTaskDef =   {
    brief:
      "The monolith is at 200% and shedding half of everything: 4,000 requests per second at peak, and one app process that serves 2,000. Put one address in front of a fleet and give the app tier enough headroom to survive a busy minute. The store will end up near its own ceiling — that is the next module, not this task.",
    startGraph: monolithGraph,
    solutionGraph: scaledGraph,
    steps: [
      {
        id: "add-lb",
        title: "Put one address in front",
        brief:
          "Members must reach the app tier through a single address, not by connecting to the process directly.",
        hint: "Look in the Traffic category of the palette.",
        reveal:
          "Add a Load balancer between the client and the app tier, and remove the direct client → app edge.",
        check: (g) => {
          const lbs = g.nodes.filter((n) => n.type === "load_balancer");
          if (lbs.length === 0) {
            return { passed: false, progress: "Add a load balancer" };
          }
          const lbIds = new Set(lbs.map((n) => n.id));
          const direct = g.edges.some(
            (e) =>
              g.nodes.some((n) => n.id === e.from && n.type === "client") &&
              g.nodes.some((n) => n.id === e.to && n.type === "app_server"),
          );
          if (direct) {
            return {
              passed: false,
              progress:
                "Clients still reach an app server directly — remove that edge",
            };
          }
          const routes = g.edges.some(
            (e) =>
              lbIds.has(e.from) &&
              g.nodes.some((n) => n.id === e.to && n.type === "app_server"),
          );
          return {
            passed: routes,
            progress: routes
              ? "✓ One address, routed to the app tier"
              : "Connect the balancer to the app tier",
          };
        },
      },
      {
        id: "scale-out",
        title: "Scale the app tier out",
        brief:
          "One process is not enough. Add instances — the canvas models them as `replicas` on the app node.",
        hint: "Select the app server and raise its replica count. Two is not enough.",
        reveal:
          "Three replicas give 6,000 of capacity for 4,000 of load — 67%. Four give 50%, which is where the reference design sits.",
        check: (g) => {
          const apps = g.nodes.filter((n) => n.type === "app_server");
          if (apps.length === 0) {
            return { passed: false, progress: "Add an app server" };
          }
          const capacity = apps.reduce(
            (sum, node) => sum + node.replicas * 2_000,
            0,
          );
          const enough = capacity > 4_000;
          return {
            passed: enough,
            progress: enough
              ? `✓ ${capacity.toLocaleString()} r/s of app capacity for 4,000 offered`
              : `${capacity.toLocaleString()} r/s of app capacity is not more than the 4,000 offered`,
          };
        },
      },
    ],
    passCriteria: [
      {
        id: "zero-errors",
        label: "Error rate = 0% at 4,000 requests per second",
        required: true,
        explain:
          "The monolith sheds 50% of this load. The previous version of this task asked for 20,000 r/s behind a single 20,000 r/s balancer and checked nothing but structural validity — it passed while 90% of traffic was turned away.",
        assert: (r) => r.valid && r.errorRate === 0,
      },
      {
        id: "app-headroom",
        label: "App tier utilisation < 70%",
        required: true,
        explain:
          "Two replicas give exactly 4,000 of capacity for 4,000 of load — 100%, no headroom, and the next request fails. The threshold forces a third instance, which is the difference between sizing for the average and sizing for the peak.",
        assert: (r) => {
          const app = r.perNode.find((n) => n.id === "app-1");
          return !!app && app.utilisation < 0.7;
        },
      },
      {
        id: "edge-headroom",
        label: "Balancer utilisation < 50%",
        required: true,
        explain:
          "The balancer is a box with a ceiling of its own — 20,000 r/s here, which is only ten app instances. At 4,000 it should sit at 20%. If it reads higher, the load is not what the graph says it is.",
        assert: (r) => {
          const lb = r.perNode.find((n) => n.id === "lb-1");
          return !!lb && lb.utilisation < 0.5;
        },
      },
    ]
  }

export default task;

export const title = "Load Balancers & Stateless Services";
