import type { SdEdge, SdGraph, SdTaskDef } from "../types";
import { defaultNode } from "@/lib/system-design/nodes";
/**
 * Module 9 — partitioning and sharding, converted to the leaf model (plan 17,
 * slice B5, part 2).
 *
 * **Netflix anchor.** The migration post's opening sentence is the reason this
 * module exists:
 *
 *   *"Our journey to the cloud at Netflix began in August of 2008, when we
 *   experienced a major database corruption and for three days could not ship
 *   DVDs to our members. That is when we realized that we had to move away from
 *   vertically scaled single points of failure, like relational databases in
 *   our datacenter, towards highly reliable, horizontally scalable, distributed
 *   systems in the cloud."*
 *
 *   — `about.netflix.com/news/completing-the-netflix-cloud-migration`
 *
 * The same post supplies the sentence that separates this module from module 8:
 * scaling up was not merely slow, it was *unbuyable* — *"we simply could not
 * have racked the servers fast enough"*, and what replaced it was *"thousands of
 * virtual servers and petabytes of storage"* on demand. A replica buys requests.
 * It does not buy a bigger table, which is the problem this module is about.
 *
 * **The canvas has no storage dimension, and that is a real limitation.** A
 * database node has one `capacity` (5,000 r/s). `partitions > 1` *divides* that
 * capacity by the share of traffic the busiest partition takes; it never adds
 * capacity, and it has no notion of bytes. So every measured number below is a
 * request-rate number, and the storage argument in lesson 1 has to be arithmetic
 * the learner does, not a number the engine prints.
 *
 * **Re-measured for this slice** at 16,000 r/s, 10 app instances (80%), balancer
 * 80%, member store with 2 read replicas inherited from module 8's solution:
 *
 *   - 1 partition, 80% of reads on one key → **107%, 6.3% shed** (the start)
 *   - 16 partitions, same hot key → **83%** — partitioning bought **1.29×**, not 16×
 *   - 16 partitions, hot key share 0.2 → **26%, 0 errors** (the solution)
 *   - 8 partitions, hot 0.2 → 31%; 4 → 42%; 2 → 63%; 1,000 → 20.4%
 *   - 1,000 partitions with the hot key untouched → 81.1%: the ceiling is the
 *     key, and it does not move however many partitions you buy
 *
 * **The shortcut the model cannot exclude, stated rather than hidden.** Ten read
 * replicas and no partitioning reaches 29% — it passes every criterion in this
 * task, because capacity is the only thing the engine can grade. What a real
 * shard buys (a table that fits, a write path that divides) is exactly what the
 * canvas cannot measure. The task's *steps* therefore grade the decision —
 * `partitions >= 16` and `hotKeyShare <= 0.2` — and lesson 7 says all of this out
 * loud instead of letting a green tick imply the model proved something.
 *
 * **Two defects in the previous version, for the record.** Its chapters carried
 * no `lessonSlug`, so the outline was decorative and the rail listed lessons
 * instead of the tree (the same class of defect as module 8). And its graph put
 * 18,000 r/s through ten app instances (20,000) and a 20,000 r/s balancer,
 * leaving a *second* ceiling at 90% that had nothing to do with the lesson; its
 * `feed-p95 < 300 ms` criterion was green on the broken start because p95 is
 * computed over the requests that completed.
 *
 * **Chain note (satisfies the `check:system-design` warning).** The start graph
 * drops the `cache` node that module 8's solution had. That is deliberate: this
 * module's canvas is the member store, the tier no cache can help, and keeping
 * EVCache on the diagram would suggest the fix lives there. The title store and
 * its cache are unchanged and out of scope from here on.
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

/** The scenario every graph in this module runs on: 16,000 r/s, 5% writes. */
const scenario = {
  arrivalRate: 16_000,
  writeShare: 0.05,
  mediaShare: 0,
  bytesPerMediaRequest: 2_000_000,
  abusiveShare: 0,
  latencyJitterMs: 0,
  cacheColdStart: false,
  replicaLagMs: 0,
} as const;

/**
 * The design after module 8: one door, ten instances, and the member store with
 * two read replicas — at 40% of its request ceiling and still holding every row.
 */
