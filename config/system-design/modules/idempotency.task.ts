import type { SdEdge, SdGraph, SdTaskDef } from "../types";
import { defaultNode } from "@/lib/system-design/nodes";
/**
 * Module 14 — idempotency, converted in slice B7 (plan 17).
 *
 * **Netflix anchor.** Netflix finished its cloud migration in January 2016, and
 * `about.netflix.com/en/news/completing-the-netflix-cloud-migration` is the
 * announcement. The sentence this module is built on is the one that explains
 * why the migration took seven years: the majority of systems, *"including all
 * customer-facing services"*, moved before 2015, and what remained was
 * *"a secure and durable cloud path for our billing infrastructure as well as
 * all aspects of our customer and employee data management"*. Billing went last
 * because a double charge cannot be retried away — the streaming path could be
 * moved while it was still imperfect, and the money path could not. (The
 * companion post, *Netflix Billing Migration to AWS*, says the same thing from
 * the other side — *"for a company, its billing solution is its financial
 * lifeline"* — and is cited by title only: `netflixtechblog.com` answers 403 to
 * non-browser clients, so it cannot be a `sources` entry. See resource map §5.)
 *
 * **The task.** 4,000 uploads per second arrive, and 75% of them are repeats —
 * the same asset re-sent because the client timed out after the work had
 * already been done. There is no idempotency store and one resize worker.
 * Measured: the worker runs at 400% of its capacity, 75% of all traffic is shed
 * and throughput settles at 1,000, which is exactly one worker's ceiling. With
 * the idempotency store absorbing 75% of arrivals, 1,000 requests per second
 * reach the worker and two workers sit at 51%: all 4,000 served, nothing shed.
 *
 * **What this canvas does not model — asserted, not described.** The queue
 * carries `retryLimit`, `maxDepth` and `dlqEnabled`, and the engine reads none
 * of them: there is no redelivery, no poison-message handling and no backpressure
 * from a deep queue. The dedupe store is a `cache` with a `hitRate`, so a "hit"
 * means *this request returned the earlier result and was never forwarded* —
 * which is the consequence of an idempotency key rather than the key itself. So
 * the task grades the decision the engine can see (the duplicate share is
 * absorbed) and one advisory decision it cannot (the queue parks what it cannot
 * process). Lesson 4 states the limitation where a learner looks for the DLQ,
 * and `tests/system-design-content.test.ts` asserts that toggling `dlqEnabled`
 * changes no number, so a later engine slice fails the suite rather than
 * silently falsifying the lesson.
 *
 * **Why the old task was replaced.** Its start and solution differed only in
 * worker `replicas` (1 → 2) and in the queue's `retryLimit`/`dlqEnabled`, both
 * inert. Measured at its own 200 requests per second, both graphs were idle —
 * the criteria could not fail, which makes them decoration.
 *
 * **Chain note.** `check:system-design` is satisfied: the `cache`, `queue`,
 * `worker` and `object_store` nodes module 13's solution carried are all still
 * here, because this module is about what happens *inside* the async path.
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

function uploadGraph(
  arrivalRate: number,
  duplicateShare: number,
  workerReplicas: number,
  dlqEnabled = false,
): SdGraph {
  return {
    nodes: [
      { ...defaultNode("client", "client-1", 40, 260), label: "Uploaders" },
      { ...defaultNode("load_balancer", "lb-1", 200, 260), label: "Edge" },
      {
        ...defaultNode("app_server", "app-1", 360, 260),
        label: "Upload API",
        replicas: 5,
      },
      {
        ...defaultNode("cache", "dedupe-1", 520, 260),
        label: "Idempotency store",
        hitRate: duplicateShare,
      },
      {
        ...defaultNode("queue", "queue-1", 680, 260),
        label: "Upload queue",
        dlqEnabled,
      },
      {
        ...defaultNode("worker", "worker-1", 840, 260),
        label: "Resize worker",
        replicas: workerReplicas,
      },
      {
        ...defaultNode("object_store", "store-1", 1000, 140),
        label: "Blob store",
      },
      { ...defaultNode("database", "db-1", 1000, 380), label: "Asset rows" },
    ],
    edges: [
      wire("e1", "client-1", "lb-1"),
      wire("e2", "lb-1", "app-1"),
      wire("e3", "app-1", "dedupe-1", "seen this key?"),
      wire("e4", "dedupe-1", "queue-1", "enqueue"),
      wire("e5", "queue-1", "worker-1", "consume"),
      wire("e6", "worker-1", "store-1", "blob"),
      wire("e7", "worker-1", "db-1", "row"),
    ],
    scenario: {
      arrivalRate,
      writeShare: 0.9,
      mediaShare: 0,
      bytesPerMediaRequest: 2_000_000,
      abusiveShare: 0,
      latencyJitterMs: 0,
      cacheColdStart: false,
      replicaLagMs: 0,
    },
  };
}

/** The pipeline at a load it can serve, with no duplicates absorbed. */
const conceptGraph = uploadGraph(400, 0, 1);
/** The task's start: 4,000 r/s, 75% duplicates, one worker. */
const taskStartGraph = uploadGraph(4_000, 0, 1);
/**
 * The task's solution: the same load, duplicates absorbed, two workers, and a
 * queue that parks what it cannot process.
 *
 * `dlqEnabled` changes no number — the engine reads none of the queue's retry
 * fields (lesson 4 says so, and the test asserts it). It is set on the solution
 * anyway because the solution *is* a design, and a solution graph that fails its
 * own `park-what-cannot-be-processed` step is a task no learner can finish;
 * `check:system-design`'s orphan check is what caught that.
 */
