import type { SdEdge, SdGraph, SdTaskDef } from "../types";
import { defaultNode } from "@/lib/system-design/nodes";
/**
 * Module 13 — timeouts, retries and circuit breakers, converted in slice B7.
 *
 * **Netflix anchor.** Hystrix is the library Netflix open-sourced in 2012 to
 * stop one slow dependency from consuming every thread in the JVM. Its README
 * describes the problem in the same words this module does: without isolation,
 * "a single dependency ... can saturate all of the container's user threads".
 * `github.com/Netflix/Hystrix` is the artifact; the module is the reasoning
 * that produced it.
 *
 * **The task, and why it looks the way it does.** The image API calls a resize
 * service on every new asset. Measured at 6,000 requests a second: the resize
 * tier runs at 149% of its capacity and 16.5% of *all* traffic is shed, while
 * the metadata store sits at 30%. Stopping the call — the canvas's model of an
 * open breaker with a fallback — and giving the metadata store one read replica
 * serves all 6,000 with zero shed (metadata at 60%). Remove the resize call but
 * leave the store at one node and the fallback cannot carry the load: the store
 * runs at 120% and sheds 16.7%. That second measurement is the lesson, and it
 * is why `fallback-carries-the-load` is a step rather than a paragraph.
 *
 * **What this canvas does not model — asserted, not described.**
 * `breakerEnabled` and `maxConcurrency` are real fields, visible in the
 * inspector and persisted with the graph, and the engine never reads either of
 * them; neither does it read `edge.retry`. There is no timeout dimension, no
 * half-open state and no trip threshold. The task therefore grades the decision
 * the engine *can* see — the dependency is no longer in the request path — and
 * an advisory criterion for the failover path's headroom. The limitation is
 * stated in lesson 3 where a learner looks for the breaker, and
 * `tests/system-design-content.test.ts` asserts that toggling the flag changes
 * nothing, so a later engine slice fails the suite instead of silently
 * falsifying the lesson.
 *
 * **Why the old task was replaced.** Its "solution" differed from its start
 * only in app `replicas` (1 → 2); the breaker and bulkhead it graded were inert,
 * so the module taught a checkbox. Its criterion (`app.utilisation < 0.5`) at
 * 1,500 requests a second passed on arithmetic alone.
 *
 * **Chain note.** `check:system-design` is satisfied here: the resize node and
 * its object store stay in the solution graph, with no traffic reaching them —
 * which is what an open breaker actually looks like. Losing the store, not the
 * dependency, is the failure this task has to survive.
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

function imageGraph(
  arrivalRate: number,
  resizePath: boolean,
  readReplicas: number,
  resizeReplicas = 1,
): SdGraph {
  const edges = [
    wire("e1", "client-1", "lb-1"),
    wire("e2", "lb-1", "api-1"),
    wire("e5", "api-1", "db-1", "metadata"),
  ];
  if (resizePath) {
    edges.push(wire("e3", "api-1", "resize-1", "resize"));
    edges.push(wire("e4", "resize-1", "origin-1", "store"));
  }
  return {
    nodes: [
      { ...defaultNode("client", "client-1", 40, 200), label: "Viewers" },
      { ...defaultNode("load_balancer", "lb-1", 200, 200) },
      {
        ...defaultNode("app_server", "api-1", 380, 200),
        label: "Image API",
        replicas: 4,
      },
      {
        ...defaultNode("app_server", "resize-1", 560, 120),
        label: "Resize",
        replicas: resizeReplicas,
      },
      {
        ...defaultNode("object_store", "origin-1", 740, 120),
        label: "Resized store",
      },
      {
        ...defaultNode("database", "db-1", 560, 300),
        label: "Metadata",
        readReplicas,
      },
    ],
    edges,
    scenario: {
      arrivalRate,
      writeShare: 0.1,
      mediaShare: 0,
      bytesPerMediaRequest: 2_000_000,
      abusiveShare: 0,
      latencyJitterMs: 0,
      cacheColdStart: false,
      replicaLagMs: 0,
    },
  };
}

const healthyGraph = imageGraph(500, true, 0);
const stormGraph = imageGraph(12_000, true, 1);
const taskStartGraph = imageGraph(6_000, true, 1);
const taskSolutionGraph = imageGraph(6_000, false, 1);

const task: SdTaskDef =   {
    brief:
      "The resize service is over capacity and the API calls it on every new asset. Stop calling it, and make sure the metadata path can carry the whole load on its own: 6,000 requests a second with zero shed.",
    startGraph: taskStartGraph,
    solutionGraph: taskSolutionGraph,
    steps: [
      {
        id: "stop-calling-the-dead-service",
        title: "Take the dependency out of the request path",
        brief:
          "The resize tier cannot answer. Remove the API's call to it so those requests fail fast and serve the original asset instead of waiting.",
        hint: "Select the edge from the Image API to the Resize node and delete it. The Resize and Resized store nodes stay — nothing is calling them.",
        reveal:
          "An open breaker is a decision not to call. On the canvas that means deleting the `api-1 → resize-1` edge: the resize tier and its store remain deployed and receive no traffic, which is exactly what the open state looks like in production.",
        check: (graph) => {
          const called = graph.edges.some(
            (edge) => edge.from === "api-1" && edge.to === "resize-1",
          );
          return {
            passed: !called,
            progress: called
              ? "The API still calls the resize tier on every asset"
              : "✓ Resize call removed — the tier receives no traffic",
          };
        },
      },
      {
        id: "fallback-carries-the-load",
        title: "Size the surviving path for failover",
        brief:
          "With the resize call gone, every request lands on the metadata store. Give it a read replica so it can carry the whole 6,000 r/s.",
        hint: "Select the Metadata store and raise Read Replicas. One node is 5,000 r/s of capacity against 6,000 of load.",
        reveal:
          "One replica doubles the store to 10,000 requests a second, so 6,000 of load is 60%. Without it the store runs at 120% and sheds 16.7% — the fallback becomes the outage.",
        check: (graph) => {
          const db = graph.nodes.find((node) => node.type === "database");
          const replicas = db?.type === "database" ? db.readReplicas : 0;
          const passed = replicas >= 1;
          return {
            passed,
            progress: passed
              ? `✓ ${replicas} read replica(s) — ${(5_000 * (1 + replicas)).toLocaleString()} r/s of failover capacity`
              : "One store node is 5,000 r/s of capacity; failover needs more",
          };
        },
      },
      {
        id: "keep-the-load",
        title: "Do not shrink the problem",
        brief:
          "6,000 requests a second is what the system serves. Dropping the arrival rate hides the failover requirement instead of meeting it.",
        hint: "Check the scenario's arrival rate in the inspector.",
        reveal:
          "At 1,000 requests a second the store passes on one node and the fallback looks free. The requirement is 6,000, and that is the number the failover path must carry.",
        check: (graph) => {
          const arrivals = graph.scenario.arrivalRate;
          return {
            passed: arrivals >= 6_000,
            progress:
              arrivals >= 6_000
                ? `✓ ${arrivals.toLocaleString()} r/s — the load is unchanged`
                : `${arrivals.toLocaleString()} r/s is below the 6,000 r/s the system is expected to serve`,
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
          "With the resize call in the path, 16.5% of all requests are shed because the resize tier is at 149%. Every failure class has to be zero, so a fallback that simply moves the shedding does not pass.",
        assert: (result) =>
          result.valid &&
          (result.errorClasses.shed ?? 0) === 0 &&
          (result.errorClasses.unreachable ?? 0) === 0 &&
          (result.errorClasses.stale ?? 0) === 0 &&
          (result.errorClasses.rejected ?? 0) === 0,
      },
      {
        id: "capacity-served",
        label: "At least 5,900 requests a second served",
        required: true,
        explain:
          "Removing the resize call raises throughput only if the surviving path has capacity. Without a second store node the design still caps out at 5,000, which is the store's ceiling.",
        assert: (result) => result.valid && result.throughput >= 5_900,
      },
      {
        id: "metadata-headroom",
        label: "Metadata store under 65% utilisation (advisory)",
        required: false,
        explain:
          "Advisory, because it is green in the start graph: while the resize tier absorbs the damage, only half the traffic reaches the store, so 30% looks healthy. It turns red the moment the fallback inherits everything and nobody sized it, which is the failure this task exists to prevent — a criterion cannot require it at the start without also pretending the start graph is healthy.",
        assert: (result) => {
          const db = result.perNode.find((node) => node.id === "db-1");
          return result.valid && !!db && db.utilisation < 0.65;
        },
      },
    ]
  }

export default task;

export const title = "Timeouts, Retries & Circuit Breakers";
