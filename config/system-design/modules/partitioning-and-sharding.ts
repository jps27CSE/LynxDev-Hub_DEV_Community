import type { SdGraph, SdModule } from "../types";

const NO_RETRY = { attempts: 0, backoffMs: 0, jitter: false };

function diagramGraph(partitions = 1, hotKeyShare = 0): SdGraph {
  return {
    nodes: [
      { id: "client-1", type: "client", label: "Users", x: 40, y: 200 },
      {
        id: "lb-1",
        type: "load_balancer",
        label: "Load Balancer",
        x: 200,
        y: 200,
        algorithm: "rr",
        rateLimitPerMin: null,
      },
      {
        id: "app-1",
        type: "app_server",
        label: "Feed API",
        x: 390,
        y: 200,
        replicas: 1,
        maxConcurrency: null,
        breakerEnabled: false,
      },
      {
        id: "db-1",
        type: "database",
        label: `${partitions} partition${partitions === 1 ? "" : "s"}`,
        x: 620,
        y: 200,
        readReplicas: 2,
        partitions,
        hotKeyShare,
      },
    ],
    edges: [
      {
        id: "e1",
        from: "client-1",
        to: "lb-1",
        label: null,
        retry: NO_RETRY,
        partitioned: false,
      },
      {
        id: "e2",
        from: "lb-1",
        to: "app-1",
        label: null,
        retry: NO_RETRY,
        partitioned: false,
      },
      {
        id: "e3",
        from: "app-1",
        to: "db-1",
        label: "feed query",
        retry: NO_RETRY,
        partitioned: false,
      },
    ],
    scenario: {
      arrivalRate: 1_000,
      writeShare: 0.05,
      mediaShare: 0,
      bytesPerMediaRequest: 2_000_000,
      abusiveShare: 0,
      latencyJitterMs: 0,
      cacheColdStart: false,
      replicaLagMs: 0,
    },
  };
}

function taskGraph(partitions: number, hotKeyShare: number): SdGraph {
  const graph = diagramGraph(partitions, hotKeyShare);
  graph.nodes[2] = {
    id: "app-1",
    type: "app_server",
    label: "Feed API",
    x: 390,
    y: 200,
    replicas: 10,
    maxConcurrency: null,
    breakerEnabled: false,
  };
  graph.nodes[3] = {
    id: "db-1",
    type: "database",
    label:
      partitions === 1
        ? "Primary + 2 replicas"
        : `${partitions} feed partitions`,
    x: 620,
    y: 200,
    readReplicas: 2,
    partitions,
    hotKeyShare,
  };
  graph.scenario.arrivalRate = 18_000;
  return graph;
}

