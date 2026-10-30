import type { SdEdge, SdGraph, SdModule } from "../types";
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

const module: SdModule = {
  slug: "partitioning-and-sharding",
  order: 9,
  part: 1,
  partTitle: "Scaling up",
  kind: "sim",
  title: "Partitioning & Sharding",
  description:
    "A copy of a table is not a smaller table. Vertical ceilings, shard keys, hash against range, the hot key that caps every partition count you can buy, rebalancing without a flag day, the consistent-hashing ring, cross-shard queries, and when sharding is the wrong answer.",
  story:
    "The member store holds 28 TB of viewing history and grows by 60 GB a day; the largest instance in the region holds 32 TB, which is sixty-six days of headroom. Two read replicas already sit in front of it and make nothing smaller — three copies of 28 TB is 84 TB of storage spent to solve a problem nobody had. The store is also at 107% of its request ceiling, shedding one request in sixteen, but that is the smaller problem: even at 20% it would still have no room.\n\nNetflix's account of the transition opens with the incident that forced it — three days unable to ship discs after a database corruption — and names the direction: away from *“vertically scaled single points of failure, like relational databases”*, towards *“horizontally scalable, distributed systems”*. It also names the reason the cloud won, and it is not latency: *“we simply could not have racked the servers fast enough.”* Sharding is what you do when the answer is no longer a bigger machine but a smaller piece of the same logical dataset, and every difficulty in this module comes from that piece boundary.",
  chapters: [
    {
      slug: "why-split",
      title: "Why split at all",
      description:
        "The biggest machine has a size, and a copy does not make the data smaller.",
      children: [
        {
          slug: "why-partition-data-chapter",
          title: "One machine cannot hold it",
          description:
            "Vertical ceilings, the difference between a partition and a shard, and what this canvas can and cannot measure.",
          lessonSlug: "why-partition-data",
        },
      ],
    },
    {
      slug: "choosing-the-key",
      title: "Choosing the key",
      description:
        "The routing function is part of the schema, and the key decides what every query costs.",
      children: [
        {
          slug: "hash-and-range-sharding-chapter",
          title: "Hash or range",
          description:
            "Even spread against ordered locality, the modulo trap, and the question that picks between them.",
          lessonSlug: "hash-and-range-sharding",
        },
      ],
    },
    {
      slug: "what-skew-does",
      title: "What skew does",
      description:
        "Partitions are a multiplier on a share, and one hot key sets the share.",
      children: [
        {
          slug: "hot-keys-and-skew-chapter",
          title: "Sixteen partitions, 1.29×",
          description:
            "Why an untouched hot key caps every partition count — measured from 1 to 1,000.",
          lessonSlug: "hot-keys-and-skew",
        },
      ],
    },
    {
      slug: "moving-data",
      title: "Moving data",
      description:
        "Ownership changes while traffic continues. Twice.",
      children: [
        {
          slug: "rebalancing-shards-chapter",
          title: "Adding the seventeenth",
          description:
            "Copy, catch up, verify, cut over, decommission — and the rollback point in the middle.",
          lessonSlug: "rebalancing-shards",
        },
        {
          slug: "consistent-hashing-chapter",
          title: "The ring",
          description:
            "Why 8 nodes becoming 9 should move 11% of keys instead of 89%, and which problems a ring does not fix.",
          lessonSlug: "consistent-hashing",
        },
      ],
    },
    {
      slug: "the-bill",
      title: "The bill",
      description:
        "Every query that used to touch one machine now has a second option, and you own both.",
      children: [
        {
          slug: "cross-shard-queries-chapter",
          title: "Queries that need every shard",
          description:
            "Scatter-gather tails, merging top-k, and why a transaction across shards is a different problem.",
          lessonSlug: "cross-shard-queries",
        },
        {
          slug: "when-not-to-shard-chapter",
          title: "When not to shard",
          description:
            "The ladder in cost order, the three reasons to shard, and the one thing this canvas cannot grade.",
          lessonSlug: "when-not-to-shard",
        },
      ],
    },
  ],
  lessons: [
    // ---------------------------------------------------------------------
    {
      slug: "why-partition-data",
      title: "One machine cannot hold it",
      attribution:
        "Synthesised from Netflix's account of completing its cloud migration, the MongoDB sharding documentation and Wikipedia's article on sharding. The storage figures are this module's worked example, not a vendor claim.",
      sources: [
        {
          label: "Netflix — completing the cloud migration",
          url: "https://about.netflix.com/news/completing-the-netflix-cloud-migration",
        },
        {
          label: "MongoDB — sharding",
          url: "https://www.mongodb.com/docs/manual/sharding/",
        },
        {
          label: "Wikipedia — shard (database architecture)",
          url: "https://en.wikipedia.org/wiki/Shard_%28database_architecture%29",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "Sixty-six days of headroom",
          body: "Sixteen thousand requests per second arrive at the playback API. The member store — my list, playback position, viewing history — holds **28 TB** and grows by 60 GB a day. The largest instance available in the region holds 32 TB. That is 4 TB of room, which is **sixty-six days**, after which no machine of any size will hold the table.\n\nTwo read replicas are already in place. They are three copies of the same 28 TB: replicas buy request capacity, and this problem is not about requests. The store is also at 107% of its request ceiling, shedding one request in sixteen — but that is the smaller problem: at 20% it would still have no room, and no copy of a table makes the table smaller.",
        },
        {
          kind: "concept",
          title: "Vertical stops at the biggest machine",
          body: "The first answer is always a bigger machine, and for a long time it is the right one: one purchase, no code change, no routing rule, no new failure mode. It stops for two reasons. There is a largest instance you can rent. And growth is not in your control — a product decision to keep viewing history forever is a storage decision made by somebody who has never thought about a disk.\n\nNetflix's migration post opens with the incident that started theirs: a *“major database corruption”* cost three days of shipping discs, and *“that is when we realized that we had to move away from vertically scaled single points of failure, like relational databases in our datacenter, towards highly reliable, horizontally scalable, distributed systems.”* The cloud won for a reason worth quoting exactly: *“we simply could not have racked the servers fast enough.”* The ceiling was a delivery schedule, not a spec sheet.",
        },
        {
          kind: "concept",
          title: "A partition is a piece; a shard is a place",
          body: "Partitioning is the logical act: split one table into non-overlapping pieces, each with an owner. Sharding is the physical act: place those pieces on separate instances. The interesting part is neither. It is the **routing rule** — the function the application calls to decide which piece holds a given row.\n\nThree properties have to hold. The pieces together must equal the table: no row in two places, no row in none. Every write reaches exactly one piece, or you have invented a conflict. And the rule has to be cheap — it runs on every query in the system.\n\nEverything later in this module — hot keys, rebalancing, cross-shard queries — is the consequence of that split being imperfect in one direction or the other. You cannot pick a split that is good at all three.",
        },
        {
          kind: "concept",
          title: "What this canvas measures, and what it cannot",
          body: "The canvas gives a database node a `partitions` count. It does not add capacity: it **divides** the node's capacity by the share of traffic the busiest partition receives. At one partition nothing changes at all — partitioning on its own is not a knob that makes a number smaller.\n\nWhat the canvas has no dimension for is **storage**. It will happily let you partition a table that already fits, and it will never tell you the table does not fit, because it does not know how many bytes a row is. So the arithmetic in this module is request arithmetic, and the storage argument is yours to make. That asymmetry is worth naming: a model can teach the shape of a decision without making it for you.",
        },
        {
          kind: "concept",
          title: "The arithmetic that decides it",
          body: "28 TB today, 60 GB a day, 32 TB ceiling. Room left: 4 TB ÷ 60 GB ≈ **66 days**. Add next year's growth and the retention change somebody just approved, and call it 90 TB in twelve months. Three shards of 32 TB hold that, before counting replication per shard.\n\nNow the question a review will ask: why three and not thirty? Because a shard costs more than a machine. Every extra piece adds routing to keep correct, a rebalance to rehearse, and one more place a cross-shard query visits. Shard for the next two years, not the asymptote — and as few times as you can, because moving data is the expensive part.",
        },
        {
          kind: "diagram",
          caption:
            "16,000 r/s, one partition: the member store takes all of it, at 107% of a 5,000 r/s ceiling multiplied by its two replicas — one request in sixteen is shed",
          graph: memberGraph(1, 0.8),
        },
        {
          kind: "video",
          videoId: "Q4BUDplOWRE",
          title:
            "System Design Basics in Bangla | Load Balancing + Data Sharding + Replication + Caching Explained",
          caption:
            "The same overview that opened module 8. This time watch only the sharding segment: the question to hold on to is where the boundary between two pieces is drawn, and who decides.",
        },
        {
          kind: "your_turn",
          prompt:
            "A row is 240 bytes and the table has 3 billion rows. Compute today's size, then compute how many 32 TB shards you need if it doubles in two years and each shard keeps one replica. State which of the three properties of a routing rule your answer assumes.",
        },
        {
          kind: "compare",
          body: "A beginner hears “the database is full” and adds a read replica, because that is the lever they have pulled before. An engineer asks what is full — bytes, request rate, write throughput, or one key — the four have different fixes and only one is sharding.\n\nThe trap is that replicas make the graph look better while making the storage problem worse. Three copies are three times the disk for three times the read capacity: if the table does not fit, you have just tripled the thing that does not fit.",
        },
        {
          kind: "recap",
          points: [
            "Vertical scaling stops at a largest instance, and growth is often a product decision",
            "A partition is a piece of one dataset; a shard is a machine that holds a piece",
            "The routing rule is part of the schema: correct on every query, cheap on every query",
            "This canvas divides capacity by the busiest partition's share and has no notion of bytes",
            "28 TB against a 32 TB ceiling at 60 GB a day is sixty-six days of headroom",
            "Shard for the next two years and as few times as possible — moving data is the cost",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "hash-and-range-sharding",
      title: "Hash or range",
      attribution:
        "Synthesised from the MongoDB sharding documentation, Wikipedia's article on consistent hashing, and the system-design-primer. The remapping fractions are computed from the modulo, not quoted.",
      sources: [
        {
          label: "MongoDB — sharding",
          url: "https://www.mongodb.com/docs/manual/sharding/",
        },
        {
          label: "Wikipedia — consistent hashing",
          url: "https://en.wikipedia.org/wiki/Consistent_hashing",
        },
        {
          label: "Vitess — sharding MySQL at scale",
          url: "https://vitess.io/",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "Where does member 8842 live?",
          body: "The table is now sixteen pieces. A request arrives for member 8842 and something has to decide which machine answers it, in constant time, on every request, forever.\n\nTwo families of answer exist, and they are not variations on a theme. One throws away the order of the key to get an even spread. The other keeps the order to get locality, and accepts that the spread will follow whatever the data happens to look like. Choosing between them is the most consequential decision in this module, because it is the one you can least afford to reverse.",
        },
        {
          kind: "concept",
          title: "Hash the key, take the remainder",
          body: "`shard = hash(member_id) % 16`. A good hash scatters neighbouring ids across all sixteen pieces, so an even spread is what you get for free — and it does not depend on the data. Sequential ids, dates, and one large customer all spread the same way.\n\nThe cost is locality. A range scan — “every row written last Tuesday” — now asks all sixteen pieces, because Tuesday's rows are spread over all of them. And there is a trap in the `% 16` itself, which lesson 5 exists for: change the modulus and almost every key moves. Going from 8 shards to 9 remaps **eight of every nine keys**, because a key stays only when its hash has the same remainder modulo both — one key in nine.",
        },
        {
          kind: "concept",
          title: "Range the key, keep the order",
          body: "`shard = the piece whose interval contains member_id` — 0–12,500,000 on the first, and so on. Order is preserved, so a scan of a contiguous interval touches one piece, and a query “the newest 20 rows” touches the last one.\n\nThe cost is that the spread follows the data. Sequential ids put every new row on the last shard. Timestamps do the same, only more so at a launch. Geography concentrates one region. MongoDB's default is range-based, with the balancer splitting and moving chunks as ranges grow — which is an admission that range keys need continuous operational attention, and it also ships a hashed alternative for exactly the workloads where they do not.",
        },
        {
          kind: "concept",
          title: "The key decides what every query costs",
          body: "A shard key is not good because it spreads evenly. It is good because the queries the product runs can be answered by one piece. If every request starts with a member id, sharding by member id makes every member request local and every cross-member report a scatter-gather. Shard by title id instead and “the whole catalogue for one title” is local while “this member's list” now visits sixteen machines.\n\nSo the question is not “which key is fairer?” but “which queries must be cheap, and which can afford to be slow?” Netflix's answer in the migration post was not one key — it was splitting a monolith into hundreds of services, each with its own data. That is the same decision taken to its limit: draw the boundary where the query stops needing the other side.",
        },
        {
          kind: "diagram",
          caption:
            "Sixteen partitions with the hotspot cooled: the same 16,000 r/s now lands at 26% of the store's effective ceiling",
          graph: memberGraph(16, 0.2),
        },
        {
          kind: "your_turn",
          prompt:
            "You have 8 shards holding 400 million member rows and you must add a ninth. Under `hash(key) % 8`, compute how many rows move when the modulus becomes 9, then say what you would change about the routing scheme so that the answer is closer to one ninth.",
        },
        {
          kind: "compare",
          body: "A beginner picks the key that sounds most unique — a UUID, a timestamp, whatever is already the primary key. An engineer picks the key by listing the five queries the product actually runs most often and asking which of them must be answered by one shard.\n\nThe trap is assuming the answer is permanent. The shard key is close to a schema decision: changing it means rewriting where every row lives. MongoDB added online resharding in version 5.0 for exactly this reason, which is a useful signal — the vendor built a feature because teams kept getting the key wrong and could not afford to fix it.",
        },
        {
          kind: "recap",
          points: [
            "Hash keys spread evenly and destroy locality; range keys keep locality and follow the data",
            "Under `% N`, changing N moves almost everything — 8 to 9 remaps eight of nine keys",
            "Range sharding needs continuous splitting and monitoring, which is an operational cost",
            "Choose the key from the queries that must be fast, not from what looks unique",
            "The shard key is cheap to choose and expensive to change",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "hot-keys-and-skew",
      title: "Sixteen partitions, 1.29×",
      attribution:
        "Synthesised from the MongoDB documentation on choosing a shard key and the system-design-primer. Every number in this lesson was measured on this module's canvas at 16,000 requests per second.",
      sources: [
        {
          label: "MongoDB — choose a shard key",
          url: "https://www.mongodb.com/docs/manual/core/sharding-choose-a-shard-key/",
        },
        {
          label: "system-design-primer",
          url: "https://github.com/donnemartin/system-design-primer",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "A season drops at eight in the evening",
          body: "A new season lands and 80% of reads in the window touch one key: the progress row for that title, which millions of members are updating within the same hour. The store now has sixteen partitions instead of one, and the graph improves.\n\nMeasured on this canvas: 107% becomes **83%**. Sixteen partitions bought a factor of **1.29**, not sixteen. The store stops shedding requests, which will look like a fix in a status meeting, and it is still one bad hour from the ceiling — because it started at 107% and 83% is not headroom, it is a stay of execution.",
        },
        {
          kind: "concept",
          title: "Skew defeats the average",
          body: "Utilisation is not an average over partitions; it is the busiest one, because that is the machine that fills up first. Partitioning divides the *non-hot* traffic evenly and leaves the hot share exactly where it is.\n\nThe canvas computes it in one line. With 95% reads, a hot share `h`, and `P` partitions, the busiest partition takes `readShare × (h + (1 − h)/P) + writeShare/P`. At `h = 0.8` and `P = 16`: `0.95 × (0.8 + 0.0125) + 0.0031 = 0.775`. So capacity is 15,000 ÷ 0.775 ≈ 19,354, and 16,000 of load is 83%.\n\nThe first term is the whole story. `h` stays, `1/P` shrinks toward zero, so the busiest partition converges on `readShare × h` — here 76% of all traffic, no matter how many partitions you buy.",
        },
        {
          kind: "concept",
          title: "The ceiling is the key, measured from 1 to 1,000",
          body: "With the hot key untouched at 80%, measured on this canvas: 1 partition 107%, 2 partitions 94%, 4 partitions 87.5%, 16 partitions 83%, 1,000 partitions **81.1%**. Four orders of magnitude of partitioning bought 26 percentage points and then stopped, because `0.95 × 0.8 = 0.76` is a floor that partition count cannot cross.\n\nWith the hot share at 20% instead: 2 partitions 63%, 4 partitions 42%, 8 partitions 31%, 16 partitions **26%**, 64 partitions 21.6%, 1,000 partitions 20.4%. Same curve, different floor.\n\nThis is the single most useful number in the module. Before you choose a partition count, ask what the busiest key's share is — because no count fixes it, and the difference between a working shard plan and an expensive one is usually one design change to that key, not more hardware.",
        },
        {
          kind: "concept",
          title: "What actually cools a hot key",
          body: "**Split the key.** `member_id` becomes `member_id:bucket` with sixteen buckets, so one logical key becomes sixteen physical ones. Reads must now merge sixteen results, so the write got cheaper and the read got more expensive — the trade is explicit, which is the point.\n\n**Fan out on write.** Precompute the expensive shared artefact when the write happens instead of when ten million reads do. Writes get heavier and storage grows; reads get cheap and predictable.\n\n**Cache it.** The shared answer is the one thing a cache is good at, and module 7's EVCache is why the *title* store is at 12%. It does not work here for the same reason it did not work in module 8: the hot rows belong to one member each.\n\n**Give it its own machine.** A small set of keys on dedicated capacity, with a routing rule that knows about them. Simple, and it hands you a special case to maintain forever.",
        },
        {
          kind: "diagram",
          caption:
            "Sixteen partitions with the 80% hot key still in place: 83% of the busiest partition, no errors, and no headroom either",
          graph: memberGraph(16, 0.8),
        },
        {
          kind: "your_turn",
          prompt:
            "The hot share is 60% and you have 32 partitions. Compute the busiest partition's share, then compute the utilisation of a store at 16,000 r/s with 5,000 of capacity and two replicas. Then say how many partitions you would need to reach 50% utilisation — and whether that is a plan or a warning.",
        },
        {
          kind: "compare",
          body: "A beginner's answer to a hot key is more shards, because a hot key and a full cluster sound like the same problem. An engineer computes the floor first: if the busiest key carries 80% of reads, the best possible partitioning leaves that one machine at 76% of all traffic, and the number of shards is decoration.\n\nThe trap is that the graph improves. 107% to 83% is a real improvement and it will pass a review that only asks whether the alarm stopped. The question worth asking is what the next season drop does, and whether the answer changed at all — because nothing about the hot key did.",
        },
        {
          kind: "recap",
          points: [
            "Utilisation is the busiest partition, never the cluster average",
            "Busiest share = readShare × (h + (1−h)/P) + writeShare/P; the hot term never shrinks",
            "16 partitions on an 80% hot key bought 1.29×; 1,000 partitions bought 1.32×",
            "Hot 0.2 instead of 0.8 moves the floor from 81% to 20% — one design change, not more machines",
            "Cooling a key costs somewhere else: reads merge, writes grow, or a special case is born",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "rebalancing-shards",
      title: "Adding the seventeenth",
      attribution:
        "Synthesised from the MongoDB sharding and balancer documentation and Wikipedia's article on consistent hashing. The five-phase move is the generic shape of an online data migration, described rather than vendor-specific.",
      sources: [
        {
          label: "MongoDB — sharding",
          url: "https://www.mongodb.com/docs/manual/sharding/",
        },
        {
          label: "Wikipedia — consistent hashing",
          url: "https://en.wikipedia.org/wiki/Consistent_hashing",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "The cluster needs a seventeenth piece",
          body: "Sixteen partitions are at 83% of the busiest one and the projection says they will be full in a quarter. You need to move ownership of some rows to a new machine, while sixteen thousand requests a second keep arriving.\n\nThe naive version is to change `% 16` to `% 17` and restart. That moves roughly **94%** of all rows — almost every key, at once, through one cluster, while writes continue. It is the data equivalent of changing the engine on the motorway, and the failure is not subtle: every miss lands on the origin at the same moment, which is module 7's cold-start lesson with a bigger number attached.",
        },
        {
          kind: "concept",
          title: "Move in five phases, and write down the rollback",
          body: "**1. Copy.** Snapshot the range being moved and transfer it. It is stale the moment it leaves, and that is expected.\n\n**2. Catch up.** Tail the change stream for that range into the new owner until it is within seconds of live. Increasingly, both owners accept writes for the range during this window.\n\n**3. Verify.** Compare row counts and checksums over the moved range. A migration that is 99.9% complete is a migration that lost 40,000 rows and will be found by a member, not a monitor.\n\n**4. Cut over.** Reads first, then writes, then remove the old owner's authority — in that order, because reads are reversible and writes are not.\n\n**5. Decommission.** Keep the old copy until you have verified production traffic against the new owner for longer than your worst known lag.\n\nThe rollback is a single fact, and it needs to be written before you start: until step 4 finishes, the old owner is still authoritative, so rolling back means pointing the router at it again. After step 4, rolling back means repeating the whole procedure in reverse.",
        },
        {
          kind: "concept",
          title: "Small units make movement cheap",
          body: "The five phases are the same whether you move half a table or one range. What changes is how much you have to move, and that is a design decision made long before the migration.\n\nIf each partition is one indivisible range, your smallest move is a whole partition — and the load is whatever that partition happens to be carrying. If the data is pre-split into many small units inside each partition, you move units: a busy partition gives up twice as many as an idle one.\n\nMongoDB calls these chunks — 128 MB by default — and its balancer is this loop, automated: watch per-shard counts, pick a donor and a recipient, run a chunk migration, repeat, with a throttle so the migration does not become the outage. That is worth internalising: the vendor's answer to rebalancing is not a cleverer hash, it is many small units plus a background process that moves them politely.",
        },
        {
          kind: "concept",
          title: "What to watch while it runs",
          body: "Migration load is real load. The copy competes for disk and network with the queries that pay your bills, so the throttle matters more than the elapsed time — a migration that takes six hours and stays invisible beats one that takes forty minutes and halves the p95.\n\nThe signals that gate the cutover are the ones specific to this move: replay lag on the moving range, checksum equality, error rate on the new owner under mirrored traffic, and the p95 of requests that touch it. None of them are the cluster-wide dashboards. The cluster looks fine during a botched migration, which is why the per-range signals exist.\n\nAnd the last one: who is on call, and can they roll back at 3 a.m. without the engineer who wrote the script? A rebalance whose rollback needs its author is a rebalance with one person's availability as its recovery objective.",
        },
        {
          kind: "diagram",
          caption:
            "Thirty-two smaller units with the hotspot cooled: the same traffic at 23% — and, more to the point, a unit small enough to move politely",
          graph: memberGraph(32, 0.2),
        },
        {
          kind: "your_turn",
          prompt:
            "You are moving 2 TB from one shard to a new one at 200 MB/s of copy bandwidth, while that shard takes 900 requests a second. Compute the copy time, then name the three signals you would require before switching writes, and the one fact you would write down first.",
        },
        {
          kind: "compare",
          body: "A beginner rebalances by changing the partition count and letting the hash sort it out, which works exactly once and never again. An engineer moves ownership deliberately, in units, with a verification step that can fail and a rollback that has been rehearsed.\n\nThe trap is measuring the migration by whether it finished. A move that completed and lost a range of rows has completed; the only thing that would have caught it is the checksum step somebody shortened because the window was tight.",
        },
        {
          kind: "recap",
          points: [
            "Changing the modulus moves almost everything: 16 to 17 moves about 94% of rows",
            "Copy, catch up, verify, cut over reads then writes, decommission",
            "The rollback point is the end of step 4 — write it down before you begin",
            "Many small units per partition make every future move cheaper",
            "Throttle for invisibility, and gate the cutover on per-range signals, not cluster averages",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "consistent-hashing",
      title: "The ring",
      attribution:
        "Synthesised from Wikipedia's article on consistent hashing, which describes the ring and virtual nodes, and the system-design-primer. The remapping fractions are computed from the ring's geometry.",
      sources: [
        {
          label: "Wikipedia — consistent hashing",
          url: "https://en.wikipedia.org/wiki/Consistent_hashing",
        },
        {
          label: "system-design-primer",
          url: "https://github.com/donnemartin/system-design-primer",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "Eight caches become nine",
          body: "The EVCache tier from module 7 has eight nodes and a routing rule of `hash(key) % 8`. Capacity is tight, so a ninth is added and the modulus becomes 9.\n\nUnder `% N`, a key stays put only when its hash has the same remainder modulo the old and new count — one key in nine for 8 → 9, so **eight of every nine keys move**. Eight-ninths of the cache is now on the wrong node, which is to say on no node, which is to say every one of those lookups is a miss hitting the store at once. The store was at 12% behind a 90% hit rate; the hit rate is now 10%, and it is module 7's stampede with a number on it.\n\nThis is not a cache-specific problem. Every hash-modulo placement scheme has it, which is why the ring exists.",
        },
        {
          kind: "concept",
          title: "Put the nodes on a circle too",
          body: "Hash each node's identity onto the same circle as the keys. A key belongs to the first node clockwise from it. Nothing else changes: it is still a hash, still O(1) lookup, still no coordination between nodes.\n\nWhat changes is what happens when a node joins. The new node lands somewhere on the ring and takes over the arc between it and the node that previously owned that arc — nothing else moves. Nine nodes, each owning a ninth of the circle, so adding the ninth moves **one ninth** of the keys, and all of them move *to* the new node. Compare with eight ninths: 11% instead of 89%.\n\nThat is the entire idea, and it is worth stating plainly because it sounds like a trick: the ring does not make remapping cheap by being cleverer about the hash. It makes it cheap by making ownership a *contiguous arc*, so that a change of ownership is a change of one arc.",
        },
        {
          kind: "concept",
          title: "Real nodes leave gaps, so use many small ones",
          body: "With eight nodes on a circle, the arcs are whatever eight random points produce. One node might own 30% of the ring and another 4%, so the even distribution you were promised does not materialise — you have built a shard layout with skew, by accident, and lesson 3 says what skew does to capacity.\n\nThe fix is **virtual nodes**: each physical node claims many small arcs scattered around the circle instead of one large one. Two hundred positions per node and the largest share converges close to even, because the arcs average out. It also gives you a dial for heterogeneous hardware — a machine with twice the memory claims twice the positions — and it makes removing a node a case of dropping its positions rather than reasoning about one arc.\n\nThe cost is memory and lookup: the ring is now a sorted structure of thousands of points, and you keep it everywhere that routes. Cheap, but not free, and it is why production implementations treat the ring as a shared artefact rather than something each client computes.",
        },
        {
          kind: "concept",
          title: "What the ring does not fix",
          body: "It does not split a hot key. One key is still one point on the circle and still one owner, so 80% of traffic on that key still lands on one node — lesson 3's floor applies unchanged. The ring distributes *keys evenly*, and it has never claimed to distribute *requests evenly*.\n\nIt does not avoid copying. Moving an arc still means transferring the data in it, with the five phases from the previous lesson; the ring only makes the arc small.\n\nAnd it does not survive a node dying. If a node disappears, its arcs belong to nobody until something else claims them, so a ring without replication turns one node failure into a slice of missing data. Real deployments put each key on the ring several times — the key plus `#1`, `#2` — so that the next few nodes clockwise each hold a copy. That is replication expressed in ring coordinates, and it is exactly module 8's replica set with a different placement rule.",
        },
        {
          kind: "your_turn",
          prompt:
            "Ten nodes, `% 10`. You add an eleventh. Compute the fraction of keys that move under modulo, then under a ring. Then work out how many keys need re-reading from a second position when one node dies, given each key is stored at three positions.",
        },
        {
          kind: "compare",
          body: "A beginner learns that consistent hashing means adding a node is cheap and hears “solved”. An engineer knows what it bought — a change of ownership is one arc — and what it did not: hot keys, data movement, and node failure are all exactly as hard as they were.\n\nThe trap is applying it where it is irrelevant. If your shard count changes once a year and you can migrate in a maintenance window, a ring is complexity you do not need. It earns its place when nodes join and leave constantly, which is true of a cache tier and rarely true of a primary database.",
        },
        {
          kind: "recap",
          points: [
            "Under `% N`, 8 → 9 moves eight of nine keys; the cache stops being a cache",
            "On a ring, a joining node takes one arc: about 1/(N+1) of keys, all of them to the new node",
            "Real nodes produce uneven arcs; virtual nodes average the distribution out",
            "A ring distributes keys evenly, not requests — a hot key is still one owner",
            "Replication on a ring is the same key at several positions; without it, a node loss is a data loss",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "cross-shard-queries",
      title: "Queries that need every shard",
      attribution:
        "Synthesised from Wikipedia's article on sharding and Chris Richardson's microservices.io pattern catalogue, including the database-per-service pattern. The percentile arithmetic follows from the definition of a maximum over independent shards.",
      sources: [
        {
          label: "Wikipedia — shard (database architecture)",
          url: "https://en.wikipedia.org/wiki/Shard_%28database_architecture%29",
        },
        {
          label: "microservices.io — database per service",
          url: "https://microservices.io/patterns/data/database-per-service.html",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "Two questions, two very different costs",
          body: "“The last twenty things this member watched” starts with a member id, resolves to one partition, and costs one query. It is *better* than it was before sharding, because the partition is smaller.\n\n“How many members finished season two last week” starts with no member id at all. It has no owner, so it becomes sixteen queries and a merge. Same database, same schema, same week of data — one answer is one round trip and the other is a fan-out whose latency is set by the slowest machine in the fleet.\n\nEvery design decision in this module has been about making the first query cheap. This lesson is the invoice for the second.",
        },
        {
          kind: "concept",
          title: "A scatter-gather's p95 is a p99.7 in disguise",
          body: "Send the query to sixteen shards in parallel and wait for all sixteen. Even if each shard answers within its own p95 95% of the time, the chance that *all sixteen* do is `0.95¹⁶ ≈ 0.44`. So the fan-out's p95 sits near the single shard's **99.7th** percentile — because the p95 of a maximum over sixteen independent draws is roughly the 1 − 0.05/16 quantile of one draw.\n\nThis is the tail-at-scale effect, and it is why cross-shard queries feel disproportionately slow even when every shard is healthy. It also explains why the fix is rarely “make each shard faster”: if each shard's p99 is the problem, no amount of averaging helps, and a hedge or a shorter fan-out does.",
        },
        {
          kind: "concept",
          title: "Top-k cannot be pushed down",
          body: "`ORDER BY watched_at DESC LIMIT 20` across sixteen shards cannot be answered by asking each shard for 20 and concatenating — you would get 320 rows in no particular order, 300 of which are the wrong ones.\n\nEach shard returns its own top 20, the router merges 320 rows and keeps 20. That is correct, and it is what every search engine and social feed does at scale. The cost is proportional to `k × shards`, not to `k`, so a deep page — request 20 rows starting at offset 10,000 — asks every shard for 10,020 rows. This is why infinite scroll is cheap and page 500 is not, and why “cursor pagination” exists: a cursor carries the last sort key so each shard can resume, and the merge stays shallow.",
        },
        {
          kind: "concept",
          title: "A transaction across shards is a different problem",
          body: "A transaction inside one shard is free: the database already knows how to do it. Across shards you have three options and none of them is a transaction in the sense you learned.\n\n**Two-phase commit.** A coordinator asks every participant to prepare, then to commit. Correct, and blocking: if the coordinator dies between the phases, participants hold locks until it returns. It also multiplies availability — a transaction over sixteen shards is available only when all sixteen are.\n\n**Sagas.** A sequence of local transactions with compensating actions. Not atomic, eventually consistent, and the compensation is business logic somebody has to write and test — a refund is not an `UPDATE`.\n\n**Design so it does not happen.** Put the rows a single decision touches on the same key. This is the one that actually works, and it is why microservice architectures converge on database-per-service: the boundary is chosen so that the transaction is local, and everything that crosses the boundary becomes an event.\n\nNetflix's migration post describes moving the *billing* infrastructure last of all, because money movement cannot be retried carelessly. That is the discipline stated as a schedule.",
        },
        {
          kind: "your_turn",
          prompt:
            "Twenty-four shards, each with a p95 of 4 ms. Compute the probability that a full scatter-gather sees every shard inside its own p95, then say what the fan-out's p95 approximately is and which of the three cross-shard options you would choose for a balance transfer.",
        },
        {
          kind: "compare",
          body: "A beginner shards by whichever key is convenient and discovers six months later that the analytics dashboard times out. An engineer lists the queries that will not have a key — counts, reports, moderation queues, fraud checks — before choosing the boundary, and decides then whether they are a nightly job, a separate store, or a smaller fan-out.\n\nThe trap is believing a scatter-gather is fine because the average is fine. Sixteen healthy shards produce a fan-out that is slower than all of them, every time, in the tail where the members are.",
        },
        {
          kind: "recap",
          points: [
            "A query with a shard key is one round trip; a query without one is a fan-out",
            "Sixteen shards at p95 each give a fan-out p95 near the single shard's p99.7",
            "Top-k merges k × shards rows, so deep offsets get expensive — use cursors",
            "Cross-shard writes mean 2PC, sagas, or a boundary that keeps the transaction local",
            "Choose the boundary so the common decision touches one key, and accept events for the rest",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "when-not-to-shard",
      title: "When not to shard",
      attribution:
        "Synthesised from the MongoDB sharding documentation, the system-design-primer and Use The Index, Luke. The measured figures are this module's canvas; the disclosure in the third concept is a limitation of that canvas, stated deliberately.",
      sources: [
        {
          label: "Use The Index, Luke — SQL indexing",
          url: "https://use-the-index-luke.com/",
        },
        {
          label: "MongoDB — sharding",
          url: "https://www.mongodb.com/docs/manual/sharding/",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "The store is at 26% and nobody is happy",
          body: "After the hot key was split and the store was partitioned, the member store sits at 26% of its effective ceiling with zero errors at sixteen thousand requests a second. The graph is healthy. The bill has not arrived yet.\n\nIt will arrive as: a routing rule in every service, a rebalance to rehearse, a dashboard per partition, a cross-shard report that used to be one query, and a shard key that is now expensive to change. None of those are on the canvas, and all of them are permanent. The question this lesson answers is when that trade is worth making.",
        },
        {
          kind: "concept",
          title: "The ladder, in cost order",
          body: "**1. Add an index.** Cheapest by an order of magnitude: no new component, no new failure mode, reversible in a migration. Most “the database is slow” reports at this scale are a missing index, and the honest first move is to look at the query plan.\n\n**2. Add a cache.** One configuration change, one new staleness question. Module 7's whole account.\n\n**3. Add a read replica.** One more copy, one more lag to reason about. Module 8's.\n\n**4. Buy a bigger machine.** Embarrassingly effective, and it stops at a largest instance.\n\n**5. Partition.** The only rung that costs you a routing rule, a rebalance procedure and a class of query you can no longer run cheaply. It is last because it is permanent in a way the others are not: an index can be dropped and a cache can be deleted, but a shard key is a fact about where every row lives.\n\nClimb in that order, and skip rungs only when you can say why. “We are a sharded system” is not a reason; “the table is 90 TB and the largest instance is 32” is.",
        },
        {
          kind: "concept",
          title: "Shard for one of three reasons",
          body: "**Storage.** One machine cannot hold the table, or will not within your planning horizon. This is the case the canvas cannot model and the reason lesson 1 did the arithmetic by hand.\n\n**Write throughput.** Replicas do not help — every write still goes to one primary — so a write-bound store shards. Each with a different key: storage wants even bytes, writes want even write rate, and both want the queries that matter to stay local.\n\n**An unsplittable hot key on one machine.** Lesson 3's floor, when one design change is not enough and the key needs its own physical home.\n\nNotice what is *not* on the list: read latency. That is rungs 1 to 3. A team that shards to fix p95 on reads has paid the permanent cost of sharding and left the actual problem in place — the slow query is now slow on sixteen machines.",
        },
        {
          kind: "concept",
          title: "What this canvas cannot grade, and why it says so",
          body: "Here is a fact about this module's task rather than about sharding: **ten read replicas and no partitioning reach 29%**, which passes every criterion. The engine multiplies a database node's capacity by `1 + readReplicas` and has no dimension for bytes, write amplification or per-shard cost, so the one thing sharding is actually for is the one thing it cannot measure.\n\nThat is why the task's *steps* grade the decision — at least sixteen partitions, hot key share at or below 0.2 — and its criteria grade only capacity. A model that claimed to prove “you should shard” from a request-rate graph would be lying, and a learner who believed it would shard a database that needed an index.\n\nThe general habit is worth more than the specific case: when a simulation says a design works, ask what it did not measure. Here the answer is storage, and it is the reason lesson 1 was arithmetic instead of a graph.",
        },
        {
          kind: "your_turn",
          prompt:
            "Take a system you have actually operated. Name its binding constraint — bytes, read rate, write rate, or one key — then say which rung of the ladder you would climb and what permanent cost you are accepting. If your answer is “partition”, name the shard key and one query it makes worse.",
        },
        {
          kind: "compare",
          body: "A beginner asks how many shards a system needs. An engineer asks what is full, then checks whether a cheaper rung is still available — and can name the query that sharding will make expensive before agreeing to it.\n\nThe trap is that sharding is legible. It has a diagram, a number, and a word that sounds like engineering. An index has none of those and solves more of these problems, which is why the ladder is in cost order and why the last rung is the one you have to justify.",
        },
        {
          kind: "recap",
          points: [
            "Index, cache, replica, bigger machine, partition — climb in that order",
            "Shard for storage, write throughput, or an unsplittable hot key — never for read latency",
            "Partitioning costs a routing rule, a rebalance procedure and a class of cheap query",
            "This canvas has no bytes, so replicas pass this module's gate — the steps grade the decision",
            "When a simulation says it works, ask what it did not measure",
          ],
        },
      ],
    },
  ],
  interviewByte: {
    shape:
      "A 28 TB table grows by 60 GB a day and the largest instance is 32 TB. How do you split it, and what breaks when you do?",
    strongAnswer:
      "First the reason: this is a storage problem, not a request-rate problem, so read replicas are irrelevant — three copies of 28 TB is more disk, not less table. At 60 GB a day there are sixty-six days of headroom, so the plan is three shards of 32 TB with room for replication, chosen for two years rather than for the asymptote. Then the key. I list the queries that must be answered by one shard — a member's list and playback position, so member id — and accept that anything without a member id becomes a fan-out. Hashing spreads evenly and destroys range locality; ranges keep locality and put every new row on the last shard, so I would hash with a pre-split or ring-based placement and keep the hot key in mind. That is the part most designs get wrong: with 80% of reads on one key, sixteen partitions bought 1.29×, and 1,000 partitions still stop at 81% — the hot key is the ceiling, and cooling it is a design change, not a machine. The bill is a routing rule, a rebalance I rehearse (copy, catch up, verify, cut over reads then writes, decommission, with rollback ending at cut-over), and cross-shard queries whose p95 is a single shard's p99.7. And I would check the cheaper rungs first: an index, a cache, a replica, a bigger machine.",
    trap: "Saying “shard it” without naming what is full — storage, writes, or one key — or choosing a key by uniqueness instead of by query pattern. The second trap is believing partition count fixes a hot key, and the third is forgetting that a fan-out query's latency is set by the slowest shard, so the cross-shard report becomes the new p95.",
  },
  task: {
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
  },
  recap: [
    "A replica buys requests; only a partition makes the table smaller",
    "Hash sharding spreads and loses locality; range sharding keeps locality and follows the data",
    "Under `% N`, 8 to 9 remaps eight of nine keys — a ring moves one ninth",
    "The busiest partition's share is readShare × (h + (1−h)/P); the hot term never shrinks",
    "16 partitions on an 80% hot key bought 1.29×; the ceiling is the key, not the count",
    "Rebalancing is copy, catch up, verify, cut over, decommission — with the rollback written down first",
    "Cross-shard queries fan out, and the fan-out's p95 is one shard's p99.7",
    "Index, cache, replica, bigger machine, partition — and shard only for storage, writes, or a hot key",
  ],
  attribution:
    "Synthesised from Netflix's account of completing its cloud migration, the MongoDB sharding, shard-key and balancer documentation, Wikipedia's articles on sharding and consistent hashing, Chris Richardson's microservices.io pattern catalogue, the system-design-primer and Use The Index, Luke. The capacity figures (5,000 r/s per database node, 2,000 per app instance, 20,000 per balancer) are this module's teaching model, and every percentage in the lessons and the task was measured on its canvas at 16,000 requests per second.",
};

export default module;
