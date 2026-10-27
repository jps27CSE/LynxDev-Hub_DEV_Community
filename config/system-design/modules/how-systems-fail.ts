import type { SdGraph, SdModule } from "../types";

const NO_RETRY = { attempts: 0, backoffMs: 0, jitter: false };

function diagramGraph(): SdGraph {
  return {
    nodes: [
      { id: "client-1", type: "client", label: "Users", x: 40, y: 200 },
      {
        id: "lb-1",
        type: "load_balancer",
        label: "Load Balancer",
        x: 200,
        y: 200,
        algorithm: "rr",
        rateLimitPerMin: null,
      },
      {
        id: "app-1",
        type: "app_server",
        label: "App Server",
        x: 390,
        y: 200,
        replicas: 1,
        maxConcurrency: null,
        breakerEnabled: false,
      },
      {
        id: "db-1",
        type: "database",
        label: "Database",
        x: 620,
        y: 200,
        readReplicas: 0,
        partitions: 1,
        hotKeyShare: 0,
      },
    ],
    edges: [
      {
        id: "e1",
        from: "client-1",
        to: "lb-1",
        label: null,
        retry: NO_RETRY,
        partitioned: false,
      },
      {
        id: "e2",
        from: "lb-1",
        to: "app-1",
        label: null,
        retry: NO_RETRY,
        partitioned: false,
      },
      {
        id: "e3",
        from: "app-1",
        to: "db-1",
        label: null,
        retry: NO_RETRY,
        partitioned: false,
      },
    ],
    scenario: {
      arrivalRate: 1_000,
      writeShare: 0.1,
      mediaShare: 0,
      bytesPerMediaRequest: 2_000_000,
      abusiveShare: 0,
      latencyJitterMs: 0,
      cacheColdStart: false,
      replicaLagMs: 0,
    },
  };
}

function taskGraph(replicas: number, readReplicas: number): SdGraph {
  const graph = diagramGraph();
  graph.nodes[2] = {
    id: "app-1",
    type: "app_server",
    label: "App Server",
    x: 390,
    y: 200,
    replicas,
    maxConcurrency: null,
    breakerEnabled: false,
  };
  graph.nodes[3] = {
    id: "db-1",
    type: "database",
    label: "Database",
    x: 620,
    y: 200,
    readReplicas,
    partitions: 1,
    hotKeyShare: 0,
  };
  return graph;
}