const module: SdModule = {
  slug: "partitioning-and-sharding",
  order: 9,
  part: 1,
  partTitle: "Scaling up",
  kind: "sim",
  title: "Partitioning & Sharding",
  description:
    "Split a growing dataset across database partitions, choose a shard key deliberately, and reason about hot keys and rebalancing.",
  story:
    "The photo-sharing app now has read replicas, but one creator has 40 million followers. Building that creator's feed still takes 9 seconds: every follower relationship and feed request piles onto the same database key. More read replicas copy the same hot data; they do not divide the work for that key. We need to split the data and workload without making every query a hunt across the whole cluster.",
  chapters: [
    {
      slug: "partition-basics",
      title: "Partitioning the dataset",
      description: "Why one database eventually needs multiple pieces.",
      children: [
        {
          slug: "horizontal-partitioning",
          title: "Horizontal partitioning",
          description:
            "Split rows across partitions while keeping one logical dataset.",
        },
        {
          slug: "choosing-a-shard-key",
          title: "Choosing a shard key",
          description: "Route related reads and writes to the right partition.",
        },
      ],
    },
    {
      slug: "skew-and-rebalancing",
      title: "Skew & Rebalancing",
      description: "Recognize hot keys and move data as the system grows.",
      children: [
        {
          slug: "hot-keys",
          title: "Hot keys",
          description:
            "Why a popular user can overload one otherwise healthy shard.",
        },
        {
          slug: "rebalancing",
          title: "Rebalancing",
          description: "Add capacity without making the whole app unavailable.",
        },
      ],
    },
  ],
  lessons: [
    {
      slug: "why-partition-data",
      title: "Why partition data?",
      attribution: "Synthesised from donnemartin/system-design-primer",
      sections: [
        {
          kind: "scenario",
          title: "The database is still one box",
          body: "Read replicas gave the app more places to answer reads, but each replica still holds the same dataset. The 40-million-follower creator remains a single, very busy key. When one machine can no longer hold or serve the data, split rows across partitions so each machine owns a portion.",
        },
        {
          kind: "concept",
          title: "Partitioning versus vertical scaling",
          body: "Vertical scaling gives one database a larger machine. It is simple, but the machine has a ceiling. Horizontal partitioning (sharding) divides rows among multiple database partitions, so storage and request capacity can grow with the cluster.\n\nA partition is one piece of the logical dataset. Sharding is the practice of placing those pieces across separate database instances. The application needs a routing rule that can find the right piece.",
        },
        {
          kind: "concept",
          title: "Keep the common query local",
          body: "A useful shard key puts data used together on the same partition. If a feed query starts with a user ID, partitioning by that ID can make the user's feed and relationships easy to find. But a key is not good merely because it is easy to hash: it must distribute work and match the queries the product actually runs.",
        },
        {
          kind: "diagram",
          caption: "The app routes a request to a partitioned database",
          graph: diagramGraph(),
        },
        {
          kind: "your_turn",
          prompt:
            "Our feed is requested by viewer ID, but a creator's posts are read by 40 million followers. Which data would you colocate for a viewer's feed, and which key could turn that creator into a hotspot?",
        },
        {
          kind: "compare",
          body: "A beginner hears 'the database is slow' and adds replicas. A senior engineer asks which query and key are slow, then decides whether the problem is read volume, write volume, storage size, or skew. Sharding addresses some of those limits, not all of them.",
        },
        {
          kind: "video",
          videoId: "Q4BUDplOWRE",
          title:
            "System Design Basics in Bangla | Load Balancing + Data Sharding + Replication + Caching Explained",
          caption:
            "Bangla walkthrough covering data sharding among other scaling techniques.",
        },
        {
          kind: "concept",
          title: "Go deeper (free reads)",
          body: "Free reading on sharding:\n\n- [donnemartin/system-design-primer — Database partitioning](https://github.com/donnemartin/system-design-primer#database-partitioning) — primer section.\n- [System Design Handbook — Sharding](https://www.systemdesignhandbook.com/) — sharding patterns.\n- [Vitess (YouTube's sharding solution)](https://vitess.io/) — real-world sharding.\n- [Consistent hashing explained (Toptal)](https://www.toptal.com/big-data/consistent-hashing) — deep dive.",
        },
        {
          kind: "recap",
          points: [
            "Partitioning splits one logical dataset into pieces",
            "A shard key decides where each row or request goes",
            "Replicas copy data; partitions divide ownership",
            "Choose a key from real access patterns, not convenience alone",
          ],
        },
      ],
    },
    {
      slug: "hash-and-range-sharding",
      title: "Hash versus range sharding",
      attribution: "Synthesised from donnemartin/system-design-primer",
      sections: [
        {
          kind: "scenario",
          title: "Where does this row live?",
          body: "The app has several partitions now. A request for a user's feed must reach the partition that owns that user's data. The routing rule is part of the design: changing it later can mean moving a large amount of data.",
        },
        {
          kind: "concept",
          title: "Hash sharding",
          body: "Hashing a key and mapping the result to a partition tends to spread ordinary keys evenly. It avoids placing every new, nearby ID on the same machine. The cost is locality: a range query over IDs may need to ask many partitions, and changing the partition count can remap many keys unless the routing scheme accounts for movement.",
        },
        {
          kind: "concept",
          title: "Range sharding",
          body: "Range sharding sends intervals of keys to different partitions. Queries for a known interval can be efficient and ordered scans can stay local. But sequential IDs, dates, or geography can concentrate new writes in the newest or busiest range. Monitoring and splitting ranges becomes part of operating the system.",
        },
        {
          kind: "diagram",
          caption:
            "Hashing spreads keys; range boundaries preserve order but can skew",
          graph: diagramGraph(16),
        },
        {
          kind: "your_turn",
          prompt:
            "Would you hash-shard photo IDs if the product needs 'all photos from this week'? What would a range key make easier, and what could happen to the newest range during a launch?",
        },
        {
          kind: "compare",
          body: "There is no universally best shard key. Hashing often improves even distribution; ranges often improve ordered reads. A strong answer names the dominant queries, the write pattern, and the cost of cross-shard operations before choosing.",
        },
        {
          kind: "recap",
          points: [
            "Hash keys for even distribution, with weaker range locality",
            "Range keys for ordered access, with a risk of hot ranges",
            "The routing rule shapes query cost and future migrations",
            "Validate the choice against real read and write patterns",
          ],
        },
      ],
    },
    {
      slug: "hot-keys-and-skew",
      title: "Hot keys and skew",
      attribution:
        "Synthesised from donnemartin/system-design-primer and algomaster.io",
      sections: [
        {
          kind: "scenario",
          title: "One creator, forty million followers",
          body: "A celebrity posts a photo. If the feed path repeatedly reads one creator's row or one follower list, adding partitions does not automatically spread that key: the same key still maps to the same place. Average database utilisation can look healthy while one partition is overwhelmed.",
        },
        {
          kind: "concept",
          title: "Skew defeats the average",
          body: "A hot key is much more popular than the rest. If 20% of read traffic lands on one partition, that partition can be the bottleneck even when the remaining partitions are mostly idle. More partitions help the long tail, but they do not split an indivisible hot key by themselves.\n\nThe simulator's `hotKeyShare` is a simplified estimate of the read share aimed at one key. `partitions` spreads the remaining load; the hottest partition's share limits the modeled capacity.",
        },
        {
          kind: "concept",
          title: "Change the work, not just the machine count",
          body: "Possible fixes include bucketing a very large follower list, precomputing feeds on write for selected high-fanout accounts, caching popular results, or keeping a small set of hot accounts on dedicated capacity. Each shifts cost: fanout-on-write makes reads cheaper but writes and storage heavier; bucketing adds merge work on reads.",
        },
        {
          kind: "diagram",
          caption:
            "A hot key concentrates load even when there are many partitions",
          graph: diagramGraph(16, 0.8),
        },
        {
          kind: "your_turn",
          prompt:
            "A new post takes 9 seconds to distribute to a creator's 40 million followers. Would you fan out on read, fan out on write, or use a hybrid? Name one cost your choice moves elsewhere.",
        },
        {
          kind: "compare",
          body: "A beginner says 'use 64 shards' as if partition count alone fixes the hot account. A senior engineer checks the key distribution and notices that all 40 million followers still point at one key. The solution changes how that hot work is represented or served.",
        },
        {
          kind: "recap",
          points: [
            "Skew can overload one partition while cluster averages look fine",
            "More partitions do not split one hot key automatically",
            "Bucketing, fanout, caching, and dedicated capacity move different costs",
            "The simulator estimates skew; it does not model per-key requests",
          ],
        },
      ],
    },
    {
      slug: "rebalancing-shards",
      title: "Rebalancing without a flag day",
      attribution: "Synthesised from donnemartin/system-design-primer",
      sections: [
        {
          kind: "scenario",
          title: "The cluster has outgrown its map",
          body: "The app adds database capacity, but the existing key-to-partition map still sends traffic to the old machines. Simply changing `hash(key) % N` can move most keys at once. Users may see misses, overloaded destinations, or unavailable data while the cluster catches up.",
        },
        {
          kind: "concept",
          title: "Move data deliberately",
          body: "A safer migration identifies ownership, copies data to the new destination, keeps changes in sync, verifies counts and checksums, and then switches reads and writes. Rollback needs a clear point where the old owner remains authoritative. The exact protocol depends on the database and consistency requirements.",
        },
        {
          kind: "concept",
          title: "Virtual partitions and consistent hashing",
          body: "Virtual partitions let the system move smaller ownership units instead of treating each physical server as one giant range. Consistent-hashing schemes can limit how much key ownership changes when a node is added or removed. They reduce movement; they do not eliminate copying, hot keys, or the need to monitor skew.",
        },
        {
          kind: "diagram",
          caption:
            "More partitions create room to spread work, but ownership still needs a migration plan",
          graph: diagramGraph(16, 0.2),
        },
        {
          kind: "your_turn",
          prompt:
            "You are adding a database shard before a major launch. What would you copy first, how would you keep new writes in sync, and what signal must be healthy before routing reads to the new owner?",
        },
        {
          kind: "compare",
          body: "A beginner changes the shard count and hopes the hash function sorts it out. A senior engineer plans a staged ownership migration, watches per-shard load and lag, validates the copied data, and has a rollback path.",
        },
        {
          kind: "recap",
          points: [
            "Changing ownership can move data and traffic at the same time",
            "Copy, synchronize, verify, then cut over",
            "Virtual partitions can make movement more incremental",
            "A simulator's capacity result is not a production migration plan",
          ],
        },
      ],
    },
  ],
  interviewByte: {
    shape:
      "How would you shard a photo-sharing app's feed data, and how would you handle a celebrity with 40 million followers?",
    strongAnswer:
      "I would first identify the dominant feed queries and choose a key that routes the common viewer or feed lookup to a small number of partitions. Hashing can spread ordinary users evenly, while range-based layouts can make ordered queries easier but risk hot ranges. A celebrity remains a hot key even with many shards, so I would consider a hybrid: fanout-on-write or bucketed follower lists for selected high-fanout accounts, with caching or fanout-on-read where freshness and write cost matter. I would monitor per-shard skew and rebalance with a staged copy, sync, verify, and cutover process.",
    trap: "Claiming that adding shards automatically splits a hot key, or picking a shard key without naming the query pattern. Also avoid saying consistent hashing makes rebalancing free: data still has to move and be verified.",
  },
  task: {
    brief:
      "One creator has 40 million followers and their feed query takes 9 seconds. Partition the database and reduce the hot-key concentration so the feed stays under 300 ms at 18,000 requests/s.",
    startGraph: taskGraph(1, 0.8),
    solutionGraph: taskGraph(16, 0.2),
    steps: [
      {
        id: "add-feed-partitions",
        title: "Split the feed data",
        brief:
          "Increase the database to at least 16 partitions so ordinary feed keys can spread across the cluster.",
        hint: "Select the database node and change its Partitions value in the inspector.",
        reveal:
          "Set the database's partitions to 16 or more. A larger partition count gives the model more places to distribute non-hot keys.",
        check: (graph) => {
          const db = graph.nodes.find((node) => node.type === "database");
          const passed = !!db && db.partitions >= 16;
          return {
            passed,
            progress: passed
              ? `✓ ${db.partitions} database partitions configured`
              : db
                ? `${db.partitions} of 16 partitions configured`
                : "Add a database node",
          };
        },
      },
      {
        id: "reduce-hot-key-skew",
        title: "Spread the celebrity's feed work",
        brief:
          "Redesign the hot feed path so no single key accounts for more than 20% of the modeled read load.",
        hint: "Think about bucketing a large follower list or precomputing some feeds, then represent the lower skew with hotKeyShare.",
        reveal:
          "Set hotKeyShare to 0.2 or lower. In a real design, that result would come from changing how the hot account's work is split or served—not merely adding machines.",
        check: (graph) => {
          const db = graph.nodes.find((node) => node.type === "database");
          const passed = !!db && db.partitions >= 16 && db.hotKeyShare <= 0.2;
          return {
            passed,
            progress: passed
              ? "✓ Hot-key load is spread across the partitioned database"
              : db
                ? `Hot-key share is ${(db.hotKeyShare * 100).toFixed(0)}%; reduce it to 20% after partitioning`
                : "Add a database node",
          };
        },
      },
    ],
    passCriteria: [
      {
        id: "feed-p95",
        label: "p95 < 300 ms at 18,000 req/s",
        required: true,
        explain:
          "The feed path needs both enough partitions and a key layout that does not leave one partition carrying most of the work.",
        assert: (result) => result.valid && result.latency.p95 < 300,
      },
      {
        id: "feed-throughput",
        label: "At least 17,000 req/s complete",
        required: true,
        explain:
          "A low latency percentile is meaningless if the overloaded shard is rejecting most requests. Check completed throughput as well.",
        assert: (result) => result.valid && result.throughput >= 17_000,
      },
      {
        id: "db-headroom",
        label: "Database utilisation < 50%",
        required: true,
        explain:
          "The hottest partition, not the average shard, limits the modeled database capacity. Headroom leaves room for bursts and imperfect distribution.",
        assert: (result) => {
          const db = result.perNode.find((node) => node.id === "db-1");
          return !!db && db.utilisation < 0.5;
        },
      },
    ],
  },
  recap: [
    "Partitioning divides data ownership; replicas copy the same data",
    "Hash and range strategies trade distribution against query locality",
    "A hot key can dominate one shard despite many healthy partitions",
    "Rebalancing needs a staged, verifiable data-movement plan",
  ],
  attribution:
    "Synthesised from donnemartin/system-design-primer (375k★), algomaster.io and KodeKloud System Design For Beginners",
};

export default module;
