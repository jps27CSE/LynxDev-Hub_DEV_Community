import type { SdModule } from "../types";
import { defaultNode } from "@/lib/system-design/nodes";

const module: SdModule = {
  slug: "load-balancers-and-stateless-services",
  order: 6,
  part: 1,
  partTitle: "Scaling up",
  kind: "sim",
  title: "Load Balancers & Stateless Services",
  description:
    "Learn why vertical scaling hits a wall, how horizontal scaling works, and why making services stateless is the key to spreading traffic.",
  story:
    "Our photo-sharing app is growing. At around 500-1000 concurrent users, our single monolith starts struggling. Response times creep up, and one server simply doesn't have enough CPU/RAM. We need to scale out. But just spinning up another copy isn't enough - we need a way to route traffic and make sure our app servers don't rely on local memory.",
  lessons: [
    {
      slug: "vertical-vs-horizontal",
      title: "Vertical vs Horizontal Scaling",
      attribution:
        "Synthesised from donnemartin/system-design-primer, algomaster.io",
      sections: [
        {
          kind: "scenario",
          title: "Hitting the ceiling",
          body: "You have one server. Traffic grows. Your first instinct: upgrade it to a bigger machine with more CPU and RAM. That works for a while. But eventually you hit the biggest instance your cloud provider offers, or it becomes ridiculously expensive.",
        },
        {
          kind: "concept",
          title: "In simple words",
          body: "Vertical Scaling (Scale Up): Make ONE machine more powerful. Like buying a bigger car to fit more people.\n\nHorizontal Scaling (Scale Out): Add MORE machines. Like calling multiple taxis instead of trying to squeeze everyone into one limo.\n\nVertical is easier to start with. Horizontal is more powerful long-term and is what most large systems do.",
        },
        {
          kind: "concept",
          title: "Trade-offs",
          body: "Vertical Scaling:\n+ Simple, no major code changes usually\n+ Less complex networking\n- Has a hard limit (max machine size)\n- Single point of failure (if that one big server dies, everything goes down)\n- Expensive at the top end\n\nHorizontal Scaling:\n+ Can scale almost infinitely by adding more servers\n+ More fault tolerant (if one server dies, others handle traffic)\n+ Often cheaper at large scale\n- More complex (need load balancer, networking, shared state)\n- Requires your app to be designed for it",
        },
        {
          kind: "your_turn",
          prompt:
            "For our photo app at 10,000 users, would you rather scale vertically or horizontally first? Why? What are you giving up?",
        },
        {
          kind: "compare",
          body: "Start vertical if it's trivial and you're not there yet. Move to horizontal when you need high availability or have hit vertical limits. Most real systems end up doing horizontal scaling.",
        },
        {
          kind: "video",
          videoId: "nFbOxUJJeFo",
          title:
            "System Design in Bangla | Vertical vs Horizontal Scaling, Load Balancers & DNS Explained",
          caption:
            "Bangla walkthrough of vertical vs horizontal scaling, load balancers, and DNS.",
        },
        {
          kind: "concept",
          title: "Go deeper (free reads)",
          body: "Free reading on scaling and load balancing:\n\n- [Intro to architecting systems for scale (lethain.com)](http://lethain.com/introduction-to-architecting-systems-for-scale) — classic essay.\n- [Scalability in System Design — System Design Handbook](https://www.systemdesignhandbook.com/guides/scalability-in-system-design) — horizontal vs vertical scaling.\n- [donnemartin/system-design-primer — Load balancing](https://github.com/donnemartin/system-design-primer#load-balancing) — primer section.\n- [System Design: Performance, Scalability, Latency, and Throughput (DEV Community)](https://dev.to/decoders_lord/system-design-performance-scalability-latency-and-throughput-652) — beginner-friendly.",
        },
        {
          kind: "recap",
          points: [
            "Scale up = bigger machine. Scale out = more machines",
            "Vertical hits a ceiling, horizontal is more resilient",
            "Horizontal needs load balancing and stateless design",
            "Think about trade-offs, not 'which is better'",
          ],
        },
      ],
    },
    {
      slug: "load-balancing",
      title: "Load Balancers: Spreading the Traffic",
      attribution: "Synthesised from donnemartin/system-design-primer",
      sections: [
        {
          kind: "scenario",
          title: "Too much for one server",
          body: "We now have 3 identical app servers. If users connect directly to any of them, how do we decide? And what if one is down? We need something in front to distribute traffic intelligently.",
        },
        {
          kind: "concept",
          title: "What is a Load Balancer?",
          body: "A Load Balancer (LB) sits between clients and your servers. It receives all incoming requests and routes them to one of the healthy backend servers.\n\nThink of it like a host at a restaurant. When you walk in, they seat you at the table with the shortest wait, or just round-robin. They also notice if a section is closed and don't send people there.",
        },
        {
          kind: "concept",
          title: "Load Balancing Algorithms",
          body: "Round Robin (RR): Go server 1, server 2, server 3, repeat. Simple and fair.\n\nLeast Connections: Send to the server with fewest active connections. Great if requests take different amounts of time.\n\nIP Hash: Based on client's IP, always goes to same server. Useful in some cases but less flexible.\n\nFor most beginner cases, Round Robin is perfectly fine.",
        },
        {
          kind: "concept",
          title: "Health Checks",
          body: "A good load balancer constantly checks if servers are healthy. If server 2 crashes, it stops sending traffic there until it's back up. This gives us high availability - users don't even notice.",
        },
        {
          kind: "diagram",
          caption: "Load balancer distributing traffic across app servers",
          graph: {
            nodes: [
              (() => {
                const n = defaultNode("client", "client-1", 40, 200);
                (n as any).label = "Users";
                return n;
              })(),
              (() => {
                const n = defaultNode("load_balancer", "lb-1", 220, 200);
                (n as any).label = "Load Balancer";
                (n as any).algorithm = "rr";
                (n as any).rateLimitPerMin = null;
                return n;
              })(),
              (() => {
                const n = defaultNode("app_server", "app-1", 440, 120);
                (n as any).label = "App 1";
                (n as any).replicas = 1;
                return n;
              })(),
              (() => {
                const n = defaultNode("app_server", "app-2", 440, 200);
                (n as any).label = "App 2";
                (n as any).replicas = 1;
                return n;
              })(),
              (() => {
                const n = defaultNode("app_server", "app-3", 440, 280);
                (n as any).label = "App 3";
                (n as any).replicas = 1;
                return n;
              })(),
              (() => {
                const n = defaultNode("database", "db-1", 660, 200);
                (n as any).label = "DB";
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
                from: "lb-1",
                to: "app-2",
                label: null,
                retry: { attempts: 0, backoffMs: 0, jitter: false },
                partitioned: false,
              },
              {
                id: "e4",
                from: "lb-1",
                to: "app-3",
                label: null,
                retry: { attempts: 0, backoffMs: 0, jitter: false },
                partitioned: false,
              },
              {
                id: "e5",
                from: "app-1",
                to: "db-1",
                label: null,
                retry: { attempts: 0, backoffMs: 0, jitter: false },
                partitioned: false,
              },
              {
                id: "e6",
                from: "app-2",
                to: "db-1",
                label: null,
                retry: { attempts: 0, backoffMs: 0, jitter: false },
                partitioned: false,
              },
              {
                id: "e7",
                from: "app-3",
                to: "db-1",
                label: null,
                retry: { attempts: 0, backoffMs: 0, jitter: false },
                partitioned: false,
              },
            ],
            scenario: {
              arrivalRate: 1000,
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
            "Why do we need a load balancer if we have multiple servers? What happens if we don't have health checks?",
        },
        {
          kind: "compare",
          body: "Load balancers can be hardware or software. In cloud, you usually use managed ones (AWS ALB/NLB). The key idea is the same regardless of vendor.",
        },
        {
          kind: "recap",
          points: [
            "Load balancer distributes traffic across healthy servers",
            "Enables horizontal scaling and high availability",
            "Round robin is simple, least connections is smarter",
            "Health checks prevent sending traffic to broken servers",
          ],
        },
      ],
    },
    {
      slug: "stateless-services",
      title: "Stateless Services: The Secret to Easy Scaling",
      attribution: "Synthesised from donnemartin/system-design-primer",
      sections: [
        {
          kind: "scenario",
          title: "The sticky session problem",
          body: "Imagine user logs in. Server 1 stores their session in its local memory. Next request goes to Server 2 via load balancer. Server 2 doesn't know about that session - user gets logged out! This is a nightmare for scaling.",
        },
        {
          kind: "concept",
          title: "Stateful vs Stateless",
          body: "Stateful: The server REMEMBERS something about the client between requests (like session in memory). If you go to different server, you lose that context.\n\nStateless: The server remembers NOTHING about previous requests. Every request must contain all info needed to process it (like a JWT token with user info). Any server can handle any request.",
        },
        {
          kind: "concept",
          title: "How to make it stateless",
          body: "Store sessions outside the app server. Put them in a shared store like Redis. Or better, use JWT tokens - the token itself contains user info and is verified by any server.\n\nFor our photo app: Don't save 'logged in user' in server memory. Put session in Redis, or switch to JWT. That way Server 1,2, or 3 can all handle your request.",
        },
        {
          kind: "your_turn",
          prompt:
            "Why does making services stateless make horizontal scaling so much easier? Give a concrete example.",
        },
        {
          kind: "compare",
          body: "You CAN do sticky sessions (route same user to same server), but it's a band-aid. It breaks when that server dies, makes scaling harder, and defeats the purpose of load balancing. True horizontal scaling requires stateless services.",
        },
        {
          kind: "recap",
          points: [
            "Stateless = any server can handle any request",
            "Move sessions to shared store (Redis) or use JWT",
            "Avoid storing user-specific data in local server memory",
            "Stateless + load balancer = easy to add/remove servers",
          ],
        },
      ],
    },
  ],
  interviewByte: {
    shape:
      "Why would you put a load balancer in front of multiple app servers? What problem does it solve?",
    strongAnswer:
      "A load balancer distributes incoming traffic across multiple healthy app servers. This enables horizontal scaling - we can handle more users by adding servers. It also gives us high availability because if one server fails, the load balancer routes traffic to others. For this to work well, our app servers need to be stateless so any request can go to any server. We'd typically use round-robin or least-connections and health checks to route only to healthy instances.",
    trap: "Saying 'to make it faster' without mentioning scaling/availability. Or forgetting that statelessness is required for true horizontal scaling.",
  },
  task: {
    brief:
      "Our monolith is struggling at 1000 users. Scale it to survive 20,000 users. Use a load balancer and multiple stateless app servers. Connect everything properly.",
    startGraph: {
      nodes: [
        (() => {
          const n = defaultNode("client", "client-1", 40, 200);
          (n as any).label = "Users";
          return n;
        })(),
        (() => {
          const n = defaultNode("app_server", "app-1", 260, 200);
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
        arrivalRate: 20000,
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
          const n = defaultNode("load_balancer", "lb-1", 220, 200);
          (n as any).label = "Load Balancer";
          (n as any).algorithm = "rr";
          (n as any).rateLimitPerMin = null;
          return n;
        })(),
        (() => {
          const n = defaultNode("app_server", "app-1", 420, 120);
          (n as any).label = "App 1";
          (n as any).replicas = 1;
          return n;
        })(),
        (() => {
          const n = defaultNode("app_server", "app-2", 420, 200);
          (n as any).label = "App 2";
          (n as any).replicas = 1;
          return n;
        })(),
        (() => {
          const n = defaultNode("app_server", "app-3", 420, 280);
          (n as any).label = "App 3";
          (n as any).replicas = 1;
          return n;
        })(),
        (() => {
          const n = defaultNode("database", "db-1", 640, 200);
          (n as any).label = "DB";
          (n as any).readReplicas = 8;
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
          from: "lb-1",
          to: "app-2",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e4",
          from: "lb-1",
          to: "app-3",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e5",
          from: "app-1",
          to: "db-1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e6",
          from: "app-2",
          to: "db-1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e7",
          from: "app-3",
          to: "db-1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
      ],
      scenario: {
        arrivalRate: 20000,
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
        id: "add-lb",
        title: "Add a load balancer",
        brief: "Put something in front to distribute traffic.",
        hint: "Look in Traffic category.",
        reveal: "Add a Load Balancer between clients and app servers.",
        check: (g) => {
          const hasLb = g.nodes.some((n) => n.type === "load_balancer");
          return {
            passed: hasLb,
            progress: hasLb ? "✓ Load balancer added" : "Add a load balancer",
          };
        },
      },
      {
        id: "scale-apps",
        title: "Scale to multiple app servers",
        brief: "Add at least 2 more app servers.",
        hint: "You need enough capacity for 20k users.",
        reveal: "Add 2-3 app server instances behind the load balancer.",
        check: (g) => {
          const apps = g.nodes.filter((n) => n.type === "app_server");
          const hasLb = g.nodes.some((n) => n.type === "load_balancer");
          if (apps.length < 3 || !hasLb)
            return {
              passed: false,
              progress: "Need load balancer + at least 3 app servers",
            };
          const lbId = g.nodes.find((n) => n.type === "load_balancer")?.id;
          const lbConnected = g.edges.some(
            (e) => e.from === lbId && apps.some((a) => a.id === e.to),
          );
          return {
            passed: lbConnected,
            progress: lbConnected
              ? "✓ Traffic routed through LB"
              : "Connect load balancer to app servers",
          };
        },
      },
    ],
    passCriteria: [
      {
        id: "survive-20k",
        label: "Handle traffic with horizontal scaling",
        required: true,
        explain:
          "With horizontal scaling and load balancing, we should handle the load.",
        assert: (r) => r.valid,
      },
    ],
  },
  recap: [
    "Vertical = bigger machine, Horizontal = more machines",
    "Load balancer spreads traffic and provides high availability",
    "Services must be stateless to scale horizontally",
    "Move sessions to Redis or use JWT",
    "Health checks keep traffic away from broken servers",
  ],
  attribution:
    "Synthesised from donnemartin/system-design-primer, algomaster.io and KodeKloud System Design For Beginners",
};

export default module;
