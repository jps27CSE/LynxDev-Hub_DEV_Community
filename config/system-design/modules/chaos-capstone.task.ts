import type { SdEdge, SdGraph, SdTaskDef } from "../types";
import { defaultNode } from "@/lib/system-design/nodes";
/**
 * Module 15 — the chaos capstone, converted in slice B7 (plan 17).
 *
 * **Netflix anchor.** Chaos Monkey is the tool that made failure a design input
 * rather than an incident: `github.com/Netflix/chaosmonkey` describes a service
 * that terminates instances in production at random, on purpose, on a schedule.
 * The reasoning behind it is the module's thesis — a system whose survival
 * assumes no instance ever dies is a system with an untested assumption in the
 * most expensive possible place. Chaos Kong, one level up, does the same to a
 * whole region.
 *
 * **The task.** This is the capstone, so it uses every tier the path has
 * taught and asks one question: can the design survive being degraded? At
 * 12,000 requests a second with 5 app instances, no read replicas and an edge
 * cache that misses everything, the start graph sheds 16.7% of traffic, runs
 * the API at 120%, the store at 100.1% and the origin at 49.9%. The solution —
 * 10 app instances, 2 read replicas, a 95% edge hit rate — serves all 12,000
 * with the API at 60%, the store at 40% and the origin at 3%, and still serves
 * all 12,000 when both compute tiers are degraded to two thirds (90% and 60%).
 *
 * **Why the acceptance test is degradation, not instance death.** `replicas` is
 * a capacity multiplier in this model, so a `node_down` on `app-1` removes the
 * node and every replica with it: measured, that is 100% unreachable, which
 * grades nothing. `degraded` multiplies capacity and is the only dimension the
 * engine has for "a third of this tier is gone", so that is what the tests
 * assert — and they assert the `node_down` blindness alongside it, so a later
 * engine slice fails the suite instead of quietly invalidating the lesson.
 *
 * **A second terminal reroutes, it does not fail.** With both `origin-1` and
 * `db-1` as terminals, taking `cdn-1` down sends its traffic to the surviving
 * path: measured, 0% errors and the store at 80%. That is not a modelling bug —
 * a reroute is a real behaviour — but it means "take the CDN away" cannot be
 * graded as a failure scenario here, so this module does not pretend to.
 *
 * **Chain note.** `check:system-design` warns that this `startGraph` drops the
 * `cache`, `queue` and `worker` nodes module 14's solution carried. Intentional
 * and answered here: the capstone is the playback path, not the upload path,
 * and carrying a queue with no traffic through it would make the canvas read as
 * though the uploader were part of serving a viewer. Three nodes out of eight
 * is the smallest honest canvas that still contains every tier the reliability
 * part taught.
 *
 * **Video note.** `Pfr_6h3Rqew` is the same walkthrough module 12 opened with,
 * reused deliberately as the capstone's summary; the caption says so rather
 * than duplicating it silently.
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

function playbackGraph(
  appReplicas: number,
  readReplicas: number,
  cdnHitRate: number,
): SdGraph {
  return {
    nodes: [
      { ...defaultNode("client", "client-1", 40, 200), label: "Viewers" },
      { ...defaultNode("load_balancer", "lb-1", 200, 200), label: "Edge" },
      {
        ...defaultNode("app_server", "app-1", 380, 200),
        label: "Playback API",
        replicas: appReplicas,
      },
      {
        ...defaultNode("cdn", "cdn-1", 560, 120),
        label: "Open Connect",
        hitRate: cdnHitRate,
      },
      {
        ...defaultNode("object_store", "origin-1", 740, 120),
        label: "Video store",
      },
      {
        ...defaultNode("database", "db-1", 560, 300),
        label: "Playback store",
        readReplicas,
      },
    ],
    edges: [
      wire("e1", "client-1", "lb-1"),
      wire("e2", "lb-1", "app-1"),
      wire("e3", "app-1", "cdn-1", "media"),
      wire("e4", "cdn-1", "origin-1", "misses"),
      wire("e5", "app-1", "db-1", "metadata"),
    ],
    scenario: {
      arrivalRate: 12_000,
      writeShare: 0.15,
      mediaShare: 0.6,
      bytesPerMediaRequest: 2_000_000,
      abusiveShare: 0,
      latencyJitterMs: 0,
      cacheColdStart: false,
      replicaLagMs: 0,
    },
  };
}

const taskStartGraph = playbackGraph(5, 0, 0);
const taskSolutionGraph = playbackGraph(10, 2, 0.95);

/** The same design at 1,000 r/s — the load a rehearsal at the wrong size uses. */
const conceptGraph = (() => {
  const graph = playbackGraph(5, 0, 0);
  graph.scenario = { ...graph.scenario, arrivalRate: 1_000 };
  return graph;
})();

