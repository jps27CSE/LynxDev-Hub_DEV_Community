import type { SdModule } from "../types";
import { defaultNode } from "@/lib/system-design/nodes";

const module: SdModule = {
  slug: "constraints-and-design-process",
  order: 3,
  part: 0,
  partTitle: "Mindset",
  kind: "sim",
  title: "Constraints & the Design Process",
  description:
    "A repeatable way to approach any system design. Learn to think out loud, spot trade-offs, and avoid common traps.",
  story:
    "We know what to build (requirements). Now we need a plan for HOW to approach designing it. The biggest difference between a confused answer and a solid one is structure. Good designers don't just draw boxes, they walk through their thinking clearly and justify every major choice.",
  lessons: [
    {
      slug: "the-45-min-structure",
      title: "A Practical 45-Minute Approach",
      attribution:
        "Synthesised from donnemartin/system-design-primer and KodeKloud",
      sections: [
        {
          kind: "scenario",
          title: "Structure beats speed",
          body: "If you jump straight to 'I'll use microservices + Redis + Kafka' in the first minute, you'll almost certainly miss things. A simple structure keeps you on track and shows the interviewer you know how to think.",
        },
        {
          kind: "concept",
          title: "Step by step breakdown",
          body: "1) Clarify requirements (3-5 min)\n- Ask questions, confirm scope, list FR/NFR, state assumptions\n\n2) Back-of-envelope estimation (2-5 min)\n- Rough numbers: DAU, QPS, storage, bandwidth. Just enough to guide decisions\n\n3) High-level design (10-15 min)\n- Draw core components: clients, app servers, DB. Keep minimal first\n\n4) Deep dive (10-15 min)\n- Pick 1-2 critical parts (feed generation, photo upload) and go deeper. Explain data model, APIs, flows\n\n5) Wrap up (3-5 min)\n- Talk about bottlenecks, scaling ideas, trade-offs, and what you'd improve next",
        },
        {
          kind: "concept",
          title: "Think out loud",
          body: "Don't silently draw. Narrate your thoughts. Say 'For a read-heavy feed, I'll need to think about...'. Say 'One option is X, but trade-off is Y'. This shows your reasoning even if your final design isn't perfect.",
        },
        {
          kind: "diagram",
          caption: "Keep it minimal to start",
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
            "Take 'URL Shortener' and plan your first 10 minutes using this structure. Write what you'd say for each step.",
        },
        {
          kind: "compare",
          body: "The goal isn't to fill every minute perfectly. The goal is to show a logical flow. If you run short on time, it's fine to say 'I'd go deeper here if we had more time' and mention what you'd explore.",
        },
        {
          kind: "recap",
          points: [
            "Structure gives you confidence and clarity",
            "Clarify -> Estimate -> High-level -> Deep dive -> Wrap up",
            "Think out loud, state assumptions",
            "It's okay to go simple first",
          ],
        },
      ],
    },
    {
      slug: "tradeoffs",
      title: "Every Choice Has a Cost",
      attribution: "Synthesised from real system design practice",
      sections: [
        {
          kind: "scenario",
          title: "No perfect solution",
          body: "If someone says 'This design is perfect', they're wrong. Every decision improves something at the cost of something else. Your job is to pick the right trade-off for your constraints.",
        },
        {
          kind: "concept",
          title: "Examples of trade-offs",
          body: "Add a cache? Gain: much faster reads. Lose: complexity, risk of stale data, need cache invalidation.\n\nUse read replicas? Gain: handle more reads, better read performance. Lose: replication lag (reads might be slightly outdated), more moving parts.\n\nGo with SQL? Gain: ACID, strong consistency, easy relationships. Lose: harder to horizontally scale in some cases.\n\nGo with NoSQL? Gain: scales well horizontally, flexible schema. Lose: weaker consistency in many setups, more complex queries.",
        },
        {
          kind: "concept",
          title: "How to talk about trade-offs",
          body: "Bad: 'I'll add Redis'.\n\nGood: 'I'll add Redis to cache the feed because it's read-heavy and we need low latency. The trade-off is I'll need to handle cache invalidation when a user posts, or accept slight staleness.'\n\nSee the difference? You're explaining reasoning + cost.",
        },
        {
          kind: "your_turn",
          prompt:
            "Pick ANY two components you'd consider adding to our photo app. For each, list 1 benefit and 1 trade-off.",
        },
        {
          kind: "compare",
          body: "Strong answers explicitly say 'I'm choosing X over Y because...'. They also mention downsides unprompted. That shows maturity and self-awareness.",
        },
        {
          kind: "recap",
          points: [
            "There are no silver bullets in system design",
            "Always say what you gain AND what you lose",
            "Justify choices based on your stated requirements",
            "Trade-offs show depth of understanding",
          ],
        },
      ],
    },
    {
      slug: "anti-patterns",
      title: "Common Mistakes to Avoid",
      attribution: "Synthesised from interview feedback",
      sections: [
        {
          kind: "scenario",
          title: "Learn from common traps",
          body: "Many beginners make the same mistakes. Knowing them helps you avoid them.",
        },
        {
          kind: "concept",
          title: "Watch out for these",
          body: "Over-engineering: Using Kubernetes, message queues, microservices for a 100-user app. Start simple.\n\nDesigning for Google-scale: 'What if 1 billion users?' before asking about actual numbers. Design for the numbers given/stated.\n\nSkipping requirements: Jumping to solution immediately.\n\nVague answers: 'It'll be fast' with no explanation.\n\nIgnoring bottlenecks: Drawing the happy path but never talking about what could go wrong.\n\nNot considering media: For photo apps, storing images in DB is usually wrong. They get huge quickly.\n\nSingle point of failure blindness: Not noticing if DB goes down, whole thing breaks.",
        },
        {
          kind: "concept",
          title: "Rule of thumb",
          body: "Start with the simplest design that works. Make it work -> Make it right -> Make it scale. Don't jump to step 3 on day 1.\n\nAlso, YAGNI (You Aren't Gonna Need It). Add complexity only when you have evidence you need it.",
        },
        {
          kind: "your_turn",
          prompt:
            "Our app has 500 users right now. Should we split into microservices? Explain your answer with reasoning.",
        },
        {
          kind: "compare",
          body: "No, not yet. A monolith is easier to build, test, deploy and debug at this scale. Microservices bring benefits at larger scale but add huge operational complexity. If we hit real pain points, we can extract services later. Keep it simple.",
        },
        {
          kind: "recap",
          points: [
            "Start simple, evolve as you grow",
            "Don't over-engineer for imaginary scale",
            "Requirements first, solution second",
            "Think about bottlenecks and single points of failure",
            "Justify everything with constraints",
          ],
        },
      ],
    },
  ],
  interviewByte: {
    shape:
      "Walk me through how you'd approach designing a photo-sharing app from scratch.",
    strongAnswer:
      "I'd start by clarifying requirements - core features, scale (DAU), read/write ratio, media type. I'd state assumptions like 'assuming 100k DAU, read-heavy'. Then I'd do rough estimates for QPS and storage. I'd draw a simple high-level design: clients -> app servers -> database, and think about where photos go. I'd deep dive into feed generation. Throughout, I'd call out trade-offs - for example starting with monolith for simplicity vs microservices. I'd wrap up by mentioning bottlenecks like DB reads, media storage, and how I'd scale: caching, CDN, read replicas. I'd keep it simple first and scale incrementally.",
    trap: "Listing tools without structure. Or designing for billions before clarifying. Show your process, not just your final diagram.",
  },
  task: {
    brief:
      "Narrate our photo-sharing app design in 5 boxes as if you're in an interview: (1) Requirements & assumptions (2) Estimates (3) High-level design (4) Deep dive + trade-offs (5) Bottlenecks & scaling plan. Use the monolith+DB design we have.",
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
        id: "follow-structure",
        title: "Follow the structure",
        brief: "Walk through all 5 steps in order.",
        hint: "Don't skip clarification or wrap-up.",
        reveal:
          "Cover requirements, estimates, high-level, deep dive with trade-offs, bottlenecks and next steps.",
        check: (g) => ({
          passed: g.nodes.length >= 1,
          progress: "✓ Structure in mind",
        }),
      },
      {
        id: "call-tradeoffs",
        title: "Call out trade-offs",
        brief: "Mention at least one trade-off explicitly.",
        hint: "Monolith vs microservices is an easy one.",
        reveal:
          "Monolith is simple and fast to build, but harder to scale individual parts independently.",
        check: (g) => ({
          passed: g.edges.length >= 0,
          progress: "✓ Thinking about trade-offs",
        }),
      },
    ],
    passCriteria: [
      {
        id: "narrative-complete",
        label: "Clear structured narrative",
        required: true,
        explain:
          "Show you can communicate your design logically with reasoning.",
        assert: (r) => r.valid,
      },
    ],
  },
  recap: [
    "Follow a structure: Clarify -> Estimate -> High-level -> Deep dive -> Wrap up",
    "Think out loud and state assumptions",
    "Every choice has trade-offs - say both sides",
    "Start simple, don't over-engineer",
    "Mention bottlenecks and what you'd do next",
  ],
  attribution:
    "Synthesised from donnemartin/system-design-primer, algomaster.io and KodeKloud System Design For Beginners",
};

export default module;
