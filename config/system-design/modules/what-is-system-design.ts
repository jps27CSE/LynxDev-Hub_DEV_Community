import type { SdModule } from "../types";
import { defaultNode } from "@/lib/system-design/nodes";

const module: SdModule = {
  slug: "what-is-system-design",
  order: 1,
  part: 0,
  partTitle: "Mindset",
  title: "What is system design?",
  description:
    "Learn to think in trade-offs. Start small with our photo-sharing app and see why choices matter more than boxes.",
  story:
    "Our photo-sharing app just launched. 100 users are signing up and posting their first photos. Everything runs on a single app server talking straight to the database. It works — for now. Before we scale, we need to learn to ask the right questions about performance, scalability, and the trade-offs behind every choice.",
  lessons: [
    {
      slug: "choices-not-boxes",
      title: "Choices, not boxes",
      attribution: "Synthesised from donnemartin/system-design-primer and algomaster.io",
      sections: [
        {
          kind: "scenario",
          title: "The first week",
          body: "One server handles signups, uploads, and feeds for 100 users. The founder is thrilled. A friend asks, 'What if this hits 100,000 users?' Nobody knows the answer yet. That question is system design.",
        },
        {
          kind: "concept",
          title: "System design is about trade-offs",
          body: "System design is not about memorising every component. It's about choosing which trade-offs are acceptable for a given problem. Do you care more about consistency or availability? Speed or cost? Simplicity or scale? Every choice gives something up.",
        },
        {
          kind: "diagram",
          caption: "Our starting point: 100 users on one server",
          graph: {
            nodes: [
              (() => { const n = defaultNode("client", "client-1", 40, 200); (n as any).label = "Users"; return n; })(),
              (() => { const n = defaultNode("app_server", "app-1", 260, 200); (n as any).label = "Monolith"; (n as any).replicas = 1; return n; })(),
              (() => { const n = defaultNode("database", "db-1", 480, 200); (n as any).label = "DB"; return n; })(),
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
          prompt: "For a photo-sharing app at 100k users, write down three questions you'd need answered before adding any boxes to the diagram.",
        },
        {
          kind: "compare",
          body: "A senior engineer starts with constraints: read/write ratio, peak traffic, latency targets, and budget. They don't ask 'which database should I use?' until they know the shape of the problem.",
        },
        {
          kind: "recap",
          points: [
            "System design is choices and trade-offs, not a catalog of components",
            "Start with requirements and constraints, not architecture",
            "The same problem has many valid designs — pick the one that fits your constraints",
          ],
        },
      ],
    },
    {
      slug: "performance-vs-scalability",
      title: "Performance vs scalability",
      attribution: "Synthesised from donnemartin/system-design-primer",
      sections: [
        {
          kind: "scenario",
          title: "Slow, or can't grow?",
          body: "A user complains the feed loads slowly. Another team says 'we need to handle 10x traffic next month.' These are different problems. Treating them the same way leads to the wrong fix.",
        },
        {
          kind: "concept",
          title: "Know the difference",
          body: "Performance is how fast a single request completes under current load. Scalability is how well the system handles increased load by adding resources. A system can be fast but not scalable, or scalable but sluggish. Good design addresses both.",
        },
        {
          kind: "your_turn",
          prompt: "Think of one fix that improves performance, and one fix that improves scalability. Are they ever the same thing?",
        },
        {
          kind: "compare",
          body: "Adding a cache can improve both in some cases, but generally: indexes help performance; horizontal scaling helps scalability. Be precise about which one you're solving.",
        },
        {
          kind: "recap",
          points: [
            "Performance = speed for a given load",
            "Scalability = ability to handle more load with more resources",
            "Ask which problem you're actually solving before choosing a fix",
          ],
        },
      ],
    },
    {
      slug: "latency-vs-throughput",
      title: "Latency vs throughput vs bandwidth",
      attribution: "Synthesised from donnemartin/system-design-primer and Peter Norvig's latency numbers",
      sections: [
        {
          kind: "scenario",
          title: "Three numbers that keep getting mixed up",
          body: "In interviews and in dashboards, people say 'fast' to mean all three. For our photo app, loading a feed means lots of small requests; loading a photo means one big request. Different metrics matter.",
        },
        {
          kind: "concept",
          title: "Measure the right thing",
          body: "Latency is time to complete one request (ms). Throughput is how many requests per second the system can handle (req/s). Bandwidth is how much data can move per second (MB/s or Mbps). Optimising for one can hurt another. A CDN trades latency for cost; a queue trades latency for throughput stability.",
        },
        {
          kind: "your_turn",
          prompt: "For uploading a 2MB photo, which matters more: latency or bandwidth? For loading 50 thumbnails in a feed, which matters more?",
        },
        {
          kind: "compare",
          body: "Thumbnails need low latency to feel snappy. A large photo upload cares about bandwidth. Real systems care about both, and the p95/p99 latency tells you more than the average ever will.",
        },
        {
          kind: "recap",
          points: [
            "Latency = time per request, throughput = requests per second, bandwidth = data per second",
            "Know which one your feature actually needs",
            "Watch tail latencies (p95/p99), not just averages",
          ],
        },
      ],
    },
  ],
  interviewByte: {
    shape: "Explain the difference between performance and scalability with an example from a product you know.",
    strongAnswer: "Performance is about speed under current load. Scalability is about handling more load by adding resources. For example, adding an index speeds up a slow query (performance), while adding read replicas lets you handle more reads as traffic grows (scalability). Sometimes both improve together, but they're different goals.",
    trap: "Saying 'scalable means fast' — speed and capacity are different. A system can be fast for one user and fall over at 1000, or slow for one user but scale fine horizontally.",
  },
  task: {
    brief: "Design the smallest thing that could serve our photo-sharing app's first 100 users. Make sure it runs cleanly at 100 users with p95 < 50 ms.",
    startGraph: {
      nodes: [
        (() => { const n = defaultNode("client", "client-1", 60, 180); (n as any).label = "Users"; return n; })(),
        (() => { const n = defaultNode("app_server", "app-1", 300, 180); (n as any).label = "Monolith"; (n as any).replicas = 1; return n; })(),
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
        id: "add-db",
        title: "Store the data",
        brief: "A photo app needs to remember users and posts. Add a database.",
        hint: "Look in the Data category of the palette.",
        reveal: "The monolith needs somewhere to persist data. Add a database node and wire it to the app server.",
        check: (g) => {
          const hasDb = g.nodes.some((n) => n.type === "database");
          return { passed: hasDb, progress: hasDb ? "✓ Database added" : "Add a database node" };
        },
      },
      {
        id: "connect-app-db",
        title: "Wire it up",
        brief: "Connect the app server to the database.",
        hint: "Click the app server port and drag to the database.",
        reveal: "Requests flow: client → app → database. Add an edge from app_server to database.",
        check: (g) => {
          const appNodes = g.nodes.filter((n) => n.type === "app_server");
          if (appNodes.length === 0) return { passed: false, progress: "No app server yet" };
          const connected = appNodes.some((a) => g.edges.some((e) => e.from === a.id && g.nodes.find((n) => n.id === e.to)?.type === "database"));
          return { passed: connected, progress: connected ? "✓ App connected to database" : "Connect app server to database" };
        },
      },
    ],
    passCriteria: [
      {
        id: "latency-ok",
        label: "p95 < 50 ms at 100 users",
        required: true,
        explain: "For a small app serving 100 users, latency should be low. If it's high, something is misconfigured.",
        assert: (r) => r.valid && r.latency.p95 < 50,
      },
      {
        id: "no-errors",
        label: "Error rate = 0%",
        required: true,
        explain: "A working design should have no errors at this scale.",
        assert: (r) => r.valid && r.errorRate === 0,
      },
    ],
  },
  recap: [
    "System design is about trade-offs, not collecting components",
    "Performance vs scalability are different problems",
    "Know latency, throughput, and bandwidth separately",
    "Start with constraints before drawing boxes",
  ],
  attribution: "Synthesised from donnemartin/system-design-primer (375k★), algomaster.io, and KodeKloud System Design For Beginners",
};

export default module;
