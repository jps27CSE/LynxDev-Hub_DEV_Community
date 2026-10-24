import type { SdModule } from "../types";
import { defaultNode } from "@/lib/system-design/nodes";

const module: SdModule = {
  slug: "requirements",
  order: 2,
  part: 0,
  partTitle: "Mindset",
  title: "Requirements",
  description:
    "Learn to elicit functional and non-functional requirements. Nobody hands you a complete list — you have to ask the right questions.",
  story:
    "Our photo-sharing app from module 1 is working for 100 users. Before adding load balancers or caches, we need to be precise about what 'good' means. Is it about posting photos? About the feed? About search? And what about latency, availability, or scale? The answers drive every design decision.",
  lessons: [
    {
      slug: "functional-vs-nonfunctional",
      title: "Functional vs non-functional requirements",
      attribution: "Synthesised from donnemartin/system-design-primer",
      sections: [
        {
          kind: "scenario",
          title: "What do we actually need?",
          body: "The team says 'make it scalable' but can't say how many users or what actions matter most. We need to split requirements into what the system must DO (functional) and how well it must DO it (non-functional).",
        },
        {
          kind: "concept",
          title: "Two categories",
          body: "Functional requirements are features: users can post photos, follow others, view a feed. Non-functional requirements are qualities: the feed loads in under 200ms, the system stays up during peak hours, handles 10k concurrent users. Both matter, and NFRs often drive the architecture more than features do.",
        },
        {
          kind: "diagram",
          caption: "Our current design to reason about",
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
          prompt: "For our photo-sharing app, list 3 functional requirements and 3 non-functional requirements. Be specific enough that you'd know if you met them.",
        },
        {
          kind: "compare",
          body: "Good NFRs are measurable: 'feed loads in under 200ms for p95' beats 'fast'. Good FRs are testable: 'user can upload a photo' beats 'good UX'.",
        },
        {
          kind: "recap",
          points: [
            "FRs = what the system does, NFRs = how well it does it",
            "NFRs often drive architectural choices",
            "Make requirements measurable and testable",
          ],
        },
      ],
    },
    {
      slug: "eliciting-requirements",
      title: "Eliciting requirements",
      attribution: "Synthesised from donnemartin/system-design-primer and KodeKloud System Design For Beginners",
      sections: [
        {
          kind: "scenario",
          title: "Nobody hands you a list",
          body: "In an interview or at work, you'll rarely get a complete spec. You need to ask clarifying questions to uncover scope, scale, and constraints.",
        },
        {
          kind: "concept",
          title: "Ask before you design",
          body: "Start by clarifying: Who are the users? What's the core use case? How many users now and expected? Read/write ratio? Any geographic constraints? Mobile or web? Do we need real-time features? The answers change everything.",
        },
        {
          kind: "your_turn",
          prompt: "You're asked to design a photo-sharing app. Write down 5 questions you'd ask before drawing any boxes. Prioritize them.",
        },
        {
          kind: "compare",
          body: "A senior engineer spends the first few minutes asking questions, not drawing. 'DAU, read/write ratio, media size, latency targets' - these five answers will guide 90% of your initial decisions.",
        },
        {
          kind: "recap",
          points: [
            "Clarify scope before architecting",
            "Focus on core features first, nice-to-haves later",
            "Ask about scale, users, and constraints",
          ],
        },
      ],
    },
  ],
  interviewByte: {
    shape: "How would you gather requirements for designing Instagram? Walk through your approach.",
    strongAnswer: "I'd start by clarifying scope - is it the full app or specific features? I'd ask about scale (DAU, photos uploaded), read/write ratio, media storage needs, latency expectations, and whether real-time features are needed. Then I'd define core features (upload, feed, follow) as FRs and qualities like availability/latency as NFRs, making them measurable.",
    trap: "Jumping straight to 'I'll use Redis, Kafka, microservices' without asking any questions. Requirements come first, then design follows from constraints.",
  },
  task: {
    brief: "Fill in the constraints panel for our photo-sharing app. Identify functional requirements, non-functional requirements, and key constraints that would drive your design decisions.",
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
        id: "review-fr",
        title: "List functional requirements",
        brief: "Identify what features the system must support.",
        hint: "Think about core user actions like posting, viewing, following.",
        reveal: "Core FRs: upload photos, view feed, follow users, like/comment on posts.",
        check: (g) => ({ passed: g.nodes.length >= 2, progress: "✓ Considered functional requirements" }),
      },
      {
        id: "review-nfr",
        title: "List non-functional requirements",
        brief: "Identify how well the system must perform.",
        hint: "Consider latency, availability, scalability, and consistency.",
        reveal: "Key NFRs: low latency feed (<200ms), high availability, handle growing traffic, durable photo storage.",
        check: (g) => ({ passed: g.edges.length >= 1, progress: "✓ Considered non-functional requirements" }),
      },
    ],
    passCriteria: [
      {
        id: "complete-review",
        label: "Requirements review complete",
        required: true,
        explain: "You need to think through both functional and non-functional requirements before designing.",
        assert: (r) => r.valid,
      },
    ],
  },
  recap: [
    "Separate functional (what) from non-functional (how well) requirements",
    "NFRs often drive architecture more than features do",
    "Ask clarifying questions - nobody hands you a complete spec",
    "Make requirements measurable and testable",
  ],
  attribution: "Synthesised from donnemartin/system-design-primer, algomaster.io, and KodeKloud System Design For Beginners",
};

export default module;
