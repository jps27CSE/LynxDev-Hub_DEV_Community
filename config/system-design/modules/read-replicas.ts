import type { SdModule } from "../types";
import { defaultNode } from "@/lib/system-design/nodes";

const module: SdModule = {
  slug: "read-replicas",
  order: 7,
  part: 1,
  partTitle: "Scaling up",
  kind: "sim",
  title: "Read Replicas",
  description:
    "Learn why scaling reads is not the same as scaling writes, how replication lag creates stale data, and what it takes to promote a replica when the primary dies.",
  story:
    "Our photo-sharing app now has a cache absorbing most reads, but the database is still a single machine. Every write (new post, like, follow) goes to that one primary. Reads can be scaled by adding replicas, but writes cannot - they must all land on the primary. At 5,000 requests per second the primary is busy, and if it dies, every write in the system stops. We need replicas for reads and a plan for failover.",
  chapters: [
    {
      slug: "scaling-reads",
      title: "Scaling Reads vs Writes",
      description: "Why reads scale horizontally but writes do not.",
      children: [
        {
          slug: "read-scaling",
          title: "Scaling Reads",
          description: "Add replicas to spread read traffic.",
        },
        {
          slug: "write-scaling",
          title: "Why Writes Don't Scale the Same Way",
          description: "All writes go to the primary; replicas are read-only.",
        },
      ],
    },
    {
      slug: "replication",
      title: "Replication & Lag",
      description:
        "How data flows from primary to replicas and why lag matters.",
      children: [
        {
          slug: "replication-lag",
          title: "Replication Lag",
          description:
            "The delay between a write on the primary and its appearance on a replica.",
        },
        {
          slug: "promoting",
          title: "Promoting a Replica",
          description:
            "What happens when the primary dies and a replica takes over.",
        },
      ],
    },
  ],
  lessons: [
    {
      slug: "scaling-reads-vs-writes",
      title: "Scaling reads is not scaling writes",
      attribution: "Synthesised from donnemartin/system-design-primer",
      sections: [
        {
          kind: "scenario",
          title: "The 95/5 split",
          body: "Our photo app's traffic is 95% reads (feed, profile, photo views) and 5% writes (new post, like, follow). The database handles both, but they scale differently. Adding a bigger machine helps both a little. Adding replicas helps reads a lot - but writes still all land on the primary.",
        },
        {
          kind: "concept",
          title: "Read replicas",
          body: "A read replica is a copy of the primary database that stays in sync (asynchronously). Reads can be routed to replicas, spreading the load. The primary only handles writes and the replication stream.\n\nThink of a library: the head librarian (primary) writes new entries in the master catalog. Assistants (replicas) answer reader questions from their copies. Adding assistants scales question-answering; it does not scale catalog-writing.",
        },
        {
          kind: "concept",
          title: "Why writes don't scale the same way",
          body: "Every write must go to the primary so there is a single source of truth. Replicas are read-only. If two writes happen at the same time on different nodes, you get conflicts. So writes are bounded by the primary's capacity, not the cluster's.\n\nThis is the fundamental asymmetry: reads scale horizontally with replicas; writes scale only by making the primary bigger (or by sharding - Module 8).",
        },
        {
          kind: "diagram",
          caption: "Primary handles writes; replicas serve reads",
          graph: {
            nodes: [
              (() => {
                const n = defaultNode("client", "client-1", 40, 200);
                (n as any).label = "Users";
                return n;
              })(),
              (() => {
                const n = defaultNode("load_balancer", "lb-1", 200, 200);
                (n as any).label = "Load Balancer";
                (n as any).algorithm = "rr";
                (n as any).rateLimitPerMin = null;
                return n;
              })(),
              (() => {
                const n = defaultNode("app_server", "app-1", 380, 200);
                (n as any).label = "App";
                (n as any).replicas = 1;
                (n as any).maxConcurrency = null;
                (n as any).breakerEnabled = false;
                return n;
              })(),
              (() => {
                const n = defaultNode("database", "db-primary", 620, 120);
                (n as any).label = "Primary (writes)";
                (n as any).readReplicas = 0;
                (n as any).partitions = 1;
                (n as any).hotKeyShare = 0;
                return n;
              })(),
              (() => {
                const n = defaultNode("database", "db-replica", 620, 280);
                (n as any).label = "Replica (reads)";
                (n as any).readReplicas = 2;
                (n as any).partitions = 1;
                (n as any).hotKeyShare = 0;
                return n;
              })(),
            ] as any,
            edges: [
              {
                id: "e1",
                from: "client-1",
                to: "lb-1",
                label: null,
                retry: { attempts: 0, backoffMs: 0, jitter: false },
                partitioned: false,
              },
              {
                id: "e2",
                from: "lb-1",
                to: "app-1",
                label: null,
                retry: { attempts: 0, backoffMs: 0, jitter: false },
                partitioned: false,
              },
              {
                id: "e3",
                from: "app-1",
                to: "db-primary",
                label: "writes",
                retry: { attempts: 0, backoffMs: 0, jitter: false },
                partitioned: false,
              },
              {
                id: "e4",
                from: "app-1",
                to: "db-replica",
                label: "reads",
                retry: { attempts: 0, backoffMs: 0, jitter: false },
                partitioned: false,
              },
            ],
            scenario: {
              arrivalRate: 5000,
              writeShare: 0.05,
              mediaShare: 0,
              bytesPerMediaRequest: 2_000_000,
              abusiveShare: 0,
              latencyJitterMs: 0,
              cacheColdStart: false,
              replicaLagMs: 0,
            },
          },
        },
        {
          kind: "your_turn",
          prompt:
            "Our photo app gets 50,000 req/s, 95% reads. The primary DB can handle 1,000 writes/s and 5,000 reads/s total. Do we need replicas? If yes, how many and what do they not help with?",
        },
        {
          kind: "compare",
          body: "A beginner adds replicas and assumes the system is now 'scaled'. A senior engineer asks 'what is the write throughput after this change?' - the answer is unchanged, because writes still hit the primary. Replicas scale reads; they do not scale writes.",
        },
        {
          kind: "video",
          videoId: "Q4BUDplOWRE",
          title:
            "System Design Basics in Bangla | Load Balancing + Data Sharding + Replication + Caching Explained",
          caption:
            "Bangla walkthrough covering replication among other scaling techniques.",
        },
        {
          kind: "concept",
          title: "Go deeper (free reads)",
          body: "Free reading on replication:\n\n- [donnemartin/system-design-primer — Database replication](https://github.com/donnemartin/system-design-primer#database-replication) — primer section.\n- [System Design Handbook — Replication](https://www.systemdesignhandbook.com/) — replication patterns.\n- [PostgreSQL Replication (docs)](https://www.postgresql.org/docs/current/high-availability.html) — real-world replication.\n- [Designing Data-Intensive Applications (Kleppmann)](https://dataintensive.net/) — deep dive book (paid).",
        },
        {
          kind: "recap",
          points: [
            "Replicas scale reads, not writes",
            "All writes go to the primary - single source of truth",
            "Write throughput is bounded by the primary's capacity",
            "Sharding (Module 8) is how you scale writes",
          ],
        },
      ],
    },
    {
      slug: "replication-lag",
      title: "Replication lag: the price of async",
      attribution: "Synthesised from donnemartin/system-design-primer",
      sections: [
        {
          kind: "scenario",
          title: "The stale profile",
          body: "User A updates their profile photo. They refresh the page and still see the old photo. They refresh again - now it's updated. What happened? The write went to the primary, but the read hit a replica that hadn't received the update yet. This is replication lag, and it is the price you pay for async replication.",
        },
        {
          kind: "concept",
          title: "What is replication lag?",
          body: "Replicas copy the primary's changes asynchronously. There is always a delay - milliseconds to seconds depending on load and network. During that window, a replica's data is stale.\n\nSynchronous replication would eliminate lag but makes every write wait for all replicas to confirm - slow and fragile. Async is the default because availability matters more than instant consistency for most reads.",
        },
        {
          kind: "concept",
          title: "When lag hurts",
          body: "Lag is invisible for most reads - nobody cares if a like count is 2 seconds stale. But it bites when:\n\n- A user reads their own just-written data (read-your-writes consistency).\n- A payment or inventory check needs the latest value.\n- A replica is promoted and clients read stale state during failover.\n\nThe fix depends on the case: route read-after-write to the primary, use synchronous replication for critical data, or accept eventual consistency.",
        },
        {
          kind: "concept",
          title: "Read-your-writes consistency",
          body: "The simplest fix for 'I just changed this, show me the new value': after a write, read from the primary for a short window (e.g., 5 seconds) or until the replica catches up. Most apps do this implicitly by redirecting to a page that reads from the primary.",
        },
        {
          kind: "your_turn",
          prompt:
            "A user posts a photo and immediately views their profile. The profile shows the old photo count. Is this a bug? What would you do - route to primary, wait, or accept it?",
        },
        {
          kind: "compare",
          body: "A beginner panics at any stale read. A senior engineer asks 'does this staleness cause a wrong action?' - if no, accept it. If yes (payment, inventory), use synchronous replication or read from primary. Not every read needs to be fresh.",
        },
        {
          kind: "recap",
          points: [
            "Async replication has lag - replicas are slightly behind the primary",
            "Lag hurts read-your-writes and critical data, not most reads",
            "Read from primary after a write for read-your-writes consistency",
            "Synchronous replication trades availability for freshness",
          ],
        },
      ],
    },
    {
      slug: "promoting-a-replica",
      title: "Promoting a replica: when the primary dies",
      attribution: "Synthesised from donnemartin/system-design-primer",
      sections: [
        {
          kind: "scenario",
          title: "The primary is down",
          body: "At 3 AM the primary database stops responding. Writes fail. Reads from replicas still work, but they are now frozen at the last replicated state. Every minute of downtime is lost writes and stale reads. How do we recover?",
        },
        {
          kind: "concept",
          title: "Promotion",
          body: "A replica is promoted to become the new primary. It stops replicating and starts accepting writes. Clients are redirected to it. This is failover, and it is the reason you run replicas in the first place.\n\nThe catch: promotion takes time (seconds to minutes), and any writes that were on the old primary but not yet replicated are lost. The data-loss window is exactly the replication lag at the moment of failure.",
        },
        {
          kind: "concept",
          title: "What makes failover hard",
          body: "1. Detection: is the primary really down, or just slow? (Split-brain risk.)\n2. Election: which replica is the most up-to-date? (Pick the one with the highest replication position.)\n3. Switchover: redirect clients without dropping connections.\n4. Re-replication: the old primary, when it comes back, must become a replica of the new primary - not the other way around.\n\nManaged databases (RDS, Cloud SQL) handle this automatically. Building it yourself is a multi-week project.",
        },
        {
          kind: "concept",
          title: "Try it in the simulator",
          body: "Open the failure panel and toggle 'node_down' on the primary database. Watch writes fail (unreachable). Then imagine promoting a replica: reads survive, writes resume once the replica is promoted. In production, a managed database does this in seconds. In your own code, it is a project.",
        },
        {
          kind: "your_turn",
          prompt:
            "Our primary dies. We have 2 replicas, one 1 second behind, one 5 seconds behind. Which do we promote and what do we lose? What do clients see during the 30 seconds of failover?",
        },
        {
          kind: "compare",
          body: "A beginner assumes replicas give instant failover. A senior engineer plans for the data-loss window (replication lag at failure time) and the failover delay (detection + promotion + redirect). Both are measurable and must be in your SLO.",
        },
        {
          kind: "recap",
          points: [
            "Promotion turns a replica into the new primary",
            "Data loss = replication lag at the moment of failure",
            "Failover takes time: detection, election, switchover",
            "Managed databases handle this; building it yourself is hard",
          ],
        },
      ],
    },
  ],
  interviewByte: {
    shape:
      "How do read replicas work, and what is the difference between scaling reads and scaling writes?",
    strongAnswer:
      "Read replicas are copies of the primary database that stay in sync asynchronously. Reads can be routed to replicas, scaling read throughput horizontally. Writes still go to the primary, so write throughput is unchanged - replicas do not scale writes. The trade-off is replication lag: replicas are slightly behind, so reads can be stale. For read-your-writes consistency, route recent writes to the primary. For failover, promote a replica to primary, accepting a data-loss window equal to the lag at failure time.",
    trap: "Saying 'replicas scale the database' without distinguishing reads from writes. Or claiming replicas make writes faster. Or ignoring replication lag and assuming replicas are always consistent.",
  },
  task: {
    brief:
      "Survive losing the primary database. Add read replicas so reads keep flowing and the primary has headroom.",
    startGraph: {
      nodes: [
        (() => {
          const n = defaultNode("client", "client-1", 40, 200);
          (n as any).label = "Users";
          return n;
        })(),
        (() => {
          const n = defaultNode("load_balancer", "lb-1", 200, 200);
          (n as any).label = "Load Balancer";
          (n as any).algorithm = "rr";
          (n as any).rateLimitPerMin = null;
          return n;
        })(),
        (() => {
          const n = defaultNode("app_server", "app-1", 380, 200);
          (n as any).label = "App";
          (n as any).replicas = 1;
          (n as any).maxConcurrency = null;
          (n as any).breakerEnabled = false;
          return n;
        })(),
        (() => {
          const n = defaultNode("database", "db-1", 620, 200);
          (n as any).label = "Primary";
          (n as any).readReplicas = 0;
          (n as any).partitions = 1;
          (n as any).hotKeyShare = 0;
          return n;
        })(),
      ] as any,
      edges: [
        {
          id: "e1",
          from: "client-1",
          to: "lb-1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e2",
          from: "lb-1",
          to: "app-1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e3",
          from: "app-1",
          to: "db-1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
      ],
      scenario: {
        arrivalRate: 50000,
        writeShare: 0.05,
        mediaShare: 0,
        bytesPerMediaRequest: 2_000_000,
        abusiveShare: 0,
        latencyJitterMs: 0,
        cacheColdStart: false,
        replicaLagMs: 0,
      },
    },
    solutionGraph: {
      nodes: [
        (() => {
          const n = defaultNode("client", "client-1", 40, 200);
          (n as any).label = "Users";
          return n;
        })(),
        (() => {
          const n = defaultNode("load_balancer", "lb-1", 200, 200);
          (n as any).label = "Load Balancer";
          (n as any).algorithm = "rr";
          (n as any).rateLimitPerMin = null;
          return n;
        })(),
        (() => {
          const n = defaultNode("app_server", "app-1", 380, 200);
          (n as any).label = "App";
          (n as any).replicas = 1;
          (n as any).maxConcurrency = null;
          (n as any).breakerEnabled = false;
          return n;
        })(),
        (() => {
          const n = defaultNode("database", "db-1", 620, 200);
          (n as any).label = "Primary + 2 replicas";
          (n as any).readReplicas = 2;
          (n as any).partitions = 1;
          (n as any).hotKeyShare = 0;
          return n;
        })(),
      ] as any,
      edges: [
        {
          id: "e1",
          from: "client-1",
          to: "lb-1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e2",
          from: "lb-1",
          to: "app-1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e3",
          from: "app-1",
          to: "db-1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
      ],
      scenario: {
        arrivalRate: 50000,
        writeShare: 0.05,
        mediaShare: 0,
        bytesPerMediaRequest: 2_000_000,
        abusiveShare: 0,
        latencyJitterMs: 0,
        cacheColdStart: false,
        replicaLagMs: 0,
      },
    },
    steps: [
      {
        id: "add-replicas",
        title: "Add read replicas",
        brief:
          "Give the database read replicas so reads spread out and the primary has headroom.",
        hint: "Select the database node and increase its readReplicas in the inspector.",
        reveal:
          "Open the inspector for the database node and set readReplicas to 2 or more. Replicas scale read throughput.",
        check: (g) => {
          const dbs = g.nodes.filter((n) => n.type === "database");
          if (dbs.length === 0)
            return { passed: false, progress: "Add a database node" };
          const hasReplicas = dbs.some((d) => (d as any).readReplicas >= 1);
          return {
            passed: hasReplicas,
            progress: hasReplicas
              ? "✓ Read replicas configured"
              : "Set readReplicas >= 1 on the database",
          };
        },
      },
    ],
    passCriteria: [
      {
        id: "p95-ok",
        label: "p95 < 200 ms at 5,000 req/s",
        required: true,
        explain:
          "With replicas absorbing reads, the primary should have headroom and p95 should stay under 200 ms.",
        assert: (r) => r.valid && r.latency.p95 < 200,
      },
      {
        id: "db-headroom",
        label: "Database utilisation < 25%",
        required: true,
        explain:
          "Replicas spread read load. If the database is still saturated, reads are not being offloaded.",
        assert: (r) => {
          const db = r.perNode.find((n) => n.id === "db-1");
          return !!db && db.utilisation < 0.25;
        },
      },
    ],
  },
  recap: [
    "Replicas scale reads, not writes",
    "All writes go to the primary",
    "Replication lag means stale reads - accept or fix per case",
    "Failover promotes a replica; data loss = lag at failure time",
    "Managed databases handle failover; building it is hard",
  ],
  attribution:
    "Synthesised from donnemartin/system-design-primer (375k★), algomaster.io and KodeKloud System Design For Beginners",
};

export default module;
