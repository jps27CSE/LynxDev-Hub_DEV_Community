import type { SdModule } from "../types";
import { defaultNode } from "@/lib/system-design/nodes";

const module: SdModule = {
  slug: "what-is-system-design",
  order: 1,
  part: 0,
  partTitle: "Mindset",
  title: "What is system design?",
  description:
    "Build the right mindset. Learn to think in trade-offs, know the difference between speed and scale, and understand the numbers that matter.",
  story:
    "Imagine you just built a tiny photo-sharing app for your college group. At first, only 100 people use it. You run everything on one laptop/server: your code, your database, everything together. It works perfectly. Now imagine 100,000 people trying to post, like and scroll at the same time. Suddenly the same 'working' design starts to feel slow, then crashes. This is exactly when system design enters the picture. It's not about using fancy tools, it's about making smart choices so your system can handle growth without breaking.",
  lessons: [
    {
      slug: "choices-not-boxes",
      title: "System design is about choices, not boxes",
      attribution: "Synthesised from donnemartin/system-design-primer, algomaster.io and KodeKloud",
      sections: [
        {
          kind: "scenario",
          title: "The moment things change",
          body: "Let's stick to our photo-sharing app. At 100 users, a single app server + database is more than enough. At 10,000 users, opening the feed might start taking a second. At 100,000 users, that same setup could go down during peak hours. The question isn't 'which tool is trending?' The question is 'what problem am I actually solving right now?'",
        },
        {
          kind: "concept",
          title: "In simple words",
          body: "System design is the art of breaking a big, real problem into smaller pieces and deciding how those pieces talk to each other to meet your goals. \n\nThink of it like building a restaurant. For a food stall with 10 customers/hour, one cook can do everything. For a busy restaurant with 500 customers/hour, you need a waiter, cashier, chef, helper, and a way to take orders without chaos. You don't hire 5 chefs on day 1 just because restaurants exist. You scale based on demand and constraints.",
        },
        {
          kind: "concept",
          title: "System design vs writing code",
          body: "Writing code is about making features work correctly. System design is about making the whole system work reliably, efficiently and within your limits when many people use it together. \n\nGood engineers know how to code. Great engineers know when to add complexity and more importantly, when NOT to.",
        },
        {
          kind: "diagram",
          caption: "Our starting point for the photo-sharing app (100 users)",
          graph: {
            nodes: [
              (() => { const n = defaultNode("client", "client-1", 40, 200); (n as any).label = "Users (Mobile/Web)"; return n; })(),
              (() => { const n = defaultNode("app_server", "app-1", 280, 200); (n as any).label = "Monolith (All logic)"; (n as any).replicas = 1; return n; })(),
              (() => { const n = defaultNode("database", "db-1", 520, 200); (n as any).label = "Relational DB"; return n; })(),
            ] as any,
            edges: [
              { id: "e1", from: "client-1", to: "app-1", label: null, retry: { attempts: 0, backoffMs: 0, jitter: false }, partitioned: false },
              { id: "e2", from: "app-1", to: "db-1", label: null, retry: { attempts: 0, backoffMs: 0, jitter: false }, partitioned: false },
            ],
            scenario: { arrivalRate: 100, writeShare: 0.05, mediaShare: 0, bytesPerMediaRequest: 2_000_000, abusiveShare: 0, latencyJitterMs: 0, cacheColdStart: false, replicaLagMs: 0 },
          },
        },
        {
          kind: "concept",
          title: "Start with constraints, not components",
          body: "A very common beginner mistake is opening a diagram and immediately drawing a Load Balancer, Redis, Kafka etc. Instead, ask: How many users? What's the read/write ratio? Is it read heavy or write heavy? Do users care more about speed or uptime? What's the budget/time we actually have?\n\nYour answer to these questions should decide what you add, not your excitement to use new tools.",
        },
        {
          kind: "your_turn",
          prompt: "Imagine your photo-sharing app goes from 100 to 50,000 users overnight. List at least 3 things you'd worry about BEFORE drawing any new boxes. Be specific.",
        },
        {
          kind: "compare",
          body: "A beginner asks: 'Which technology should I use?'. A senior engineer asks: 'What constraint am I trying to satisfy?'. Focus on the constraint first. The right tool becomes obvious after that.",
        },
        {
          kind: "recap",
          points: [
            "System design = solving for scale, reliability and trade-offs, not memorizing a list of tools",
            "Think in terms of 'choices', not 'must use this component'",
            "Start small. Evolve when you actually hit a real problem",
            "Clarity on constraints > collecting fancy components",
          ],
        },
      ],
    },
    {
      slug: "performance-vs-scalability",
      title: "Performance vs Scalability",
      attribution: "Synthesised from donnemartin/system-design-primer",
      sections: [
        {
          kind: "scenario",
          title: "Two very different complaints",
          body: "User A says: 'The app is taking 4 seconds to load my feed right now'. User B says: 'Last time we got featured, the app crashed for everyone'. These sound similar, but they require completely different fixes.",
        },
        {
          kind: "concept",
          title: "In simple words",
          body: "Performance = How fast is the system for a single user under the load it currently has? \n\nScalability = If we 10x the number of users/requests, can the system keep working by adding more resources (more servers, etc)?\n\nYou can fix 'slow for this user' by making that specific request faster. You fix 'crashes under more users' by making the system able to grow.",
        },
        {
          kind: "concept",
          title: "Relatable example",
          body: "Imagine a single coffee shop counter. If it's slow because the barista is inefficient, that's a performance issue. You can train them or make the menu simpler to fix it. \n\nIf it's taking forever only because there are now 200 people in line at 8 AM everyday, that's a scalability issue. Adding another counter/barista is the right way to handle the growth.",
        },
        {
          kind: "your_turn",
          prompt: "For our photo-sharing app, think of ONE real fix for a performance problem and ONE real fix for a scalability problem. Explain the difference in your own words.",
        },
        {
          kind: "compare",
          body: "Adding an index to your database is usually about performance (faster queries). Adding more app servers behind a load balancer is usually about scalability (handling more traffic). Sometimes a fix helps both, but you must know which one you're targeting.",
        },
        {
          kind: "recap",
          points: [
            "Performance = speed for current load",
            "Scalability = ability to handle more load by growing the system",
            "Don't say 'make it scalable' when you actually mean 'make it faster'",
            "Ask yourself: 'Is this slow for few people, or broken for many people?'",
          ],
        },
      ],
    },
    {
      slug: "latency-vs-throughput-vs-bandwidth",
      title: "Latency, Throughput & Bandwidth",
      attribution: "Synthesised from donnemartin/system-design-primer",
      sections: [
        {
          kind: "scenario",
          title: "Three terms, easily confused",
          body: "In meetings people say 'our app is slow'. But 'slow' could mean: it takes too long to start loading, or it can only serve a few people, or it struggles to transfer large photos. We need to be more precise.",
        },
        {
          kind: "concept",
          title: "Definitions in plain English",
          body: "Latency = Time taken for ONE request to go from client to server and back. Measured in milliseconds (ms). Think: 'How long do I wait?'\n\nThroughput = How many requests the system can handle in a given time. Measured in requests/second (req/s). Think: 'How many people can we serve at the same time?'\n\nBandwidth = How much data can travel in a given time. Measured in MB/s, GB/s or Mbps. Think: 'How much stuff can we push through the pipe?'",
        },
        {
          kind: "concept",
          title: "Everyday analogy",
          body: "Imagine a water pipe. Bandwidth is the width of the pipe (how much water can flow). Latency is how long it takes for the first drop to reach you. Throughput is how many buckets you can fill per minute. A very wide pipe can still have delay, and a low-delay pipe can be narrow.",
        },
        {
          kind: "concept",
          title: "What matters for our photo app",
          body: "Loading 20 small thumbnails in the feed? You care a LOT about latency. Users want it to feel instant.\n\nUploading/downloading a 2MB photo? Bandwidth becomes more important. \n\nHandling millions of feed requests during a viral moment? Throughput is your concern.\n\nAlso, NEVER look only at average. Look at p50, p95, p99. p99 tells you about the worst experience your users actually feel.",
        },
        {
          kind: "your_turn",
          prompt: "For each action, pick ONE that matters most and explain why: (1) Liking a post (2) Uploading a photo (3) Scrolling the feed with 30 thumbnails",
        },
        {
          kind: "compare",
          body: "You can have high throughput but terrible p99 latency (some users wait way too long). A good system design aims for both: reasonable latency AND enough throughput for your expected peak.",
        },
        {
          kind: "recap",
          points: [
            "Latency = time per request (ms). Focus on p95/p99, not just average",
            "Throughput = requests per second (req/s)",
            "Bandwidth = data per second (MB/s)",
            "Different features optimize for different things",
            "Know which one you're trying to improve",
          ],
        },
      ],
    },
  ],
  interviewByte: {
    shape: "Explain the difference between performance and scalability with a real example.",
    strongAnswer: "Performance is about speed under current load. Scalability is about handling increased load by adding resources. For example, adding a database index can make a slow feed query faster (performance). If our app suddenly goes from 1,000 to 50,000 users and the monolith can't keep up, we'd add more app servers behind a load balancer to scale horizontally (scalability). They're related, but solving one doesn't automatically solve the other.",
    trap: "Saying 'scalable means fast'. A system can scale to handle more users but still feel sluggish for each user. Or be very fast for 100 users and completely fall over at 10,000.",
  },
  task: {
    brief: "Design the smallest thing that can serve our photo-sharing app's first 100 users. Keep it simple. Your goal is to make it work correctly with good enough latency, not to over-engineer.",
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
        (() => { const n = defaultNode("database", "db-1", 500, 180); (n as any).label = "Database"; return n; })(),
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
        title: "Give it a place to store data",
        brief: "Users, posts, likes need to be persisted. Add a database to your design.",
        hint: "Look at the Data section in the palette.",
        reveal: "For user accounts, posts, follows and likes we need persistent storage. Add a Database node.",
        check: (g) => {
          const hasDb = g.nodes.some((n) => n.type === "database");
          return { passed: hasDb, progress: hasDb ? "✓ Database added" : "Add a database node" };
        },
      },
      {
        id: "wire-app-db",
        title: "Connect app to database",
        brief: "The monolith needs to read/write from the database. Draw the connection.",
        hint: "Drag an edge from the App Server to the Database.",
        reveal: "Flow is simple: Client -> App Server -> Database. Add an edge from app_server to database.",
        check: (g) => {
          const appNodes = g.nodes.filter((n) => n.type === "app_server");
          if (appNodes.length === 0) return { passed: false, progress: "Add an app server first" };
          const connected = appNodes.some((a) => g.edges.some((e) => e.from === a.id && g.nodes.find((n) => n.id === e.to)?.type === "database"));
          return { passed: connected, progress: connected ? "✓ App connected to database" : "Connect app server to database" };
        },
      },
    ],
    passCriteria: [
      {
        id: "latency-ok",
        label: "p95 < 50ms at 100 users",
        required: true,
        explain: "At this tiny scale, the system should feel snappy. Anything higher usually means something is off.",
        assert: (r) => r.valid && r.latency.p95 < 50,
      },
      {
        id: "no-errors",
        label: "Error rate = 0%",
        required: true,
        explain: "A correct, minimal design for 100 users should have no failed requests.",
        assert: (r) => r.valid && r.errorRate === 0,
      },
    ],
  },
  recap: [
    "System design is about trade-offs and choices, not collecting tools",
    "Performance = speed now. Scalability = grow with more users",
    "Know the difference between latency, throughput and bandwidth",
    "Look at p95/p99, not just averages",
    "Start simple. Add complexity only when there's a real need",
  ],
  attribution: "Synthesised from donnemartin/system-design-primer (375k★), algomaster.io and KodeKloud System Design For Beginners",
};

export default module;
