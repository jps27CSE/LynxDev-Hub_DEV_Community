import type { SdEdge, SdGraph, SdTaskDef } from "../types";
import { defaultNode } from "@/lib/system-design/nodes";
/**
 * Module 8 — read replicas, converted to the leaf model (plan 17, slice B5,
 * part 2).
 *
 * **Netflix anchor.** The migration post's own sentence about how the data
 * model changed:
 *
 *   *"Architecturally, we migrated from a monolithic app to hundreds of
 *   micro-services, and denormalized and our data model, using NoSQL
 *   databases."*
 *
 *   — `about.netflix.com/news/completing-the-netflix-cloud-migration`
 *
 * Two things in that sentence matter here. It says the model was **changed**
 * rather than copied onto new hardware (the "forklift" they explicitly
 * rejected: *"the easiest way to move to the cloud is to forklift all of the
 * systems, unchanged … you end up moving all the problems and limitations of
 * the data center along with it"*). And it says the change was *denormalising*
 * — which is the design decision this module's last lesson is about: a replica
 * copies a schema, including a bad one.
 *
 * **The previous task was broken, and passing.** It offered 50,000 r/s to one
 * load balancer whose capacity in `NODE_TYPES` is 20,000 and to a single app
 * replica whose capacity is 2,000. Measured on the shipped graphs: the start
 * graph shed **96%** of traffic (balancer at 250%, app tier at 1000%) and so did
 * the "solution" — while its only two criteria were `p95 < 200 ms` and
 * `store < 25%`, and p95 is computed **over the requests that completed**.
 * Eight thousand requests a second died at the door and the gate read green.
 *
 * **Re-measured for this slice** at 12,000 r/s with eight app instances (75%,
 * so the tier is not the lesson) and two stores, because the honest version of
 * this module needs a store the cache cannot help:
 *
 *   - title store behind EVCache, 0.9 hit rate → **12%**
 *   - member store, no cache → **120%, 8.5% of requests shed, p95 6.6 ms**
 *   - one replica on the member store → 60%, 0% errors, p95 3.5 ms
 *   - two replicas → **40%, 0% errors, p95 3.4 ms**
 *   - two replicas on the *title* store instead → member store still 120%, errors
 *     still 8.5%. The control: a replica on the tier the failing traffic does
 *     not reach changes nothing.
 *
 * **One model limitation, stated in the module rather than discovered by the
 * learner.** `effectiveCapacity` multiplies a database node's whole capacity by
 * `1 + readReplicas`, writes included. A real primary still accepts every
 * write; only the read path multiplies. Lesson 1 says so out loud, because a
 * learner who believed the canvas would conclude that replicas fix write
 * throughput — which is the opposite of what this module teaches.
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

/** The scenario every graph in this module runs on: 12,000 r/s, 5% writes. */
const scenario = {
  arrivalRate: 12_000,
  writeShare: 0.05,
  mediaShare: 0,
  bytesPerMediaRequest: 2_000_000,
  abusiveShare: 0,
  latencyJitterMs: 0,
  cacheColdStart: false,
  replicaLagMs: 0,
} as const;

/**
 * The app after module 7: one door, eight identical instances, EVCache in front
 * of the title store — and a second store the cache cannot help, because the
 * rows it holds belong to one member each.
 */
function memberGraph(memberReplicas: number, titleReplicas = 0): SdGraph {
  return {
    nodes: [
      { ...defaultNode("client", "client-1", 40, 200), label: "Members" },
      { ...defaultNode("load_balancer", "lb-1", 220, 200), label: "Edge" },
      {
        ...defaultNode("app_server", "app-1", 400, 200),
        label: "Playback API",
        replicas: 8,
      },
      {
        ...defaultNode("cache", "cache-1", 600, 60),
        label: "EVCache",
        hitRate: 0.9,
        ttlMs: 60_000,
      },
      {
        ...defaultNode("database", "db-title", 820, 60),
        label: "Title store",
        readReplicas: titleReplicas,
      },
      {
        ...defaultNode("database", "db-member", 820, 320),
        label:
          memberReplicas === 0
            ? "Member store"
            : `Member store + ${memberReplicas} replica${memberReplicas === 1 ? "" : "s"}`,
        readReplicas: memberReplicas,
      },
    ],
    edges: [
      wire("e1", "client-1", "lb-1"),
      wire("e2", "lb-1", "app-1"),
      wire("e3", "app-1", "cache-1", "title reads"),
      wire("e4", "cache-1", "db-title", "misses"),
      wire("e5", "app-1", "db-member", "member rows"),
    ],
    scenario: { ...scenario },
  };
}