const module: SdModule = {
  slug: "how-systems-fail",
  order: 11,
  part: 3,
  partTitle: "Reliability",
  kind: "sim",
  title: "How Systems Fail & Blast Radius",
  description:
    "Find every single point of failure in a design, trace retry storms and cascades before they happen.",
  story:
    "The photo-sharing app now scales, caches, and serves media from the edge. But a single app server still has one replica, the database has no replicas, and there is no load balancer redundancy. One node dying takes the whole app down. Before adding more machinery, we need to learn to see failure: trace the blast radius of each component, spot retry storms, and notice cascades.",
  chapters: [
    {
      slug: "single-points-of-failure",
      title: "Single points of failure",
      description: "Any node whose death takes the app down is a SPOF.",
      children: [
        {
          slug: "trace-the-path",
          title: "Trace the path",
          description:
            "Follow a request end to end and ask what happens if each hop dies.",
        },
        {
          slug: "blast-radius",
          title: "Blast radius",
          description: "How far a failure spreads before it is contained.",
        },
      ],
    },
    {
      slug: "retry-storms",
      title: "Retry storms",
      description: "Retries that make an outage worse.",
      children: [
        {
          slug: "retries-without-backoff",
          title: "Retries without backoff",
          description:
            "Why immediate retries amplify load on a struggling service.",
        },
        {
          slug: "jitter",
          title: "Jitter",
          description:
            "Why randomised backoff prevents synchronised retry waves.",
        },
      ],
    },
    {
      slug: "cascades",
      title: "Cascades",
      description: "How one slow service takes down its callers.",
      children: [
        {
          slug: "no-timeout",
          title: "No timeout",
          description:
            "A missing timeout turns a slow dependency into an outage.",
        },
        {
          slug: "circuit-breaker-preview",
          title: "Circuit breaker preview",
          description: "The pattern that stops a cascade before it starts.",
        },
      ],
    },
  ],
  lessons: [
    {
      slug: "trace-your-own-design",
      title: "Trace your own design",
      attribution: "Synthesised from donnemartin/system-design-primer",
      sections: [
        {
          kind: "scenario",
          title: "One node dies",
          body: "Pick any node in the current design and imagine it is gone. If the app stops serving users, that node is a single point of failure. The exercise is to do this for every node, not just the obvious ones.",
        },
        {
          kind: "concept",
          title: "Blast radius",
          body: "The blast radius of a failure is everything that stops working because of it. A database with no replica has blast radius 'everything'. An app server behind a load balancer with two replicas has blast radius 'one replica's share of traffic'. The goal of reliability work is to shrink blast radius, not to eliminate failure.",
        },
        {
          kind: "diagram",
          caption: "Every hop is a potential single point of failure",
          graph: diagramGraph(),
        },
        {
          kind: "your_turn",
          prompt:
            "List every node in the current design. For each, write what breaks if it dies and how many users are affected.",
        },
        {
          kind: "compare",
          body: "A beginner says 'add redundancy everywhere'. A senior engineer asks which failures are likely and expensive, then adds redundancy only where the blast radius justifies the cost.",
        },
        {
          kind: "video",
          videoId: "Pfr_6h3Rqew",
          title:
            "System Design Basics in Bangla | Scalability + Availability + Consistency + Fault Tolerance Explained",
          caption: "Bangla walkthrough of fault tolerance and availability.",
        },
        {
          kind: "concept",
          title: "Go deeper (free reads)",
          body: "Free reading on failures and reliability:\n\n- [donnemartin/system-design-primer](https://github.com/donnemartin/system-design-primer) — reliability section.\n- [Google SRE Book — Embracing Risk](https://sre.google/sre-book/embracing-risk/) — free online.\n- [Netflix: Chaos Engineering](https://netflixtechblog.com/tagged/chaos-engineering) — real-world chaos practice.\n- [AWS: Well-Architected Reliability Pillar](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/) — free guide.",
        },
        {
          kind: "recap",
          points: [
            "A SPOF is any node whose death stops the app",
            "Blast radius measures how far a failure spreads",
            "Shrink blast radius rather than chase zero failures",
            "Redundancy is a cost; spend it where blast radius is large",
          ],
        },
      ],
    },
    {
      slug: "retry-storms",
      title: "Retry storms",
      attribution: "Synthesised from donnemartin/system-design-primer",
      sections: [
        {
          kind: "scenario",
          title: "The retry that made it worse",
          body: "A database slows down. Clients retry immediately, tripling the load on an already struggling database. The database slows further, more retries fire, and the system collapses. The retries did not cause the original problem, but they made recovery impossible.",
        },
        {
          kind: "concept",
          title: "Backoff and jitter",
          body: "Retries need a delay that grows with each attempt (backoff) and a random component (jitter) so retries do not synchronise into waves. Without jitter, a thousand clients all retry at the same instant. The edge retry policy in the simulator carries `attempts`, `backoffMs`, and `jitter` for exactly this reason.",
        },
        {
          kind: "your_turn",
          prompt:
            "A service returns 503. You retry 3 times with 100 ms backoff and no jitter. What happens if 1,000 clients do the same? How does jitter change it?",
        },
        {
          kind: "compare",
          body: "A beginner retries immediately and aggressively. A senior engineer retries with exponential backoff and jitter, and caps the total retry budget so a failing dependency cannot consume all client resources.",
        },
        {
          kind: "recap",
          points: [
            "Immediate retries amplify load on a struggling service",
            "Backoff spreads retries over time",
            "Jitter desynchronises retry waves",
            "Cap the total retry budget",
          ],
        },
      ],
    },
    {
      slug: "cascades",
      title: "Cascades",
      attribution: "Synthesised from donnemartin/system-design-primer",
      sections: [
        {
          kind: "scenario",
          title: "One slow service, whole app down",
          body: "An image-resize service slows to 30 seconds per request. The API waits for it with no timeout, so API threads fill up waiting. New requests queue, the API stops responding, and a resize-service slowdown becomes a full outage.",
        },
        {
          kind: "concept",
          title: "Timeouts stop cascades",
          body: "A timeout converts 'slow' into 'failed', freeing the thread and letting the caller decide what to do: return a degraded response, serve a cached version, or fail fast. No timeout is worse than a bad timeout, because it turns a partial failure into a total one.",
        },
        {
          kind: "concept",
          title: "Circuit breakers",
          body: "A circuit breaker stops calling a failing dependency for a while, returning an error immediately instead of waiting. It prevents a slow dependency from consuming all caller resources. Module 12 builds one.",
        },
        {
          kind: "your_turn",
          prompt:
            "The image-resize service is slow but not dead. Should the API wait, fail fast, or serve unresized images? What does each choice cost?",
        },
        {
          kind: "compare",
          body: "A beginner waits indefinitely hoping it recovers. A senior engineer fails fast with a timeout, serves a degraded response, and lets the circuit breaker reopen traffic when the dependency recovers.",
        },
        {
          kind: "recap",
          points: [
            "A slow dependency can take down its callers",
            "Timeouts convert slow into failed",
            "Circuit breakers stop calling failing dependencies",
            "Degraded responses beat total outages",
          ],
        },
      ],
    },
  ],
  interviewByte: {
    shape:
      "Walk me through how your current design fails. What is the blast radius of losing the database?",
    strongAnswer:
      "I would trace a request end to end and mark every node whose death stops the app. The database with no replica has blast radius 'everything'. An app server behind a load balancer with two replicas has blast radius 'half the traffic'. I would then prioritise: add a database replica first, then a second app server, then consider multi-region. I would also note that retries without backoff and missing timeouts can turn a partial failure into a total one, so timeouts and jittered backoff are part of the same answer.",
    trap: "Listing mitigations without first identifying the failure modes. Also, claiming the system has no SPOFs when a single database or load balancer still exists.",
  },
  task: {
    brief:
      "Find every single point of failure in the current design. Add redundancy so no single node death takes the app down.",
    startGraph: taskGraph(1, 0),
    solutionGraph: taskGraph(2, 1),
    steps: [
      {
        id: "add-app-redundancy",
        title: "Remove the app server SPOF",
        brief:
          "Give the app server at least 2 replicas so one dying does not stop traffic.",
        hint: "Select the app server and raise its Replicas value.",
        reveal:
          "Set app server replicas to 2 or more. Behind the load balancer, traffic spreads and a single death is absorbed.",
        check: (graph) => {
          const app = graph.nodes.find((node) => node.type === "app_server");
          const replicas = (app as any)?.replicas ?? 1;
          const passed = !!app && replicas >= 2;
          return {
            passed,
            progress: passed
              ? `✓ ${replicas} app replicas`
              : `${replicas} replica — raise to 2 or more`,
          };
        },
      },
      {
        id: "add-db-redundancy",
        title: "Remove the database SPOF",
        brief:
          "Give the database at least 1 read replica so a primary failure is survivable.",
        hint: "Select the database and raise its Read Replicas value.",
        reveal:
          "Set read replicas to 1 or more. The app can still serve reads if the primary's replica is promoted.",
        check: (graph) => {
          const db = graph.nodes.find((node) => node.type === "database");
          const replicas = (db as any)?.readReplicas ?? 0;
          const passed = !!db && replicas >= 1;
          return {
            passed,
            progress: passed
              ? `✓ ${replicas} read replica(s)`
              : `${replicas} replicas — raise to 1 or more`,
          };
        },
      },
    ],
    passCriteria: [
      {
        id: "no-app-spof",
        label: "App server utilisation < 40% (redundancy in place)",
        required: true,
        explain:
          "A single app replica runs hot and is a SPOF: its death stops all traffic. Two or more replicas behind a load balancer spread load and absorb one death.",
        assert: (result) => {
          const app = result.perNode.find((node) => node.id === "app-1");
          return result.valid && !!app && app.utilisation < 0.4;
        },
      },
    ],
  },
  recap: [
    "A SPOF is any node whose death stops the app",
    "Blast radius measures how far a failure spreads",
    "Retries without backoff and jitter make outages worse",
    "Missing timeouts turn slow dependencies into total outages",
    "Circuit breakers stop cascades before they start",
  ],
  attribution:
    "Synthesised from donnemartin/system-design-primer (375k★), algomaster.io and KodeKloud System Design For Beginners",
};

export default module;
