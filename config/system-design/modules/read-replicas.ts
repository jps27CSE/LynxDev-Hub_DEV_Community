import type { SdEdge, SdGraph, SdModule } from "../types";
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

const module: SdModule = {
  slug: "read-replicas",
  order: 8,
  part: 1,
  partTitle: "Scaling up",
  kind: "sim",
  title: "Read Replicas",
  description:
    "One store at 12% and one at 120%, same machine, same ceiling. What a copy can and cannot do for you: read capacity, replication lag, the three session guarantees, failover, read models, and the four things a replica can never fix.",
  story:
    "The design now has a door, eight identical instances and a cache that absorbs nine of every ten title reads. The title store answers at 12% of a 5,000 requests-per-second ceiling. The member store — my list, playback position, viewing history, one row per member — sits at 120% and turns away one request in twelve. Same machine. Same read-heavy mix. The difference is that a shared cache is only useful when many members want the same answer, and almost no two member rows are the same row.\n\nNetflix's own account of leaving the data centre answers this question the way most teams do not: they did not copy the relational model onto new hardware — the approach their post calls the forklift, which *“moves all the problems and limitations of the data center along with it”* — they *“denormalized … our data model, using NoSQL databases.”* A replica is a copy. A copy of a store that cannot answer the question is a second store that cannot answer the question, and this module is about knowing which of the two you are building.",
  chapters: [
    {
      slug: "the-asymmetry",
      title: "The asymmetry",
      description:
        "Reads may be answered anywhere. A change has to happen once, in one place.",
      children: [
        {
          slug: "scaling-reads-vs-writes-chapter",
          title: "Reads replicate, writes do not",
          description:
            "A replica is the whole store. Why read capacity multiplies and write capacity does not — and what this canvas does and does not model.",
          lessonSlug: "scaling-reads-vs-writes",
        },
      ],
    },
    {
      slug: "what-lag-does",
      title: "What lag does",
      description:
        "The copy is always slightly behind. What that breaks, and the three promises that make it survivable.",
      children: [
        {
          slug: "replication-lag-chapter",
          title: "Lag is a position",
          description:
            "The stream, the replay position, and why “seconds behind” is a derived number rather than a stored one.",
          lessonSlug: "replication-lag",
        },
        {
          slug: "read-your-own-writes-chapter",
          title: "Read your own writes",
          description:
            "The member who adds a title and cannot see it. Three guarantees, four fixes, and the traffic each one costs.",
          lessonSlug: "read-your-own-writes",
        },
      ],
    },
    {
      slug: "when-the-primary-dies",
      title: "Failover, and the bill",
      description:
        "Promoting a replica, the read models people build instead of copies, and the four things no replica can fix.",
      children: [
        {
          slug: "promoting-a-replica-chapter",
          title: "Promotion",
          description:
            "Fence, elect, repoint, re-replicate — and the data-loss window that is exactly the lag at the instant of failure.",
          lessonSlug: "promoting-a-replica",
        },
        {
          slug: "cqrs-and-read-models-chapter",
          title: "Read models",
          description:
            "A replica is the laziest read model. A projection is one with a job — and a bill.",
          lessonSlug: "cqrs-and-read-models",
        },
        {
          slug: "when-replicas-dont-help-chapter",
          title: "When replicas do not help",
          description:
            "Storage × N, write amplification × N, and the four failures a copy of everything cannot touch.",
          lessonSlug: "when-replicas-dont-help",
        },
      ],
    },
  ],
  lessons: [
    // ---------------------------------------------------------------------
    {
      slug: "scaling-reads-vs-writes",
      title: "Reads replicate, writes do not",
      attribution:
        "Synthesised from the system-design-primer's replication section, the PostgreSQL documentation on write-ahead logging and high availability, and Netflix's account of completing its cloud migration. Capacity figures are this module's teaching model.",
      sources: [
        {
          label: "system-design-primer — database replication",
          url: "https://github.com/donnemartin/system-design-primer",
        },
        {
          label: "PostgreSQL — write-ahead logging (WAL)",
          url: "https://www.postgresql.org/docs/current/wal-intro.html",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "Two stores, one machine each",
          body: "Twelve thousand requests per second arrive at the playback API, and ninety-five of every hundred are reads. Two stores answer them.\n\nThe **title store** — the catalogue: what a title is, how many seasons, which artwork — sits behind EVCache and sees a tenth of the traffic aimed at it: **12%** of a 5,000 requests-per-second ceiling.\n\nThe **member store** — my list, playback position, what somebody watched on Tuesday — sits at **120%**, and turns away one request in twelve. Same size of machine, same ceiling, no tuning difference.\n\nThe difference is that nine of ten title reads ask for the same answer, and almost no two member reads do. The failing store is not the badly built one. It is the one whose traffic cannot be shared.",
        },
        {
          kind: "concept",
          title: "A replica is the whole store, and a read may go anywhere",
          body: "A read replica is a complete copy of a store, kept current by replaying the primary's changes. It answers reads. It does not accept writes.\n\nThat asymmetry is the whole mechanism. A read is a question, and a copy of the data can answer it — so any replica can answer any read. Read capacity therefore multiplies with copies: one store plus two replicas is three places to look something up.\n\nA write is a change, and a change has to happen once, in a place everybody agrees on. That place is the primary, and it takes every write the system makes, however many copies exist.",
        },
        {
          kind: "concept",
          title: "Why writes do not multiply with copies",
          body: "You can copy an answer. You cannot copy a decision. Two copies of a row can both tell you what is in somebody's list; they cannot both decide what gets added to it.\n\nThe moment two nodes accept a write to the same record you must choose between conflicts (last write wins, and whoever lost the race is told their change did not happen), coordination (a round of agreement before every write, which is now a write that waits for a network), or dividing ownership so that only one node ever owns a record — which is module 9.\n\nSo write throughput is bounded by the primary. The honest question after adding replicas is not “is the system scaled?” but “what is the write throughput now?” — which has not moved.",
        },
        {
          kind: "concept",
          title: "What this canvas models, and what it does not",
          body: "The canvas gives a database node one capacity — 5,000 requests per second — and multiplies it by `1 + readReplicas` for the entire mixed load. That is a simplification worth naming: a real primary still accepts every write, so what multiplies in production is the **read** path only.\n\nRead the multiplication as “three places that can answer a read”. If write volume is what is failing, replicas are not the fix — that is module 9's problem, and lesson 6 puts a number on it. Everything else the model gets right: copies cost money proportional to the data they hold, they lag, and one has to be promoted when the primary dies.",
        },
        {
          kind: "concept",
          title: "The arithmetic, on this module's numbers",
          body: "The member store receives 6,000 of the 12,000 requests — the other half is title traffic the cache answers nine times in ten — against 5,000 of capacity. That is 120%, and the engine sheds at 100%:\n\n```\nno replica      6,000 ÷ 5,000 = 120%   →  8.5% of requests shed, p95 6.6 ms\none replica     6,000 ÷ 10,000 = 60%   →  0% errors, p95 3.5 ms\ntwo replicas    6,000 ÷ 15,000 = 40%   →  0% errors, p95 3.4 ms\n```\n\nTwo, not one, because a replica set has to survive a replica. At one copy, losing it puts the store straight back at 120% — the failure you just paid to fix. At two, losing one leaves 10,000 of capacity for 6,000 of load, still 60%.\n\nThe control that makes the lesson honest: two replicas on the **title** store move nothing. Measured, the member store stays at 120% and the error rate stays at 8.5%, because the failing traffic never went to the title store. A replica on a tier the traffic does not reach is a machine you are paying for.",
        },
        {
          kind: "diagram",
          caption:
            "12,000 r/s, 95% reads: the title store answers at 12% behind EVCache; the member store, which the cache cannot help, is at 120% and sheds one request in twelve",
          graph: memberGraph(0),
        },
        {
          kind: "video",
          videoId: "Q4BUDplOWRE",
          title:
            "System Design Basics in Bangla | Load Balancing + Data Sharding + Replication + Caching Explained",
          caption:
            "The whole scaling toolbox in one video. Watch it for the vocabulary, then use this module for the numbers.",
        },
        {
          kind: "your_turn",
          prompt:
            "The member store takes 6,000 requests per second against 5,000 of capacity. You must survive losing one replica with the survivors still under 60%. Compute how many replicas you need, then name the two facts you would check before promising that number to a product manager.",
        },
        {
          kind: "compare",
          body: "A beginner adds a replica to the slow store and watches the graph improve. An engineer asks which tier the **failing** traffic actually reaches, and notices that half of it goes to a store nobody thought about — the one with no cache in front of it, because its rows belong to one member each.\n\nThe trap is treating “add replicas” as a general answer to “the database is slow”. Replicas scale a read path. They do not shorten a query, do not make a hot key cooler, and do not touch the write path at all — and a design review that cannot say which of those four is failing is guessing.",
        },
        {
          kind: "recap",
          points: [
            "A replica is a complete copy: reads may be answered anywhere, writes happen once",
            "Read capacity multiplies with copies; write capacity stays bounded by the primary",
            "This canvas multiplies the whole node by 1 + readReplicas — treat it as the read path",
            "6,000 against 5,000 is 120%; one replica is 60%, two are 40%",
            "Two copies, because a replica set has to survive a replica",
            "A replica on a tier the failing traffic does not reach changes nothing — measured",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "replication-lag",
      title: "Lag is a position",
      attribution:
        "Synthesised from the PostgreSQL documentation on write-ahead logging, replication solutions and hot standby, plus the system-design-primer's replication section. The replay rates are illustrative numbers chosen to make the arithmetic checkable.",
      sources: [
        {
          label: "PostgreSQL — different replication solutions",
          url: "https://www.postgresql.org/docs/current/different-replication-solutions.html",
        },
        {
          label: "PostgreSQL — hot standby",
          url: "https://www.postgresql.org/docs/current/hot-standby.html",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "The row that arrives late",
          body: "At 20:04:11.2 a member adds a title to My List. The write lands on the primary. At 20:04:11.5 the page reloads and the title is not there. At 20:04:13 it is.\n\nNothing was lost and nothing failed. The read at 20:04:11.5 was answered by a replica that had replayed the primary's changes up to 20:04:09.7 — a second and a half of history it had not been told about yet. That gap is replication lag, and it is not a bug in the replica. It is the price of not waiting.",
        },
        {
          kind: "concept",
          title: "Replication is a stream, not a copy job",
          body: "The primary writes every change to a log before it changes anything else. In PostgreSQL that log is the write-ahead log; the documentation describes the arrangement as *“write-ahead logging … changes are written to the WAL and then applied to the database’s data files”*. A replica connects, asks for the stream from a position, and applies what it receives.\n\nThe consequence is the important part: replication is **ordered**. A replica cannot apply record 8,412 before 8,411, and it cannot skip. So a replica's state is always “every change up to some position, and nothing after it”. That position is the only honest description of how current a replica is.",
        },
        {
          kind: "concept",
          title: "Lag is a position, not a number of seconds",
          body: "What a replica reports is where it has got to; “two seconds behind” is derived by dividing the distance by the rate. That distinction decides how lag behaves when traffic changes.\n\n| Replay rate | Records behind | Apparent lag |\n| --- | --- | --- |\n| 4,000/s | 2,000 | 0.5 s |\n| 4,000/s | 12,000 | 3 s |\n| 4,000/s | 30,000 | 7.5 s |\n\nA replica keeping up at 4,000 records a second is fine until something writes 30,000 records in a burst — a backfill, a migration, a bulk delete — at which point the same healthy replica is seven and a half seconds behind and every read of that data is stale. The lag did not change because the replica got worse. The work arrived faster than the replay rate.\n\nThat is why “our lag is under a second” is a build-time claim, not a runtime one, unless it is measured and alerted on continuously.",
        },
        {
          kind: "concept",
          title: "Synchronous replication, and the bill for zero lag",
          body: "You can remove the window by making the write wait. In synchronous replication the primary does not acknowledge until a replica confirms it has received — and optionally applied — the change.\n\nThe bill arrives in two places. **Latency**: every write now costs at least one extra network round trip to another machine, and if the replica is in another region that is tens of milliseconds added to every write the product makes. **Availability**: a synchronous system that requires two of three nodes stops accepting writes when two are down — the replica you added for safety has become a participant whose absence stops the business.\n\nMost systems run asynchronous replication and fix the specific reads that cannot tolerate staleness. The next lesson is those reads.",
        },
        {
          kind: "concept",
          title: "What lag is invisible to, and what it breaks",
          body: "Invisible: a title's artwork, a recommendation row, a view count, a “trending now” carousel. Two seconds of staleness in any of them is indistinguishable from a design decision.\n\nBroken: a member reading their own write (the next lesson), an authorisation or entitlement check (“did this member pay?”), a balance or a quota, an inventory decrement, and anything that feeds another write — because a decision made from stale data is a wrong decision, not a slow one.\n\nThe question is never “is two seconds acceptable?” It is “does this read decide something?” Reads that are merely displayed can be arbitrarily stale. Reads that are acted upon cannot, and they need to be named in the design rather than discovered by a member.",
        },
        {
          kind: "your_turn",
          prompt:
            "A replica replays 3,000 records a second and is 9,000 records behind. Compute its lag. Then a migration writes 1.2 million records in one minute: compute the arrival rate, decide what happens to the replica's lag during that minute, and say what you would do to the read path while it runs.",
        },
        {
          kind: "compare",
          body: "A beginner reads “replicas are slightly behind” as a rounding error and moves on. An engineer asks which reads are allowed to be behind, measures the lag in records rather than in a dashboard's smoothed seconds, and names the burst that will make it worse.\n\nThe trap is assuming lag is a constant. It is a queue, and like any queue it is short until the arrival rate exceeds the service rate — which is exactly what a backfill does, at the moment a migration is already the riskiest thing happening.",
        },
        {
          kind: "recap",
          points: [
            "Replication replays an ordered log; a replica is current up to a position and no further",
            "Lag in seconds is distance ÷ replay rate, so a burst changes it without changing the replica",
            "Synchronous replication removes the window and charges latency plus availability",
            "Displayed reads tolerate staleness; reads that decide something do not",
            "“Lag under a second” is a measurement, not a property of the design",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "read-your-own-writes",
      title: "Read your own writes",
      attribution:
        "Synthesised from the system-design-primer's consistency section, the PostgreSQL hot-standby documentation on replay positions, and the eventual-consistency literature. The traffic arithmetic is built from this module's 12,000 r/s model.",
      sources: [
        {
          label: "Eventual consistency — the guarantees inside it",
          url: "https://en.wikipedia.org/wiki/Eventual_consistency",
        },
        {
          label: "PostgreSQL — hot standby",
          url: "https://www.postgresql.org/docs/current/hot-standby.html",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "Empty list, angry member",
          body: "A member adds three titles to My List, reloads, and the list is empty. They reload again and all three are there. Support cannot reproduce it. Engineering cannot reproduce it. It happens to maybe one member in twenty, once.\n\nIt is not a race in the code and not a cache. The write went to the primary, the read went to a replica that had not replayed it yet, and the member saw the state of the world 1.4 seconds ago — which is correct for the replica and wrong for the member, who knows what they just did.",
        },
        {
          kind: "concept",
          title: "Three guarantees, and only one of them is obvious",
          body: "“Eventual consistency” sounds like one promise. It is really three separate ones, and a system can keep any subset:\n\n**Read-your-writes.** After a member's own write, their own reads see it. This is the one that generates support tickets.\n\n**Monotonic reads.** A member never sees time go backwards: if they saw a title at 20:04, they will not fail to see it at 20:05. Without this, a member refreshing a page can watch an item disappear and reappear as their requests land on replicas at different positions.\n\n**Consistent prefix.** Reads see writes in the order they happened, not an order that never existed. A conversation where the reply appears before the message is the symptom.\n\nNaming which one a screen needs is the design work. “Make it consistent” is not a requirement anybody can implement.",
        },
        {
          kind: "concept",
          title: "Four ways to keep the promise, cheapest first",
          body: "**A time window.** Route a member's reads to the primary for a few seconds after their write. Cheap, crude, and correct only if the window is longer than the lag — which means it is correct until a backfill makes the lag longer than the window.\n\n**A position token.** The write returns the position it reached; the read carries it and is served by a replica that has replayed at least that far, or by the primary if none has. This is the honest version of the window: it is bounded by the actual lag rather than by a guess.\n\n**A session pin.** Send a member to the same replica for the session — by cookie or by hashing their id. It works, and it is not the same thing as sticky sessions: no state lives on the instance, only a routing preference, so the instance may still be destroyed at any moment.\n\n**Read from the model you just wrote.** If the write path already maintains a read model, read that. It is the most expensive and the only one that survives losing every replica.",
        },
        {
          kind: "concept",
          title: "What the guarantee costs in traffic",
          body: "The promise is narrower than it sounds, and the arithmetic shows why. Of 12,000 requests per second, 600 are writes. Assume each member makes one read immediately after a write — the classic “add to list, reload” — and that read has to be fresh:\n\n```\n600 fresh reads ÷ 6,000 member-store reads = 10% of that store's read traffic\n```\n\nTen percent sent to the primary is a routing rule, not a redesign. What makes it expensive is not the volume; it is doing it for every read because nobody wrote down which reads actually need it. A blanket “all reads go to the primary” is the same mistake in the other direction — you paid for replicas and then did not use them.",
        },
        {
          kind: "concept",
          title: "Monotonic reads is the one nobody asks for",
          body: "Read-your-writes fixes the member who just wrote. Monotonic reads fixes the member who did not write anything and still sees the page change under them: request one lands on a replica at position 8,412, request two on a replica at 8,390, and the title they were looking at is gone.\n\nThe fix is the same session pin as above, plus one detail that matters: pin by something stable (member id hashed to a replica) rather than by “whichever replica answered first”, so the pin does not move when a replica is removed from the pool. When a replica does go away, the member's next request lands somewhere else — and the guarantee you can still make is that the new replica is at least as current, which is what the position token gives you.",
        },
        {
          kind: "your_turn",
          prompt:
            "A screen shows a member's list right after they add a title, and another screen shows it again two minutes later. Decide which of the three guarantees each screen needs, then design the routing rule and say what happens to it when the replica that was serving the member is removed for maintenance.",
        },
        {
          kind: "compare",
          body: "A beginner fixes the ticket by making every read hit the primary. It works, it is simple, and it quietly deletes the reason the replicas exist.\n\nAn engineer names the guarantee per screen, routes only the reads that need it, and measures the cost as a share of traffic. The trap is the time window sized for a quiet afternoon: it is a guess about lag, and lag is a queue that grows when a migration runs — so if the answer is a window, the window has to come from a measured position.",
        },
        {
          kind: "recap",
          points: [
            "“Eventually consistent” is three promises: own writes, monotonic reads, consistent prefix",
            "A window is a guess about lag; a position token is bounded by the real lag",
            "A session pin routes, it does not store — the instance is still replaceable",
            "600 fresh reads out of 6,000 is 10% of one store's traffic, not a redesign",
            "Name the guarantee per screen; “make it consistent” is not implementable",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "promoting-a-replica",
      title: "Promotion",
      attribution:
        "Synthesised from the PostgreSQL documentation on warm standby and failover, the AWS Builders' Library on leader election, and the system-design-primer's replication section. The failover timings are illustrative budgets, not vendor SLAs.",
      sources: [
        {
          label: "PostgreSQL — warm standby and failover",
          url: "https://www.postgresql.org/docs/current/warm-standby.html",
        },
        {
          label: "AWS Builders' Library — leader election",
          url: "https://aws.amazon.com/builders-library/leader-election-in-distributed-systems/",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "03:41, and the primary stops answering",
          body: "The primary stops answering. Writes fail immediately — nobody is there to accept them. Reads from replicas still work, which is the worst shape of outage: the product looks alive and nothing a member does is saved.\n\nEvery passing minute is writes the system cannot take. The replicas are still there, current to the last record they received. Turning one into the new primary is promotion, and it is the reason you run replicas at all.",
        },
        {
          kind: "concept",
          title: "Failover is five steps, and only one is “promote”",
          body: "**1. Detect.** Is the primary down, or is the network between you and it down? Detection is a timeout, and every timeout guesses: too short and you fail over while the primary is healthy, too long and you have blown the recovery objective.\n\n**2. Fence.** Make the old primary unable to accept writes. This is the step that gets skipped, and the one that corrupts data.\n\n**3. Elect.** Choose the replica that has replayed furthest. In PostgreSQL terms the highest replay position; anything else throws away records you did not have to lose.\n\n**4. Repoint.** Send writes to the new primary: a proxy, a DNS change, a managed endpoint. Each has a different propagation delay, and the delay is part of the outage.\n\n**5. Re-replicate.** The other replicas follow the new primary, and the old one — when it returns — joins as a replica, never as a writer.",
        },
        {
          kind: "concept",
          title: "Fence first, or you get two primaries",
          body: "Split brain is the failure where the old primary is not dead, only unreachable, and returns still believing it is the primary while a new one has taken writes for four minutes. Two nodes have now accepted conflicting changes to the same rows with no correct merge.\n\nThe fix is to make the old primary unable to write before the new one is allowed to: revoke its credentials, cut its network, or power it off — the literature calls this fencing, or STONITH, “shoot the other node in the head”. A node you cannot talk to is a node you cannot trust, and the alternative to killing it is reconciling two histories by hand.\n\nA design that promotes first and fences later has a window in which both can write. It usually works. The day it does not is the day somebody restores a backup over the top of it.",
        },
        {
          kind: "concept",
          title: "What you lose is the lag at the instant of failure",
          body: "Promotion does not lose data. **Asynchronous replication** loses data, and promotion makes the loss official: at 600 writes per second and a replica 2 seconds behind, up to 1,200 writes existed on the primary and never reached the replica you promoted. Those writes are gone, and the members who made them were told they succeeded.\n\nThat number is the recovery point objective. If the answer is “none”, replication must be synchronous and you pay lesson 2's bill. If it is “up to a second”, it has to be measured continuously — the lag at 03:41 is a property of the traffic at 03:41.\n\nThe recovery **time** objective is separate: detection (10–30 s), fencing, promotion (seconds), and repointing (seconds to minutes for DNS). A 60-second budget is normal.",
        },
        {
          kind: "concept",
          title: "Who runs this for you",
          body: "Managed engines do the five steps: multi-availability-zone deployments elect a standby, repoint the endpoint, re-replicate the others and report the failover as an event — which is why the vendor's endpoint is a hostname rather than an IP address.\n\nBuilding it yourself is four systems, not one: a health check nobody can fool, a fencing mechanism that cannot be bypassed, a consensus-backed election, and client-side repointing. Teams underestimate that by an order of magnitude, then meet split brain in production. So the judgement is not “build or buy” — it is knowing which of the two you have, how long it takes, how much data it loses, and who is woken up.",
        },
        {
          kind: "concept",
          title: "Try it on the canvas",
          body: "Open the failure panel and toggle `node_down` on the member store's primary. Writes fail and the canvas reports them as `unreachable`. Promotion is not a canvas button — the simulator has no concept of a replica becoming the primary, which is honest: promotion is an operational procedure, not a graph change.\n\nSet the scenario's `replicaLagMs` above zero and run again. Reads through the store come back `stale` rather than as errors — a stale read is not a failure the member can see, which is why it is the more dangerous kind.",
        },
        {
          kind: "your_turn",
          prompt:
            "The primary fails at 03:41:00 with a replica 2 seconds behind at 600 writes per second. Compute the maximum writes lost, then write the failover runbook: what you check at 03:41:00, what you do to the old primary, how you choose the new one, and what you tell the product team at 03:45:00.",
        },
        {
          kind: "compare",
          body: "A beginner assumes replicas are a backup. They are not: a replica of a corrupt row is a corrupt row, and a replica promoted after 2 seconds of lag is a database that has forgotten 1,200 writes.\n\nThe trap is the failover nobody has run. A procedure you have only read has timings you do not know and a fencing step nobody has tested — so its first real execution happens at 03:41, on the night the on-call engineer learns the DNS TTL is 300 seconds.",
        },
        {
          kind: "recap",
          points: [
            "Failover is detect, fence, elect, repoint, re-replicate",
            "Fence before you promote, or two nodes accept writes to the same rows",
            "Data loss equals the lag at the instant of failure: 2 s at 600 writes/s is 1,200 writes",
            "Recovery time is detection plus promotion plus repointing — a runbook, not a number",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "cqrs-and-read-models",
      title: "Read models",
      attribution:
        "Synthesised from Martin Fowler's CQRS article, Chris Richardson's microservices.io pattern catalogue, and Netflix's account of denormalising its data model during the cloud migration. The page requirements are illustrative.",
      sources: [
        {
          label: "Martin Fowler — CQRS",
          url: "https://martinfowler.com/bliki/CQRS.html",
        },
        {
          label: "microservices.io — CQRS pattern",
          url: "https://microservices.io/patterns/data/cqrs.html",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "Five screens, one shape of truth",
          body: "The playback app now shows a title page, a “continue watching” row, a My List screen, a search result, and a “because you watched” shelf. All five read from the member store, which is normalised so that a write is safe: one row per member-title relationship, no duplicated state to keep in agreement.\n\nThat shape is right for writes and wrong for reading. The title page needs a join to the catalogue; the row needs an ordering that no index serves; search needs text matching the store has never been good at. Each screen is a query written against a schema designed for the opposite job — and the read replicas from the last four lessons faithfully copy that problem to every copy.",
        },
        {
          kind: "concept",
          title: "A replica is the cheapest read model, and the laziest",
          body: "A replica costs one configuration change and no modelling work: it holds exactly the write schema, so every existing query keeps working, and read volume spreads. For “the same query, more often”, that is the right answer and nothing else comes close on effort.\n\nWhat it does not do is change the query. A five-way join on a replica is a five-way join; a scan that takes 400 ms on the primary takes 400 ms on all three copies, just less often. Replicas scale the number of times you ask a slow question, not the cost of asking it.\n\nSo there is a second, more expensive option, and it is the one Netflix's migration post describes: change the model instead of copying it.",
        },
        {
          kind: "concept",
          title: "A projection is a read model with a job",
          body: "Netflix's post says they *“denormalized … our data model, using NoSQL databases”*. Denormalising means writing the answer down more than once, in the shape the read needs, and accepting the obligation to keep the copies in agreement.\n\nA projection is that idea made explicit: one table (or document, or search index) per screen, built from the write model's changes, shaped so the read is a single lookup. “Continue watching” becomes one row per member with ten title ids in order. The title page becomes a document with its cast, artwork and availability already assembled.\n\nThe win is that reads stop being queries. The bill is that the write path now maintains N read shapes, and any disagreement between them is a bug you will find in a screenshot — not in a database constraint.",
        },
        {
          kind: "concept",
          title: "The bill, itemised",
          body: "**Lag becomes product semantics.** A projection is updated asynchronously, so it inherits lesson 2 — except now the delay is visible as “my new title is not in continue watching yet”, and somebody has to decide how long that is allowed to be.\n\n**Rebuild cost.** A projection can be wrong in a way a replica cannot: a bug in the projection code silently produces plausible rows. You need the ability to replay the write model and rebuild, which means the events or the log have to still exist.\n\n**Two writers is a lie.** Writing the store and the projection as two independent calls means one of them will fail. The outbox pattern — write the change and the intent to publish it in one transaction — is the minimum honest version. It is Phase C material; what matters here is knowing that “we will just update both” is the bug.\n\n**Versioning.** A projection's shape is read by deployed code. Changing it while old instances still read the old shape is a schema migration with no schema.",
        },
        {
          kind: "concept",
          title: "Choosing between them",
          body: "| You need | Replica | Projection |\n| --- | --- | --- |\n| The same query, more capacity | yes | no |\n| An aggregate the store cannot index | no | yes |\n| A shape for one screen | no | yes |\n| Zero new write-path code | yes | no |\n| Survives losing every copy | no | yes, if it is persisted |\n| Correctness argument you can state in a sentence | yes | only with the outbox |\n\nThe rule of thumb: a replica when the read is the same read; a projection when the read is a different question. The order matters because a replica is a one-line change and a projection is a system — so start with the copy, and move to the projection when the query, not the volume, is the problem.",
        },
        {
          kind: "your_turn",
          prompt:
            "Take the five screens above. For each, say whether a replica is enough or whether it needs a projection, and for the projection, name the write-path work it creates and what happens when that work fails halfway.",
        },
        {
          kind: "compare",
          body: "A beginner adds a replica to every slow read and calls it scaling. An engineer asks whether the query is slow because of volume or of shape — only one of those a copy can fix.\n\nThe trap is the projection that becomes the source of truth by accident. The moment product features read only the projection and nobody can rebuild it, the derived data is the real data and the write model is a write-ahead log with extra steps. Write down how you would rebuild it before you build it.",
        },
        {
          kind: "recap",
          points: [
            "A replica copies the schema, including the parts that make reads expensive",
            "A projection changes the shape so a read is one lookup",
            "Denormalising is what Netflix's migration post calls the change they made",
            "Projections inherit lag, need a rebuild path, and need an outbox to stay honest",
            "Replica for the same read; projection for a different question",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "when-replicas-dont-help",
      title: "When replicas do not help",
      attribution:
        "Synthesised from the system-design-primer's scaling sections, Netflix's account of completing its cloud migration, and this module's measured canvas numbers. Storage and amplification figures are illustrative arithmetic, labelled as such.",
      sources: [
        {
          label: "PostgreSQL — different replication solutions",
          url: "https://www.postgresql.org/docs/current/different-replication-solutions.html",
        },
        {
          label: "Netflix — completing the cloud migration",
          url: "https://about.netflix.com/news/completing-the-netflix-cloud-migration",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "Six weeks later",
          body: "The member store got its two replicas and the errors went to zero. Six weeks later it is at 118% again, with the same replicas, the same queries and no code change.\n\nWhat changed is the data: the member store grew by 40%, and every replica now holds all of it. Write volume grew with the product, and every write is now applied three times. The replicas did what replicas do — copy everything — and copying everything is exactly why they cannot fix the thing that actually broke.",
        },
        {
          kind: "concept",
          title: "Replicas copy the whole thing, every time",
          body: "A replica is not a cache: it does not hold the popular 10%, it holds all of it. Three copies of a 4 TB store is 12 TB of storage, and the copies are not free because the data is not hot.\n\nWrites multiply too. At 600 writes per second, three copies means the write path applies 1,800 record changes a second and moves the bytes to do it. Add a fourth replica and you have bought 33% more read capacity and 25% more write work at the same time.\n\nAnd lag grows with the number of copies that must be kept current, because each one is another application of the same stream. The fourth replica is the one that is behind during a backfill.",
        },
        {
          kind: "concept",
          title: "Four things a replica can never fix",
          body: "**Write throughput.** Every write still lands on one primary. Copies do not accept writes, so the ceiling on writes is the ceiling on one machine.\n\n**A hot key.** If 80% of the reads want one row, three copies serve the same 80% three times over. Total capacity grew; the capacity for that row grew by the number of copies and is still the thing that saturates first.\n\n**A query that scans.** A 400 ms scan is 400 ms on every copy. More copies mean more concurrent scans competing for the same buffers on each one.\n\n**A dataset bigger than one machine.** Storage has to fit on every replica. When the data does not fit on one node, no number of copies helps — you need to divide ownership, which is the next module.",
        },
        {
          kind: "concept",
          title: "The ladder, and what each rung actually fixes",
          body: "Fixes have a domain, and reaching for the wrong one is the most common expensive mistake in this area:\n\n| Rung | Fixes | Costs |\n| --- | --- | --- |\n| Index | One slow query | Write speed, storage |\n| Cache | Repeated reads of the same answer | Freshness, a new tier |\n| Replica | Read volume | Storage × N, lag, writes × N |\n| Bigger machine | Everything, once | Downtime, a hard ceiling |\n| Partition | Ownership: storage and write volume per key | Joins, transactions, operations |\n\nThe ladder is ordered by cost, and the discipline is to move one rung at a time **after measuring which limit you hit**. “The database is slow” is not a diagnosis; the diagnosis is one of: this query, this answer, this much read volume, this machine, or this much data.",
        },
        {
          kind: "concept",
          title: "The number that ends this module",
          body: "The next module's canvas starts exactly here: 16,000 requests per second, the member store with the two replicas from this module, and the store at **107%** — shedding 6.3% of requests with every replica it is allowed to have already in place.\n\nThere is no replica count in the inspector that is a good answer. Adding four more copies reaches 64%, six reaches 46%, and each one is another full copy of the member data with another 600 writes a second of work to do. What the store needs is not more copies of one owner. It is more owners.\n\nThat is the sentence to carry into module 9: replicas scale a read path; they do not divide a dataset, and they do not own a key.",
        },
        {
          kind: "diagram",
          caption:
            "The end of this module: the member store with two replicas at 40% — the shape module 9 inherits, at 16,000 r/s, where it will be at 107%",
          graph: memberGraph(2),
        },
        {
          kind: "your_turn",
          prompt:
            "A 4 TB member store gets a third replica. Compute the storage, the number of times each write is applied, and the share of read capacity that goes to a single hot row that accounts for 80% of reads. Then say which rung of the ladder you would climb next and what evidence you would need first.",
        },
        {
          kind: "compare",
          body: "A beginner treats the replica count as a dial labelled “more database”. An engineer knows it is a dial labelled “more copies of the same read capacity”, and can say out loud which of the four limits above is currently binding.\n\nThe trap is the store that grows while its query pattern stays the same. Replicas keep the p95 flat for a while, the dataset keeps growing, and one morning the answer is not another copy — it is that no single machine can hold the data any more, and the design decisions that would have made partitioning cheap were not taken when they were still cheap.",
        },
        {
          kind: "recap",
          points: [
            "A replica holds everything: storage × N, writes applied N times, lag × N",
            "Replicas cannot fix write throughput, a hot key, a scan, or data too big for one node",
            "The ladder is index, cache, replica, bigger machine, partition — in cost order",
            "Measure which limit is binding before climbing; “slow” is not a diagnosis",
            "16,000 r/s with two replicas is 107% — the hand-off to module 9",
          ],
        },
      ],
    },
  ],
  interviewByte: {
    shape:
      "One store is at 12% and another at 120% on the same hardware. Walk me from “add a replica” to what you would do when replicas stop helping.",
    strongAnswer:
      "First the split: 12,000 requests per second, 95% reads, and two stores at 5,000 each. The title store is behind a cache with a 0.9 hit rate and sits at 12%. The member store holds one row per member, so almost nothing is shared and no cache helps; it takes 6,000 and is at 120%, shedding about one request in twelve. Reads can be answered by a copy because a read is a question, so I add read replicas — two of them, because a set has to survive losing a member: 15,000 of capacity for 6,000 is 40%, and losing one still leaves 60%. Then the honest bills. Lag: replication replays an ordered log, so a replica is current up to a position, and the reads that decide something — a member's own write, an entitlement check — need read-your-writes routing, either a short window at the primary or a position token. Failover: detect, fence, promote the most advanced replica, repoint, re-replicate, and the data you lose is the lag at the instant of failure. And the limit: copies hold everything, so they cannot fix writes, a hot key, a scan, or a dataset bigger than one machine. When the store is at 107% with every replica in place, the next move is dividing ownership, not another copy.",
    trap: "Saying “replicas scale the database” without separating the read path from the write path, and forgetting that a replica copies the schema as well as the rows — so a slow join is a slow join on all three copies. The second trap is treating a replica as a backup: promotion loses exactly the lag that existed at the moment of failure, and a failover nobody has drilled is a plan, not a capability.",
  },
  task: {
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
    ],
  },
  recap: [
    "A replica is a copy: reads may be answered anywhere, writes happen once",
    "6,000 against 5,000 is 120%; one replica is 60%, two are 40%",
    "Replication replays an ordered log, so lag is a position rather than a number of seconds",
    "Read-your-writes, monotonic reads and consistent prefix are three separate promises",
    "Failover is detect, fence, elect, repoint, re-replicate — and you lose the lag at failure time",
    "Replicas copy everything: storage × N, writes × N, and no fix for writes, hot keys or size",
  ],
  attribution:
    "Synthesised from Netflix's account of completing its cloud migration, the system-design-primer's replication and consistency sections, the PostgreSQL documentation on write-ahead logging, replication solutions, hot standby and warm standby, the AWS Builders' Library on leader election, Martin Fowler's CQRS article and Chris Richardson's microservices.io pattern catalogue. The capacity figures (5,000 r/s per store, 2,000 per app instance, 20,000 per balancer) are this module's teaching model, and every measured number in the lessons and the task comes from its canvas.",
};

export default module;
