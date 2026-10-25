import type { SdModule } from "../types";
import { defaultNode } from "@/lib/system-design/nodes";

const module: SdModule = {
  slug: "requirements",
  order: 2,
  part: 0,
  partTitle: "Mindset",
  title: "Requirements",
  description:
    "Learn to find out what to build before building it. Functional vs non-functional, asking the right questions, and turning vague asks into clear goals.",
  story:
    "Our photo-sharing app works for 100 users. Someone says 'Let's scale this'. But scale to what? For whom? What exactly must never break? Before we add any more boxes to our diagram, we need to get brutally clear about requirements. In real life, nobody gives you a perfect checklist. You have to dig it out by asking questions.",
  lessons: [
    {
      slug: "functional-vs-nonfunctional",
      title: "Functional vs Non-Functional Requirements",
      attribution: "Synthesised from donnemartin/system-design-primer",
      sections: [
        {
          kind: "scenario",
          title: "What vs How well",
          body: "Imagine ordering food at a restaurant. 'I want a burger' is what you want (functional). 'I want it hot, delivered in 10 minutes, and it must be correct' is how well you want it done (non-functional). Both decide if you're happy or not.",
        },
        {
          kind: "concept",
          title: "In simple words",
          body: "Functional Requirements (FR) = What the system MUST DO. These are the features users directly interact with.\n\nNon-Functional Requirements (NFR) = How well the system must behave. These are about quality: speed, reliability, security, availability etc.\n\nFor our photo-sharing app, 'user can upload a photo' is FR. 'Feed must load in under 200ms for most users' is NFR.",
        },
        {
          kind: "concept",
          title: "Examples for our photo app",
          body: "Functional Requirements:\n- Users can create an account and login\n- Users can upload photos with captions\n- Users can follow/unfollow other users\n- Users can view a personalized feed\n- Users can like/comment on posts\n\nNon-Functional Requirements:\n- Feed should load quickly (low latency)\n- System should be available most of the time (high availability)\n- Photos should not be lost (durability)\n- Should handle growing number of users (scalability)\n- Should be secure (users can only edit their own posts)",
        },
        {
          kind: "diagram",
          caption: "Current design to reason about",
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
          kind: "concept",
          title: "Make them measurable",
          body: "Vague: 'It should be fast' -> Bad\nMeasurable: 'p95 feed load time < 200ms' -> Good\n\nVague: 'It should be reliable' -> Bad  \nMeasurable: '99.9% uptime per month' -> Good\n\nIf you can't test it, it's not a good requirement.",
        },
        {
          kind: "your_turn",
          prompt:
            "Pick 4 functional requirements and 4 non-functional requirements for our photo-sharing app. Make at least 2 of the NFRs measurable with numbers.",
        },
        {
          kind: "compare",
          body: "Beginners obsess over listing every feature (FR). Experienced designers spend more time getting the right NFRs. Why? Because NFRs like 'low latency', 'high availability' or 'handle 100k users' will force you to add caches, replicas, CDNs etc. The features are usually obvious. The 'how well' is what shapes your architecture.",
        },
        {
          kind: "recap",
          points: [
            "FR = What it does. NFR = How well it does it",
            "NFRs often drive the biggest architectural decisions",
            "Always make requirements measurable and testable",
            "Good NFRs prevent debates later ('fast' means different things to different people)",
          ],
        },
      ],
    },
    {
      slug: "eliciting-requirements",
      title: "Eliciting Requirements: Ask Before You Design",
      attribution:
        "Synthesised from donnemartin/system-design-primer and KodeKloud",
      sections: [
        {
          kind: "scenario",
          title: "Nobody hands you the full spec",
          body: "In an interview, someone says 'Design Instagram'. They won't list DAU, read/write ratio, or storage needs. In a real company, the product manager might say 'make it faster' without numbers. Your job is to clarify. Asking good questions shows you think like an engineer.",
        },
        {
          kind: "concept",
          title: "Questions to ask for our photo app",
          body: "Scope: Is this just feed+photos, or stories, reels, DMs too? For learning, we should stick to core features first.\n\nScale: How many Daily Active Users (DAU)? Is it 10k, 100k, or 1M?\n\nUsage pattern: Read heavy or write heavy? For social apps, reads (scrolling feed) are usually 100x more than writes (posting).\n\nContent: Text only or photos/videos? Videos are much heavier.\n\nUsers: Global or mostly one region?\n\nMust-haves: What absolutely must work? What can we skip for v1?",
        },
        {
          kind: "concept",
          title: "Core vs Nice-to-have",
          body: "For a photo-sharing app MVP, core usually means: upload photo, view feed, follow users. Stories, filters, location tags are nice-to-have. \n\nThe trick is to design for the core first in the simplest way possible. Once core works and you understand bottlenecks, you can extend.",
        },
        {
          kind: "your_turn",
          prompt:
            "You're told 'Design a photo-sharing app'. Write 6 specific questions you'd ask, in order of importance. For each, explain WHY you'd ask it.",
        },
        {
          kind: "compare",
          body: "Spend 3-5 minutes asking and clarifying. Draw nothing. Confirm assumptions out loud. A designer who says 'Assuming 100k DAU, 95% reads, 5% writes...' is doing this right. They're making their assumptions visible so you can challenge them if needed.",
        },
        {
          kind: "recap",
          points: [
            "Requirements are discovered by asking, not assumed",
            "Clarify scope, scale, and usage pattern first",
            "Separate core features from nice-to-haves",
            "State your assumptions clearly",
            "Design for the stated problem, not 'the biggest version possible'",
          ],
        },
      ],
    },
  ],
  interviewByte: {
    shape: "How would you gather requirements before designing Instagram?",
    strongAnswer:
      "I'd first clarify scope - should I focus on core features like photo upload, feed, and following, or include stories/reels/DMs? Then I'd ask about scale - DAU and expected growth. I'd find out read/write ratio since social feeds are read-heavy. I'd ask about media - just photos or videos? I'd clarify latency expectations and availability needs. Based on answers, I'd define measurable FRs and NFRs, state my assumptions, and only then start designing. I'd keep it simple for v1 and discuss scaling later.",
    trap: "Jumping straight to 'I'd use CDN, Redis, microservices' without asking a single question. Always clarify requirements and state assumptions first.",
  },
  task: {
    brief:
      "Fill in the constraints for our photo-sharing app. Write down your Functional Requirements, Non-Functional Requirements, assumptions about scale, and 2-3 key questions you asked. Think like you're about to design it.",
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
        id: "list-fr",
        title: "Define functional requirements",
        brief: "List what users can actually do.",
        hint: "Focus on core actions: upload, view feed, follow.",
        reveal:
          "Core FRs: Upload photos, view personalized feed, follow/unfollow, like posts.",
        check: (g) => ({
          passed: g.nodes.length >= 1,
          progress: "✓ Think through features",
        }),
      },
      {
        id: "list-nfr",
        title: "Define non-functional requirements",
        brief: "Make them measurable (latency, availability etc).",
        hint: "Try to add numbers where possible.",
        reveal:
          "e.g. Feed p95 < 200ms, 99.9% availability, durable photo storage.",
        check: (g) => ({
          passed: g.edges.length >= 0,
          progress: "✓ Think through quality needs",
        }),
      },
    ],
    passCriteria: [
      {
        id: "requirements-thought",
        label: "Requirements reasoning complete",
        required: true,
        explain:
          "Show you know the difference between FR and NFR and can ask clarifying questions.",
        assert: (r) => r.valid,
      },
    ],
  },
  recap: [
    "FR = what it does, NFR = how well it does it",
    "NFRs usually drive your architecture choices",
    "Ask before you draw. Clarify scope, scale, usage",
    "Keep core minimal for v1, extend later",
    "Make requirements measurable. Vague words won't help you design",
  ],
  attribution:
    "Synthesised from donnemartin/system-design-primer, algomaster.io and KodeKloud System Design For Beginners",
};

export default module;
