import type { SdModule } from "../types";
import { defaultNode } from "@/lib/system-design/nodes";

const module: SdModule = {
  slug: "constraints-and-design-process",
  order: 3,
  part: 0,
  partTitle: "Mindset",
  title: "Constraints & the design process",
  description:
    "Learn a structured approach to system design. Every choice has a cost, and you need to communicate your design clearly.",
  story:
    "We know our functional and non-functional requirements for the photo-sharing app. Now we need a repeatable process to design it. In interviews and real work, structure matters as much as technical knowledge. Let's learn how to think and communicate systematically.",
  lessons: [
    {
      slug: "the-45-min-structure",
      title: "The 45-minute design structure",
      attribution: "Synthesised from donnemartin/system-design-primer and KodeKloud System Design For Beginners",
      sections: [
        {
          kind: "scenario",
          title: "Time is limited",
          body: "In a system design interview or a design review, you have limited time. Without structure, you'll jump to drawing boxes and forget to clarify requirements or discuss trade-offs.",
        },
        {
          kind: "concept",
          title: "A proven structure",
          body: "A solid approach: (1) Clarify requirements and constraints (3-5 min). (2) Estimate scale/back-of-envelope if needed (2-5 min). (3) Design high-level architecture (10-15 min). (4) Deep dive into critical components (10-15 min). (5) Wrap up with bottlenecks, scaling, and trade-offs (3-5 min). Stay flexible, but have a plan.",
        },
        {
          kind: "diagram",
          caption: "Our growing design - monolith with database",
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
          prompt: "Practice the structure. For a URL shortener, what would you do in the first 5 minutes? Write down your plan.",
        },
        {
          kind: "compare",
          body: "Strong candidates spend time on requirements even if they seem obvious. Weak candidates jump straight to 'I'll use microservices and Redis' without clarifying scale or use cases.",
        },
        {
          kind: "recap",
          points: [
            "Structure prevents getting lost in the weeds",
            "Clarify first, estimate second, design third",
            "Always leave time for trade-offs and bottlenecks",
          ],
        },
      ],
    },
    {
      slug: "every-choice-has-a-cost",
      title: "Every choice gives something up",
      attribution: "Synthesised from System Design Interview books and real engineering practice",
      sections: [
        {
          kind: "scenario",
          title: "There are no free lunches",
          body: "You can have consistency, availability, and partition tolerance - but pick two (CAP theorem). You can optimize for speed or cost. You can have strong consistency or low latency. Trade-offs are everywhere.",
        },
        {
          kind: "concept",
          title: "Think in trade-offs",
          body: "When you propose adding a cache, discuss the trade-off: faster reads, but now you need cache invalidation and risk serving stale data. When you add read replicas, discuss: more read capacity, but replication lag means reads might be slightly stale. A good designer calls out trade-offs explicitly.",
        },
        {
          kind: "your_turn",
          prompt: "You decide to add a CDN for photos. What are the pros and cons? What trade-offs are you making?",
        },
        {
          kind: "compare",
          body: "Saying 'I would add X' is not enough. Saying 'I would add X because of Y, accepting Z trade-off' shows maturity. The interviewer wants to see you think critically.",
        },
        {
          kind: "recap",
          points: [
            "Every architectural choice involves trade-offs",
            "Be explicit about what you gain and what you give up",
            "No solution is perfect - pick what fits your constraints",
          ],
        },
      ],
    },
    {
      slug: "anti-patterns",
      title: "Common anti-patterns to avoid",
      attribution: "Synthesised from real interview feedback and engineering pitfalls",
      sections: [
        {
          kind: "scenario",
          title: "Learn from mistakes",
          body: "Some patterns look good on the surface but cause problems. Knowing them helps you avoid them and explain why you chose differently.",
        },
        {
          kind: "concept",
          title: "Watch out for these",
          body: "Over-engineering (microservices on day 1), premature optimization, ignoring constraints, designing for Google-scale when you need startup-scale, not considering failure modes, and jumping to solutions without requirements. Keep it simple first, then scale as needed.",
        },
        {
          kind: "your_turn",
          prompt: "Our app has 100 users. Would you recommend microservices? Why or why not?",
        },
        {
          kind: "compare",
          body: "Start with a monolith. It's simpler to develop, deploy, and debug. You can always split later when you have clear boundaries and real scaling needs. YAGNI applies to architecture too.",
        },
        {
          kind: "recap",
          points: [
            "Start simple, scale when needed",
            "Don't over-engineer for hypothetical future scale",
            "Always justify your choices with constraints",
          ],
        },
      ],
    },
  ],
  interviewByte: {
    shape: "Walk me through your approach to designing a photo-sharing app, step by step.",
    strongAnswer: "I'd start by clarifying requirements - core features and scale (DAU, storage needs). Then estimate numbers like requests per second and storage. For a first design, I'd start simple with a monolith, app servers, and database. I'd identify bottlenecks - media storage and feed queries would be concerns at scale. Then I'd discuss scaling: CDN for photos, caching, read replicas. Throughout, I'd call out trade-offs like consistency vs availability.",
    trap: "Diving straight into drawing a complex distributed system without walking through requirements, estimates, or trade-offs. Structure and communication matter as much as the final design.",
  },
  task: {
    brief: "Narrate our current design in 5 boxes, as if in an interview. Cover requirements, high-level design, deep dive, trade-offs, and bottlenecks/scaling plan.",
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
        id: "structure-outline",
        title: "Outline the 5-step approach",
        brief: "Plan your narrative structure.",
        hint: "Think about requirements, design, deep dive, trade-offs, wrap-up.",
        reveal: "Cover: (1) Requirements & constraints, (2) High-level design, (3) Deep dive, (4) Trade-offs, (5) Bottlenecks & scaling.",
        check: (g) => ({ passed: g.nodes.length >= 2, progress: "✓ Structure planned" }),
      },
      {
        id: "tradeoffs",
        title: "Call out trade-offs",
        brief: "Identify what you're giving up.",
        hint: "Every choice has a cost.",
        reveal: "Monolith is simple but harder to scale independently. Single DB is simple but is a bottleneck.",
        check: (g) => ({ passed: g.edges.length >= 1, progress: "✓ Trade-offs identified" }),
      },
    ],
    passCriteria: [
      {
        id: "complete-narrative",
        label: "Narrative structure complete",
        required: true,
        explain: "You need to structure your design discussion clearly with trade-offs.",
        assert: (r) => r.valid,
      },
    ],
  },
  recap: [
    "Use a structured approach: clarify, estimate, design, deep dive, wrap up",
    "Every choice has trade-offs - call them out explicitly",
    "Start simple (monolith) and scale when needed",
    "Communication is as important as technical design",
  ],
  attribution: "Synthesised from donnemartin/system-design-primer, algomaster.io, and KodeKloud System Design For Beginners",
};

export default module;