const task: SdTaskDef =   {
    brief:
      "One tier is failing and it is not the one with a cache in front of it: 12,000 requests per second, 95% reads, and the member store — the rows a shared cache cannot hold — is at 120%, turning away one request in twelve. Give that store the read capacity it needs, and size it so that losing one replica still leaves it inside its target. The title store at 12% is the control: it does not need anything.",
    startGraph: memberGraph(0),
    solutionGraph: memberGraph(2),
    steps: [
      {
        id: "add-replicas",
        title: "Give the member store read replicas",
        brief:
          "The title store is at 12% behind its cache. The member store is the one shedding traffic — it is the node that needs copies.",
        hint: "Select the member store in the canvas and raise its read replicas in the inspector.",
        reveal:
          "One replica takes 6,000 of load from 5,000 of capacity to 10,000 — 60%, and zero errors. The title store's replicas would move nothing: the failing traffic never reaches it.",
        check: (g) => {
          const member = g.nodes.find((n) => n.id === "db-member");
          if (!member || member.type !== "database") {
            return { passed: false, progress: "The member store is missing" };
          }
          const passed = member.readReplicas >= 1;
          return {
            passed,
            progress: passed
              ? `✓ ${member.readReplicas} replica(s) on the member store`
              : "Set read replicas to 1 or more on the member store",
          };
        },
      },
      {
        id: "survive-a-replica",
        title: "Size for losing one",
        brief:
          "A replica set has to survive a replica. At one copy, losing it puts the store straight back where it started.",
        hint: "One replica is 60%; two give 40% and still leave 60% if one of the three units dies.",
        reveal:
          "Two replicas: 15,000 of capacity for 6,000 of load is 40%. With one replica removed, 10,000 for 6,000 is 60% — still inside the target, which is the whole point of the second copy.",
        check: (g) => {
          const member = g.nodes.find((n) => n.id === "db-member");
          if (!member || member.type !== "database") {
            return { passed: false, progress: "The member store is missing" };
          }
          const passed = member.readReplicas >= 2;
          return {
            passed,
            progress: passed
              ? "✓ Two replicas — the set survives losing one"
              : `${member.readReplicas} replica(s): one loss puts the store back over 100%`,
          };
        },
      },
    ],
    passCriteria: [
      {
        id: "zero-errors",
        label: "Error rate = 0% at 12,000 requests per second",
        required: true,
        explain:
          "The member store sheds 8.5% of this load before any replicas exist. The previous version of this task asked for 50,000 r/s behind a 20,000 r/s balancer and graded only p95 over the 4% that completed — it passed while 96% of traffic was refused.",
        assert: (r) => r.valid && r.errorRate === 0,
      },
      {
        id: "member-headroom",
        label: "Member store utilisation < 50%",
        required: true,
        explain:
          "One replica lands at 60% and two at 40%. The threshold is what forces the second copy, which is the difference between a replica set and a single point of failure wearing a replica's label.",
        assert: (r) => {
          const store = r.perNode.find((n) => n.id === "db-member");
          return !!store && store.utilisation < 0.5;
        },
      },
      {
        id: "fast-reads",
        label: "p95 < 5 ms",
        required: true,
        explain:
          "A fix that trades errors for queueing is not a fix. The broken design spends 6.6 ms at p95 over the 91% of requests it managed to complete — a fast average over the survivors is how a shed is mistaken for a fix. A healthy finish is 3.4 ms.",
        assert: (r) => r.valid && r.latency.p95 < 5,
      },
    ]
  }

export default task;

export const title = "Read Replicas";