function memberGraph(partitions: number, hotKeyShare: number): SdGraph {
  return {
    nodes: [
      { ...defaultNode("client", "client-1", 40, 200), label: "Members" },
      { ...defaultNode("load_balancer", "lb-1", 220, 200), label: "Edge" },
      {
        ...defaultNode("app_server", "app-1", 400, 200),
        label: "Playback API",
        replicas: 10,
      },
      {
        ...defaultNode("database", "db-member", 660, 200),
        label:
          partitions === 1
            ? "Member store"
            : `Member store, ${partitions} partitions`,
        readReplicas: 2,
        partitions,
        hotKeyShare,
      },
    ],
    edges: [
      wire("e1", "client-1", "lb-1"),
      wire("e2", "lb-1", "app-1"),
      wire("e3", "app-1", "db-member", "member rows"),
    ],
    scenario: { ...scenario },
  };
}

const task: SdTaskDef = {
  brief:
    "The member store is 28 TB against a 32 TB ceiling and 107% of its request ceiling, shedding one request in sixteen. It already has two read replicas, so more copies will not help. Split the data into pieces, and make the split worth having: a new season drops tonight and 80% of reads touch one key. Both moves are needed — partitioning alone gets you to 83%.",
  startGraph: memberGraph(1, 0.8),
  solutionGraph: memberGraph(16, 0.2),
  steps: [
    {
      id: "partition-the-store",
      title: "Split the member store",
      brief:
        "Give the store at least sixteen partitions. One piece cannot hold the table, and sixteen is where the pieces are small enough to move later.",
      hint: "Select the member store in the canvas and raise its partitions in the inspector.",
      reveal:
        "Sixteen partitions take the store from 107% to 83% — real capacity, zero shed requests, and still no headroom. Partitioning divides the non-hot traffic evenly and leaves the hot share exactly where it was.",
      check: (g) => {
        const store = g.nodes.find((n) => n.id === "db-member");
        if (!store || store.type !== "database") {
          return { passed: false, progress: "The member store is missing" };
        }
        const passed = store.partitions >= 16;
        return {
          passed,
          progress: passed
            ? `✓ ${store.partitions} partitions`
            : `${store.partitions} of 16 partitions — the piece is still too big to move and the ceiling has not moved`,
        };
      },
    },
    {
      id: "cool-the-hot-key",
      title: "Split the hot key",
      brief:
        "80% of reads land on one key. Pool it into buckets, or fan the work out on write, until no single key carries more than a fifth of the reads.",
      hint: "The hot key share is a slider in the inspector. Lowering it means the design changed — bucketed key, fan-out on write, or dedicated capacity.",
      reveal:
        "At a hot share of 0.2 the busiest partition takes 24% of traffic instead of 78%, so sixteen partitions land at 26%. The slider is a stand-in for the design change; the graph cannot tell you which one you made.",
      check: (g) => {
        const store = g.nodes.find((n) => n.id === "db-member");
        if (!store || store.type !== "database") {
          return { passed: false, progress: "The member store is missing" };
        }
        const passed = store.partitions >= 16 && store.hotKeyShare <= 0.2;
        return {
          passed,
          progress: passed
            ? "✓ Hot key split, sixteen partitions"
            : `Hot key share is ${(store.hotKeyShare * 100).toFixed(0)}%; get it to 20% or below`,
        };
      },
    },
  ],
  passCriteria: [
    {
      id: "zero-errors",
      label: "Error rate = 0% at 16,000 requests per second",
      required: true,
      explain:
        "The store sheds 6.3% of this load before the split. Note how the old version of this task graded: its p95 criterion was green on the broken start, because p95 is computed over the requests that finished — 15,000 of 16,000.",
      assert: (r) => r.valid && r.errorRate === 0,
    },
    {
      id: "member-headroom",
      label: "Member store utilisation < 40%",
      required: true,
      explain:
        "Sixteen partitions with the hot key untouched land at 83% and sixteen with it split at 26%. The threshold is what forces the second move: capacity alone stops at the hot key's floor.",
      assert: (r) => {
        const store = r.perNode.find((n) => n.id === "db-member");
        return !!store && store.utilisation < 0.4;
      },
    },
    {
      id: "fast-queries",
      label: "p95 < 15 ms",
      required: false,
      explain:
        "Advisory, and deliberately so: this passes on the broken start (9.1 ms) because the 6.3% that were shed never got a latency. It is here to catch a fix that trades shedding for queueing, not to grade the start — which is the failure mode this module's previous version shipped with.",
      assert: (r) => r.valid && r.latency.p95 < 15,
    },
  ],
};

export default task;

export const title = "Partitioning & Sharding";
