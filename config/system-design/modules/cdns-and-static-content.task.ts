import type { SdEdge, SdGraph, SdTaskDef } from "../types";
import { defaultNode } from "@/lib/system-design/nodes";
/**
 * Module 11 — CDNs and static content, converted to the leaf model (plan 17,
 * slice B6).
 *
 * **Netflix anchor.** Open Connect, Netflix's own CDN, is the case study
 * because the company that pays for the bytes publishes the scheme:
 *
 *   *"We partner with over a thousand ISPs to localize substantial amounts of
 *   traffic with Open Connect Appliance embedded deployments."*
 *
 *   — `openconnect.netflix.com`
 *
 * Three sentences from that page do this module's work. The appliances are
 * *"provided to qualifying ISP partners at no charge"* — the economics: Netflix
 * pays for the box, the ISP pays for rack space, power and connectivity, and
 * nobody pays transit for bytes that never cross a transit link. *"Each
 * embedded OCA deployment will offload a substantial amount of Netflix content
 * traffic from peering or transport circuits"* — the metric: origin egress
 * avoided, not requests served. And the programme exists to *"deliver our
 * content more efficiently"* — a CDN is the same bytes from a nearer place, not
 * fewer bytes.
 *
 * **The task.** 12,000 requests a second, every one a 2 MB video segment,
 * served by one origin store. Measured on the shipped graphs:
 *
 *   - hit rate 0 → origin at **120%**, **20,001 segments shed** (16.7%),
 *     throughput 10,000 r/s, p95 5.24 ms
 *   - hit rate 0.9 → origin at **12.1%**, zero errors, 12,000 r/s
 *   - hit rate 0.95 (the solution) → origin at **6.1%**, zero errors,
 *     12,000 r/s, p95 3.20 ms
 *
 * **The chain warning is deliberate, and answered here.** `check:system-design` warns that this
 * module's `startGraph` drops the `database` node that module 10's solution had. This canvas is the
 * media path, and terminals are chosen at random: wire a metadata store in as a second terminal and
 * half of every arrival stops being a segment request, so the edge hit rate stops being readable and
 * the lesson's arithmetic no longer describes the graph. The database is not gone from the platform
 * — it is off this canvas, for the same reason module 9 dropped the cache. Module 12 inherits the
 * media path and brings its own failure subject.
 *
 * **One model limitation, stated in the module rather than discovered by the
 * learner.** `effectiveCapacity` has no dimension for bytes: a 12,000-request
 * stream of 2 MB segments costs the origin exactly as much as 12,000 tiny JSON
 * responses. And `SimulationResult.bandwidthMbps` counts bytes delivered to
 * viewers per completed request, so it reads **192,000 Mbit/s at both the 50%
 * and the 95% hit rate** (measured) — a CDN does not reduce what the viewer
 * receives. What falls is the origin's arrival rate, which is the only thing the
 * canvas can grade. Lesson 5 says both out loud, and a test asserts the
 * bandwidth figure is unchanged so an engine change cannot quietly falsify the
 * lesson.
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

/**
 * The scenario every graph in this module runs on: 12,000 segment requests a
 * second, 2 MB each. 5% are writes (play events) and every request carries a
 * payload, so the byte arithmetic in lesson 1 is the arithmetic the graph is
 * actually doing.
 */
const scenario = {
  arrivalRate: 12_000,
  writeShare: 0.05,
  mediaShare: 1,
  bytesPerMediaRequest: 2_000_000,
  abusiveShare: 0,
  latencyJitterMs: 0,
  cacheColdStart: false,
  replicaLagMs: 0,
} as const;

/**
 * One door, eight playback instances at 75%, and one origin store that is the
 * only place a segment can come from. The hit rate is the whole exercise.
 */
function graph(hitRate: number): SdGraph {
  return {
    nodes: [
      { ...defaultNode("client", "client-1", 40, 200), label: "Viewers" },
      { ...defaultNode("load_balancer", "lb-1", 220, 200), label: "Edge" },
      {
        ...defaultNode("app_server", "app-1", 400, 200),
        label: "Playback API",
        replicas: 8,
      },
      {
        ...defaultNode("cdn", "cdn-1", 600, 200),
        label: "Open Connect",
        hitRate,
      },
      {
        ...defaultNode("object_store", "origin-1", 820, 200),
        label: "Origin storage",
      },
    ],
    edges: [
      wire("e1", "client-1", "lb-1"),
      wire("e2", "lb-1", "app-1"),
      wire("e3", "app-1", "cdn-1", "segments"),
      wire("e4", "cdn-1", "origin-1", "misses"),
    ],
    scenario: { ...scenario },
  };
}

