import type { SdModule } from "../types";
import { defaultNode } from "@/lib/system-design/nodes";

const module: SdModule = {
  slug: "back-of-the-envelope",
  order: 4,
  part: 0,
  partTitle: "Mindset",
  title: "Back-of-the-envelope Estimation",
  description:
    "Learn to estimate scale with simple math. Powers of two, QPS, storage, bandwidth and Little's Law explained step by step.",
  story:
    "Before we scale our photo-sharing app, we need numbers. How many requests per second? How much storage for photos? How much bandwidth? These don't need to be exact. They just need to be in the right ballpark to help us make smart decisions. Let's learn to calculate them from scratch.",
  lessons: [
    {
      slug: "powers-of-two-and-latency-numbers",
      title: "Powers of Two & Latency Numbers Everyone Should Know",
      attribution: "Synthesised from donnemartin/system-design-primer",
      sections: [
        {
          kind: "scenario",
          title: "Why numbers matter",
          body: "Saying 'a lot of storage' is useless. Saying '~70TB/year' tells you you CANNOT just dump photos in your primary SQL database. Estimations help you spot obvious problems early.",
        },
        {
          kind: "concept",
          title: "Powers of two to remember",
          body: "For rough estimates, these are enough:\n- 2^10 ~ 10^3 = 1 Thousand (1KB)\n- 2^20 ~ 10^6 = 1 Million (1MB)\n- 2^30 ~ 10^9 = 1 Billion (1GB)\n- 2^40 ~ 10^12 = 1 Trillion (1TB)\n\nYou don't need to be perfect. Rounding to nearest power of 10 is fine for back-of-envelope.",
        },
        {
          kind: "concept",
          title: "Rough latency numbers",
          body: "These give you intuition:\n- L1 cache: ~1 nanosecond (ns)\n- RAM: ~100 nanoseconds\n- SSD read: ~100 microseconds (μs)\n- Network round trip (same datacenter): ~0.5 milliseconds (ms)\n- HDD read: ~10 milliseconds\n- Network round trip (cross-continent): ~150 milliseconds\n\nKey takeaway: Reading from memory is 1000x faster than reading from disk. Network calls are expensive compared to in-memory.",
        },
        {
          kind: "diagram",
          caption: "Our app as-is",
          graph: {
            nodes: [
              (() => {
                const n = defaultNode("client", "client-1", 60, 180);
                (n as any).label = "Users";
                return n;
              })(),
              (() => {
                const n = defaultNode("app_server", "app-1", 280, 180);
                (n as any).label = "Monolith";
                (n as any).replicas = 1;
                return n;
              })(),
              (() => {
                const n = defaultNode("database", "db-1", 500, 180);
                (n as any).label = "DB";
                return n;
              })(),
            ] as any,
            edges: [
              {
                id: "e1",
                from: "client-1",
                to: "app-1",
                label: null,
                retry: { attempts: 0, backoffMs: 0, jitter: false },
                partitioned: false,
              },
              {
                id: "e2",
                from: "app-1",
                to: "db-1",
                label: null,
                retry: { attempts: 0, backoffMs: 0, jitter: false },
                partitioned: false,
              },
            ],
            scenario: {
              arrivalRate: 100,
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
            "Put these in order from fastest to slowest with rough reasoning: RAM, cross-continent network, SSD, L1 cache. Why does this order matter?",
        },
        {
          kind: "compare",
          body: "If you can avoid network calls or disk reads by using memory/cache, you'll win big on latency. This is why caching comes up so often for read-heavy apps.",
        },
        {
          kind: "recap",
          points: [
            "Memorize powers of two roughly",
            "Know the latency hierarchy (memory >> disk >> network)",
            "Use numbers to reason, not to impress",
            "Intuition > precision for back-of-envelope",
          ],
        },
      ],
    },
    {
      slug: "qps-storage-bandwidth",
      title: "QPS, Storage & Bandwidth Estimation",
      attribution: "Synthesised from donnemartin/system-design-primer",
      sections: [
        {
          kind: "scenario",
          title: "Estimating for our photo app",
          body: "Let's assume: 100,000 Daily Active Users (DAU). Most people read the feed, fewer post photos. Let's walk through it step by step.",
        },
        {
          kind: "concept",
          title: "Estimating QPS (Queries/Requests Per Second)",
          body: "Formula: QPS = (DAU * requests_per_user) / (seconds in a day)\n\nSeconds in a day = 24 * 3600 = 86,400\n\nAssume each user does ~10 actions/day on average (view feed, like, comment) = 100,000 * 10 = 1,000,000 requests/day\n1,000,000 / 86,400 ~ 12 requests/second (average)\n\nPeak is usually 2-3x average -> ~24-36 QPS peak\n\nSplit: reads ~90%, writes ~10% is common for social apps",
        },
        {
          kind: "concept",
          title: "Estimating Storage",
          body: "Photos are the killer here. Let's be realistic:\n- Assume 10% of users post daily -> 10,000 photos/day\n- Average photo size ~2MB\n- 10,000 * 2MB = 20,000 MB = 20 GB/day\n- Per year: 20 GB * 365 = ~7,300 GB = ~7.3 TB/year\n\nAlso need to store metadata (users, posts, likes) - that's usually small compared to media. So plan for object storage for photos, not your main DB.",
        },
        {
          kind: "concept",
          title: "Estimating Bandwidth",
          body: "Bandwidth = data transferred per second\n\nAssume 100,000 users view ~10 photos/day on average, each ~200KB after compression/thumbs\n100,000 * 10 * 200KB = 200,000,000 KB = 200,000 GB/day = ~2,314 GB/hour = ~643 MB/s\n\nThis is why CDNs matter. Serving all this from your single server would be impossible and expensive.",
        },
        {
          kind: "your_turn",
          prompt:
            "Redo the QPS calculation but assume peak is 3x average. Also say how you'd split reads/writes. Show your math clearly.",
        },
        {
          kind: "compare",
          body: "The numbers will guide you. If QPS is small, monolith might be fine. If bandwidth is huge, you MUST think about CDN and object storage. Let the numbers inform your design.",
        },
        {
          kind: "recap",
          points: [
            "QPS = (DAU * actions) / 86400, plan for peak",
            "Media dominates storage - don't put in relational DB",
            "Bandwidth adds up fast for image-heavy apps",
            "State assumptions clearly",
          ],
        },
      ],
    },
    {
      slug: "littles-law",
      title: "Little's Law & Putting It Together",
      attribution: "Synthesised from operations research applied to systems",
      sections: [
        {
          kind: "scenario",
          title: "Thinking about concurrency",
          body: "How many requests are 'in flight' at the same time? How does latency relate to how many users we can handle? Little's Law helps connect these.",
        },
        {
          kind: "concept",
          title: "Little's Law explained simply",
          body: "Formula: L = λ * W\n- L = average number of items in the system (concurrent requests)\n- λ = average arrival rate (requests per second)\n- W = average time in system (latency in seconds)\n\nExample: If we get 50 requests/sec and each takes 0.2 seconds on average, we have ~10 requests being processed at the same time.\n\nThis is useful for capacity planning - helps you estimate how many threads/connections you might need.",
        },
        {
          kind: "concept",
          title: "Pragmatic advice",
          body: "You won't always need Little's Law in every interview, but knowing it shows you understand the relationship between load, latency and concurrency. More directly, your main back-of-envelope tools will be QPS, storage and bandwidth calculations.",
        },
        {
          kind: "your_turn",
          prompt:
            "Using Little's Law: λ = 30 req/s, average latency W = 0.25s. How many concurrent requests are in the system? Explain in words.",
        },
        {
          kind: "compare",
          body: "If latency increases (slower app), L increases even if arrival rate stays same. More requests pile up. This is why high latency is bad for capacity too.",
        },
        {
          kind: "recap",
          points: [
            "Little's Law: concurrent = arrival_rate * latency",
            "Higher latency = more things in flight",
            "Focus on QPS, storage, bandwidth for most beginner designs",
            "Estimates guide decisions, perfection isn't needed",
          ],
        },
      ],
    },
  ],
  interviewByte: {
    shape:
      "Estimate the storage and bandwidth for a photo app with 100k DAU, assuming 10% upload daily and 2MB photos.",
    strongAnswer:
      "I'd start by stating assumptions: 100k DAU, 10% upload daily = 10,000 uploads/day, each photo ~2MB. Storage: 10,000 * 2MB = 20GB/day, so ~7.3TB/year. For bandwidth, assume users view feed heavily - say 10 photos per user per day at ~200KB (thumbnails) = 100k * 10 * 200KB = 200GB/day, which is about 2.3MB/s average. I'd note we'd use object storage for photos and a CDN for media since bandwidth would be too high to serve directly from app servers. All numbers are rough estimates.",
    trap: "Saying 'a lot' without doing the math, or putting all media in the SQL database. Always show your calculation and mention object storage + CDN for large media.",
  },
  task: {
    brief:
      "For our photo-sharing app with 100k DAU, do a proper back-of-envelope: estimate average and peak QPS, daily/yearly storage for photos, and rough bandwidth. State ALL assumptions clearly.",
    startGraph: {
      nodes: [
        (() => {
          const n = defaultNode("client", "client-1", 60, 180);
          (n as any).label = "Users";
          return n;
        })(),
        (() => {
          const n = defaultNode("app_server", "app-1", 280, 180);
          (n as any).label = "Monolith";
          (n as any).replicas = 1;
          return n;
        })(),
      ] as any,
      edges: [
        {
          id: "e1",
          from: "client-1",
          to: "app-1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
      ],
      scenario: {
        arrivalRate: 100,
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
          const n = defaultNode("client", "client-1", 60, 180);
          (n as any).label = "Users";
          return n;
        })(),
        (() => {
          const n = defaultNode("app_server", "app-1", 280, 180);
          (n as any).label = "Monolith";
          (n as any).replicas = 1;
          return n;
        })(),
        (() => {
          const n = defaultNode("database", "db-1", 500, 180);
          (n as any).label = "DB";
          return n;
        })(),
      ] as any,
      edges: [
        {
          id: "e1",
          from: "client-1",
          to: "app-1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e2",
          from: "app-1",
          to: "db-1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
      ],
      scenario: {
        arrivalRate: 100,
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
        id: "qps",
        title: "Calculate QPS",
        brief: "DAU * actions / 86400, add peak.",
        hint: "Show average and peak separately.",
        reveal: "e.g. 100k * 10 / 86400 ~ 11.5 avg QPS, peak ~35 QPS.",
        check: (g) => ({
          passed: g.nodes.length >= 1,
          progress: "✓ Work through QPS",
        }),
      },
      {
        id: "storage-bandwidth",
        title: "Calculate storage & bandwidth",
        brief: "Photos dominate both.",
        hint: "Think about uploads vs views.",
        reveal:
          "Uploads drive storage, views drive bandwidth. Plan for object storage + CDN.",
        check: (g) => ({
          passed: g.edges.length >= 0,
          progress: "✓ Work through storage/bandwidth",
        }),
      },
    ],
    passCriteria: [
      {
        id: "estimates-reasonable",
        label: "Reasonable estimates with assumptions",
        required: true,
        explain: "Show your math and state assumptions clearly.",
        assert: (r) => r.valid,
      },
    ],
  },
  recap: [
    "Powers of two and latency intuition matter",
    "QPS = (DAU × actions/day) ÷ 86400, plan for 2-3x peak",
    "Photos dominate storage - use object storage, not DB",
    "Bandwidth adds up - use CDN for media",
    "Little's Law connects latency, rate and concurrency",
    "Rough numbers > perfect numbers. Assumptions > silence",
  ],
  attribution:
    "Synthesised from donnemartin/system-design-primer, algomaster.io and KodeKloud System Design For Beginners",
};

export default module;