const taskSolutionGraph = uploadGraph(4_000, 0.75, 2, true);
/** The same pipeline before anyone added an idempotency store. */
const duplicateGraph = uploadGraph(4_000, 0, 4);

const task: SdTaskDef = {
  brief:
    "4,000 uploads per second arrive at the pipeline, and 75% of them are repeats of work already in flight. One resize worker is at 400% of its capacity and 75% of all traffic is shed. Make the pipeline serve all 4,000: absorb the repeats, park what cannot be processed, and do not lower the arrival rate.",
  startGraph: taskStartGraph,
  solutionGraph: taskSolutionGraph,
  steps: [
    {
      id: "absorb-duplicates",
      title: "Absorb the repeats before the worker sees them",
      brief:
        "Three quarters of the arrivals carry a key the store has already answered. Raise the idempotency store's hit rate so those requests return the earlier result instead of being enqueued again.",
      hint: "Select the Idempotency store and raise its hit rate. At 0, every arrival reaches the worker.",
      reveal:
        "A hit rate of 0.75 is the measured duplicate share: 3,000 of 4,000 arrivals are repeats, so 1,000 reach the queue and two workers at 2,000 requests a second each sit at 51%. At 0.7 the design still passes the criteria, but the duplicates the store misses are the ones the worker pays for.",
      check: (graph) => {
        const store = graph.nodes.find((node) => node.type === "cache");
        const hitRate = store?.type === "cache" ? store.hitRate : 0;
        const passed = hitRate >= 0.7;
        return {
          passed,
          progress: passed
            ? `✓ ${(hitRate * 100).toFixed(0)}% of arrivals answered from the store`
            : `${(hitRate * 100).toFixed(0)}% of arrivals answered from the store — 75% are repeats`,
        };
      },
    },
    {
      id: "park-what-cannot-be-processed",
      title: "Park what the worker cannot process",
      brief:
        "A message that fails for a deterministic reason will fail every time. Cap the queue's retries and enable a dead-letter queue so the rest of the backlog keeps moving.",
      hint: "Select the Upload queue and enable the dead-letter queue. Keep the retry limit at 3 or fewer.",
      reveal:
        "The canvas stores the queue's `retryLimit`, `maxDepth` and `dlqEnabled` but the engine reads none of them, so this step grades the decision rather than a number — which is exactly why it is a step and not a pass criterion. The decision is still the right one: an uncapped retry turns one unprocessable message into a queue that never drains.",
      check: (graph) => {
        const queue = graph.nodes.find((node) => node.type === "queue");
        if (!queue || queue.type !== "queue") {
          return { passed: false, progress: "No queue in the design" };
        }
        const ok = queue.dlqEnabled && queue.retryLimit <= 3;
        return {
          passed: ok,
          progress: ok
            ? `✓ Retry limit ${queue.retryLimit}, dead-letter queue on`
            : queue.dlqEnabled
              ? `Dead-letter queue on, but the retry limit is ${queue.retryLimit}`
              : "No dead-letter queue — a failing message is retried forever",
        };
      },
    },
    {
      id: "keep-the-load",
      title: "Do not shrink the problem",
      brief:
        "4,000 uploads a second is what the pipeline receives. Lowering the arrival rate hides the duplicate share instead of absorbing it.",
      hint: "Check the scenario's arrival rate in the inspector.",
      reveal:
        "At 400 requests a second one worker is at 40% and every criterion passes while three quarters of production traffic is still being dropped. The load is the requirement; the design is what has to change.",
      check: (graph) => {
        const arrivals = graph.scenario.arrivalRate;
        return {
          passed: arrivals >= 4_000,
          progress:
            arrivals >= 4_000
              ? `✓ ${arrivals.toLocaleString()} r/s — the load is unchanged`
              : `${arrivals.toLocaleString()} r/s is below the 4,000 r/s the pipeline receives`,
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
        "One worker against 4,000 arrivals a second is 400% of its capacity, so the start graph sheds 75%. Every failure class has to be zero: a design that absorbs duplicates but still drops traffic has moved the problem, not solved it.",
      assert: (result) =>
        result.valid &&
        (result.errorClasses.shed ?? 0) === 0 &&
        (result.errorClasses.unreachable ?? 0) === 0 &&
        (result.errorClasses.stale ?? 0) === 0 &&
        (result.errorClasses.rejected ?? 0) === 0,
    },
    {
      id: "capacity-served",
      label: "At least 3,900 requests a second served",
      required: true,
      explain:
        "Throughput has to reach the offered rate. The start graph caps at 1,000 a second, which is one worker's ceiling — the number that shows the queue is the bottleneck and not the API.",
      assert: (result) => result.valid && result.throughput >= 3_900,
    },
    {
      id: "worker-headroom",
      label: "Resize worker under 90% utilisation",
      required: true,
      explain:
        "A worker at 100% is a worker with no room for a burst, and one that cannot be degraded. This criterion is what stops 'add workers until it fits' from passing on arithmetic alone: at four workers the queue is still full of duplicates and the tier sits at exactly 100%.",
      assert: (result) => {
        const worker = result.perNode.find((node) => node.id === "worker-1");
        return result.valid && !!worker && worker.utilisation < 0.9;
      },
    },
  ],
};

export default task;

export const title = "Idempotency & Exactly-Once Delivery";
