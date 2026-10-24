import type { SdModule } from "../types";
import { defaultNode } from "@/lib/system-design/nodes";

const module: SdModule = {
  slug: "back-of-the-envelope",
  order: 4,
  part: 0,
  partTitle: "Mindset",
  title: "Back-of-the-envelope estimation",
  description:
    "Learn to estimate scale quickly. Powers of two, latency numbers, Little's Law - the tools every system designer needs.",
  story:
    "We're ready to think about scale. For our photo-sharing app with 100k DAU, we need to estimate requests per second, storage requirements, and bandwidth. These numbers will guide our architectural decisions going forward.",
  lessons: [
    {
      slug: "powers-of-two-and-latency",
      title: "Powers of two and latency numbers",
      attribution: "Synthesised from donnemartin/system-design-primer (latency numbers) and common interview resources",
      sections: [
        {
          kind: "scenario",
          title: "Numbers you should know",
          body: "Before designing at scale, you need intuition for data sizes and latencies. Knowing these helps you spot bottlenecks quickly.",
        },
        {
          kind: "concept",
          title: "Key numbers",
          body: "Powers of two: 1KB=10^3, 1MB=10^6, 1GB=10^9, 1TB=10^12. Latency intuition: L1 cache ~1ns, RAM ~100ns, SSD ~100μs, network same DC ~0.5ms, cross-continent ~150ms. These numbers help you reason about trade-offs.",
        },
        {
          kind: "diagram",
          caption: "Our design - still monolith with DB",
          graph: {
            nodes: [
              (() => { const n = defaultNode("client", "client-1", 60, 180); (n as any).label = "Users"; return n; })(),
              (() => { const n = defaultNode("app_server", "app-1", 280, 180); (n as any).label = "Monolith"; (n as any).replicas = 1; return n; })(),
              (() => { const n = defaultNode("database", "db-1", 500, 180); (n as any).label = "DB"; return n; })(),
            ] as any,
            edges: [
              { id: "e1", from: "client-1", to: "app-1", label: null, retry: { attempts: 0, backoffMs: 0, jitter: false }, partitioned: false },
              { id: "e2", from: "app-1", to: "db-1", label: null, retry: { attempts: 0, backoffMs: 0, jitter: false }, partitioned: false },
            ],
            scenario: { arrivalRate: 100, writeShare: 0.05, mediaShare: 0, bytesPerMediaRequest: 2_000_000, abusiveShare: 0, latencyJitterMs: 0, cacheColdStart: false, replicaLagMs: 0 },
          },
        },
        {
          kind: "your_turn",
          prompt: "How much storage would 100k users need if each uploads 1 photo per day and photos average 2MB? Do the math.",
        },
        {
          kind: "compare",
          body: "100k * 1 * 2MB * 365 days = ~73TB per year. That's a lot - definitely need object storage and CDN, not storing in the database.",
        },
        {
          kind: "recap",
          points: [
            "Know powers of two and common latencies by heart",
            "Back-of-envelope math catches impossible ideas early",
            "Round numbers to make mental math easy",
          ],
        },
      ],
    },
    {
      slug: "littles-law",
      title: "Little's Law and QPS estimation",
      attribution: "Synthesised from operations research and system design practice",
      sections: [
        {
          kind: "scenario",
          title: "How many requests per second?",
          body: "For capacity planning, you need to estimate QPS. If you have 100k DAU and each user makes 10 requests per day, that's 10M requests/day. Divide by seconds in a day.",
        },
        {
          kind: "concept",
          title: "Little's Law",
          body: "Little's Law: L = λW (average number of items in system = average arrival rate * average time in system). This helps you reason about concurrency, queue lengths, and capacity. For rough estimates, QPS ≈ DAU * requests_per_user / 86400.",
        },
        {
          kind: "your_turn",
          prompt: "If we have 100k DAU, each does ~20 requests/day, and peak is 3x average, what's peak QPS? (86400 seconds/day)",
        },
        {
          kind: "compare",
          body: "Average: 100k * 20 / 86400 ≈ 23 QPS. Peak: ~69 QPS. For reads/writes split, writes might be 5% so ~3.5 write QPS, ~65.5 read QPS. These numbers guide caching and scaling decisions.",
        },
        {
          kind: "recap",
          points: [
            "QPS = DAU * actions/user / seconds_per_day",
            "Plan for peak (often 2-3x average)",
            "Little's Law connects concurrency, arrival rate, and latency",
          ],
        },
      ],
    },
  ],
  interviewByte: {
    shape: "You need to estimate storage for a photo app with 100M DAU. Walk me through your calculation.",
    strongAnswer: "I'd start with assumptions: 100M DAU, each uploads 1 photo per day, average photo size 2MB, keep for 10 years. That's 100M * 1 * 2MB = 200TB/day. Over 10 years = 730,000 TB. But I'd also consider compression, different sizes, and that not all users upload daily. I'd mention we need object storage (S3-like) and CDN. I'd be explicit about assumptions since exact numbers rarely given.",
    trap: "Giving a single number without stating assumptions. Good estimates show your thought process and call out assumptions clearly.",
  },
  task: {
    brief: "Our app has 100k DAU. Compute req/s, storage, and bandwidth. Show your assumptions and calculations. Your estimates should be reasonable.",
    startGraph: {
      nodes: [
        (() => { const n = defaultNode("client", "client-1", 60, 180); (n as any).label = "Users"; return n; })(),
        (() => { const n = defaultNode("app_server", "app-1", 280, 180); (n as any).label = "Monolith"; (n as any).replicas = 1; return n; })(),
      ] as any,
      edges: [
        { id: "e1", from: "client-1", to: "app-1", label: null, retry: { attempts: 0, backoffMs: 0, jitter: false }, partitioned: false },
      ],
      scenario: { arrivalRate: 100, writeShare: 0.05, mediaShare: 0, bytesPerMediaRequest: 2_000_000, abusiveShare: 0, latencyJitterMs: 0, cacheColdStart: false, replicaLagMs: 0 },
    },
    solutionGraph: {
      nodes: [
        (() => { const n = defaultNode("client", "client-1", 60, 180); (n as any).label = "Users"; return n; })(),
        (() => { const n = defaultNode("app_server", "app-1", 280, 180); (n as any).label = "Monolith"; (n as any).replicas = 1; return n; })(),
        (() => { const n = defaultNode("database", "db-1", 500, 180); (n as any).label = "DB"; return n; })(),
      ] as any,
      edges: [
        { id: "e1", from: "client-1", to: "app-1", label: null, retry: { attempts: 0, backoffMs: 0, jitter: false }, partitioned: false },
        { id: "e2", from: "app-1", to: "db-1", label: null, retry: { attempts: 0, backoffMs: 0, jitter: false }, partitioned: false },
      ],
      scenario: { arrivalRate: 100, writeShare: 0.05, mediaShare: 0, bytesPerMediaRequest: 2_000_000, abusiveShare: 0, latencyJitterMs: 0, cacheColdStart: false, replicaLagMs: 0 },
    },
    steps: [
      {
        id: "estimate-qps",
        title: "Estimate QPS",
        brief: "Calculate requests per second.",
        hint: "DAU * requests/user / 86400, account for peak.",
        reveal: "100k DAU * 20 req/day / 86400 = ~23 avg QPS, peak ~69 QPS.",
        check: (g) => ({ passed: g.nodes.length >= 2, progress: "✓ QPS estimated" }),
      },
      {
        id: "estimate-storage",
        title: "Estimate storage",
        brief: "Calculate storage needs.",
        hint: "Photos are the biggest cost.",
        reveal: "100k users * 1 photo/day * 2MB * 365 = ~73TB/year.",
        check: (g) => ({ passed: g.edges.length >= 1, progress: "✓ Storage estimated" }),
      },
    ],
    passCriteria: [
      {
        id: "reasonable-estimates",
        label: "Estimates within reasonable range",
        required: true,
        explain: "Your back-of-envelope calculations should be in the right ballpark.",
        assert: (r) => r.valid,
      },
    ],
  },
  recap: [
    "Use powers of two and known latency numbers",
    "QPS = DAU × actions/user ÷ seconds/day, plan for peak",
    "Photos dominate storage and bandwidth costs",
    "State assumptions - they're as important as the numbers",
  ],
  attribution: "Synthesised from donnemartin/system-design-primer and common system design interview resources",
};

export default module;