const task: SdTaskDef = {
  brief:
    "12,000 segment requests a second, each 2 MB, and one origin store answers every one of them: it is at 120% and shedding one request in six. Raise the edge hit rate so the origin is reached only by misses — under 10% — while all 12,000 requests complete.",
  startGraph: graph(0),
  solutionGraph: graph(0.95),
  steps: [
    {
      id: "keep-the-media-path",
      title: "Keep the CDN on the media path",
      brief:
        "Segments must go from the playback API through the CDN to origin storage, so a miss is the only reason the origin is touched.",
      hint: "The graph already has a CDN; check it sits between the playback API and origin storage, not beside them.",
      reveal:
        "The path is client → edge → playback API → CDN → origin storage. Without the CDN in that path the edge has nothing to answer from, and every segment reaches the origin.",
      check: (graph) => {
        const cdn = graph.nodes.find((node) => node.type === "cdn");
        const appIds = new Set(
          graph.nodes
            .filter((node) => node.type === "app_server")
            .map((node) => node.id),
        );
        const storeIds = new Set(
          graph.nodes
            .filter((node) => node.type === "object_store")
            .map((node) => node.id),
        );
        const fedByApp =
          !!cdn &&
          graph.edges.some(
            (edge) => edge.to === cdn.id && appIds.has(edge.from),
          );
        const feedsOrigin =
          !!cdn &&
          graph.edges.some(
            (edge) => edge.from === cdn.id && storeIds.has(edge.to),
          );
        return {
          passed: !!cdn && fedByApp && feedsOrigin,
          progress: !cdn
            ? "No CDN node in the graph"
            : !fedByApp
              ? "The CDN is not fed by the playback API"
              : !feedsOrigin
                ? "The CDN does not reach origin storage, so a miss has nowhere to go"
                : "✓ Segments flow app → CDN → origin storage",
        };
      },
    },
    {
      id: "keep-the-load",
      title: "Do not shrink the problem",
      brief:
        "The traffic is 12,000 requests a second. Lowering the arrival rate changes the question, not the answer.",
      hint: "Check the scenario's arrival rate in the inspector.",
      reveal:
        "A capacity problem is only solved by moving traffic, not by removing it. At 1,000 requests a second the origin would pass every criterion while the production incident continues.",
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
    {
      id: "raise-the-hit-rate",
      title: "Raise the edge hit rate",
      brief:
        "At least 90% of segment requests should be answered at the edge, so at most 10% reach origin storage.",
      hint: "Select the CDN node and raise its hit rate in the inspector.",
      reveal:
        "Set the CDN hit rate to 0.95. At 95%, 600 of the 12,000 requests per second reach the origin — 6% of its capacity — and the other 11,400 are answered where the viewer is.",
      check: (graph) => {
        const cdn = graph.nodes.find((node) => node.type === "cdn");
        const hitRate = (cdn as { hitRate?: number } | undefined)?.hitRate ?? 0;
        const passed = !!cdn && hitRate >= 0.9;
        return {
          passed,
          progress: passed
            ? `✓ Edge answers ${(hitRate * 100).toFixed(0)}% of requests`
            : cdn
              ? `${(hitRate * 100).toFixed(0)}% — raise it to 90% or higher`
              : "Add a CDN node",
        };
      },
    },
  ],
  passCriteria: [
    {
      id: "origin-headroom",
      label: "Origin storage under 10% utilisation",
      required: true,
      explain:
        "The origin should be reached only by cache misses. At a 95% hit rate it sees 600 of the 12,000 requests per second, which is 6% of its 10,000 r/s capacity. A second origin store passes the other criteria while leaving the origin at 60% — adding capacity at the origin is not the same as moving bytes to the edge.",
      assert: (result) => {
        const origin = result.perNode.find((node) => node.id === "origin-1");
        return result.valid && !!origin && origin.utilisation < 0.1;
      },
    },
    {
      id: "zero-errors",
      label: "No request is shed",
      required: true,
      explain:
        "The origin can serve 10,000 requests a second and is offered 12,000, so without caching it refuses the difference. Serving every request is the evidence that the load was moved rather than reduced.",
      assert: (result) =>
        result.valid &&
        (result.errorClasses.shed ?? 0) === 0 &&
        (result.errorClasses.unreachable ?? 0) === 0 &&
        (result.errorClasses.rejected ?? 0) === 0 &&
        (result.errorClasses.stale ?? 0) === 0,
    },
    {
      id: "capacity-served",
      label: "Serves all 12,000 requests per second",
      required: true,
      explain:
        "Throughput is the check that the system kept its load: 10,000 r/s completed at the start because the origin refused the rest. It is not sufficient on its own — two origin stores reach 12,000 while leaving the origin busy — which is why the headroom criterion is the one that names the goal.",
      assert: (result) => result.valid && result.throughput >= 11_500,
    },
  ],
};

export default task;

export const title = "CDNs & Static Content";