const task: SdTaskDef = {
  brief:
    "This is the capstone: 12,000 requests a second through the edge, the API tier, the CDN and the store. Size every tier so that losing a third of either compute tier still serves every request, and cache at the edge so the origin is not the bottleneck. Zero requests shed, at least 11,900 served, and no tier above the headroom line.",
  startGraph: taskStartGraph,
  solutionGraph: taskSolutionGraph,
  steps: [
    {
      id: "size-the-api",
      title: "Size the API for a lost third",
      brief:
        "Five instances put the API at 120% of capacity before anything fails. Ten put it at 60%, which is what makes a two-thirds degradation survivable.",
      hint: "Select the Playback API and raise Replicas.",
      reveal:
        "At 12,000 requests a second an instance serves 2,000, so five instances are 10,000 of capacity — already over the load. Nine are 18,000 and land at 66.7%, just over the line; ten are 20,000 and sit at 60%, and 90% when degraded to two thirds.",
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
        "One store node is 5,000 requests a second of capacity against 12,000 of load. Two read replicas take it to 25% of the load and leave room for a lost third.",
      hint: "Select the Playback store and raise Read Replicas.",
      reveal:
        "The store serves 5,000 requests a second per replica set, and each read replica adds one. One replica is 10,000 of capacity and passes the headroom line at 60% — until the edge cache is taken away and the whole 12,000 reroutes here: measured, one replica then goes to 120% and sheds 16.7%. Two replicas are 15,000, sit at 40%, and reach 60% when degraded to two thirds.",
      check: (graph) => {
        const db = graph.nodes.find((node) => node.type === "database");
        const replicas = db?.type === "database" ? db.readReplicas : 0;
        const capacity = 5_000 * (1 + replicas);
        const passed = replicas >= 2;
        return {
          passed,
          progress: passed
            ? `✓ ${replicas} read replica(s) — ${capacity.toLocaleString()} r/s of capacity`
            : `${replicas} read replica(s) — ${capacity.toLocaleString()} r/s of capacity, raise to 2`,
        };
      },
    },
    {
      id: "cache-at-the-edge",
      title: "Take the origin out of the request path",
      brief:
        "An edge cache that misses everything makes the origin a tier on every media request. Raise the hit rate so the origin only sees the misses.",
      hint: "Select Open Connect and raise its hit rate. At 0, every media request reaches the origin.",
      reveal:
        "At a 95% hit rate the origin sees 3% of the traffic instead of 50%. The criterion only asks for under 40%, and a 50% hit rate gets there — but a cache that serves half its traffic is a cache sized for the load it was supposed to remove.",
      check: (graph) => {
        const cdn = graph.nodes.find((node) => node.type === "cdn");
        const hitRate = cdn?.type === "cdn" ? cdn.hitRate : 0;
        const passed = hitRate >= 0.9;
        return {
          passed,
          progress: passed
            ? `✓ ${(hitRate * 100).toFixed(0)}% edge hit rate`
            : `${(hitRate * 100).toFixed(0)}% edge hit rate — the origin sees the misses`,
        };
      },
    },
    {
      id: "keep-the-load",
      title: "Do not shrink the problem",
      brief:
        "12,000 requests a second is the design load. Lowering the arrival rate makes every criterion pass while nothing has been sized.",
      hint: "Check the scenario's arrival rate in the inspector.",
      reveal:
        "At 1,000 requests a second the start graph passes everything. The capstone is not about a quiet system; it is about this one, at this load, losing a third of a tier.",
      check: (graph) => {
        const arrivals = graph.scenario.arrivalRate;
        return {
          passed: arrivals >= 12_000,
          progress:
            arrivals >= 12_000
              ? `✓ ${arrivals.toLocaleString()} r/s — the load is unchanged`
              : `${arrivals.toLocaleString()} r/s is below the 12,000 r/s the design must serve`,
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
        "The start graph sheds 16.7% of traffic across three separate ceilings — the API at 120%, the store at 100.1% and the origin at 49.9%. Every failure class has to be zero.",
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
        "Throughput has to reach the offered rate. The start graph settles at 9,994 a second, and a design that stops shedding at the edge while the origin still saturates has moved the queue, not removed it.",
      assert: (result) => result.valid && result.throughput >= 11_900,
    },
    {
      id: "api-headroom",
      label: "API tier under 66% utilisation",
      required: true,
      explain:
        "Under 66% is what makes a lost third survivable: degrade the tier to two thirds and it lands at 99%, still serving. The start graph is at 120%, which is not a headroom problem but an outage.",
      assert: (result) => {
        const app = result.perNode.find((node) => node.id === "app-1");
        return result.valid && !!app && app.utilisation < 0.66;
      },
    },
    {
      id: "store-headroom",
      label: "Store under 66% utilisation",
      required: true,
      explain:
        "The store is at 100.1% in the start graph, which is why the capstone cannot be solved by sizing compute alone. It has its own criterion because it is its own failure.",
      assert: (result) => {
        const db = result.perNode.find((node) => node.id === "db-1");
        return result.valid && !!db && db.utilisation < 0.66;
      },
    },
    {
      id: "origin-headroom",
      label: "Origin under 40% utilisation",
      required: true,
      explain:
        "The origin is the tier caching exists to protect. At 49.9% in the start graph it is not a cache-fill service, it is a tier serving half the traffic — and a CDN whose misses are that expensive is a CDN that has not been finished.",
      assert: (result) => {
        const origin = result.perNode.find((node) => node.id === "origin-1");
        return result.valid && !!origin && origin.utilisation < 0.4;
      },
    },
  ],
};

export default task;

export const title = "Chaos Capstone: Survive the Loss";
