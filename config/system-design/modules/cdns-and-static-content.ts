import type { SdGraph, SdModule } from "../types";

const NO_RETRY = { attempts: 0, backoffMs: 0, jitter: false };

function diagramGraph(cdnHitRate: number): SdGraph {
  return {
    nodes: [
      { id: "client-1", type: "client", label: "Users", x: 40, y: 200 },
      {
        id: "lb-1",
        type: "load_balancer",
        label: "Load Balancer",
        x: 180,
        y: 200,
        algorithm: "rr",
        rateLimitPerMin: null,
      },
      {
        id: "app-1",
        type: "app_server",
        label: "Photo API",
        x: 340,
        y: 200,
        replicas: 2,
        maxConcurrency: null,
        breakerEnabled: false,
      },
      {
        id: "cdn-1",
        type: "cdn",
        label: "CDN edge",
        x: 520,
        y: 200,
        hitRate: cdnHitRate,
      },
      {
        id: "origin-1",
        type: "object_store",
        label: "Origin storage",
        x: 720,
        y: 200,
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
        to: "cdn-1",
        label: "media",
        retry: NO_RETRY,
        partitioned: false,
      },
      {
        id: "e4",
        from: "cdn-1",
        to: "origin-1",
        label: "miss",
        retry: NO_RETRY,
        partitioned: false,
      },
    ],
    scenario: {
      arrivalRate: 5_000,
      writeShare: 0.05,
      mediaShare: 0.8,
      bytesPerMediaRequest: 2_000_000,
      abusiveShare: 0,
      latencyJitterMs: 0,
      cacheColdStart: false,
      replicaLagMs: 0,
    },
  };
}

function taskGraph(cdnHitRate: number): SdGraph {
  const graph = diagramGraph(cdnHitRate);
  graph.nodes[2] = {
    id: "app-1",
    type: "app_server",
    label: "Photo API",
    x: 340,
    y: 200,
    replicas: 4,
    maxConcurrency: null,
    breakerEnabled: false,
  };
  graph.scenario.arrivalRate = 5_000;
  return graph;
}

const module: SdModule = {
  slug: "cdns-and-static-content",
  order: 10,
  part: 1,
  partTitle: "Scaling up",
  kind: "sim",
  title: "CDNs & Static Content",
  description:
    "Move 2 MB photos to the edge so the origin barely sees them, and learn what a CDN cannot cache.",
  story:
    "The photo-sharing app now serves 5,000 requests per second, and 80% of them are 2 MB photos. That is 8 GB/s of media if every byte leaves the origin. The database and app servers are fine, but the origin storage and its outbound bandwidth are on fire. We need to put the photos closer to the users.",
  chapters: [
    {
      slug: "latency-and-bandwidth",
      title: "Latency numbers every programmer should know",
      description: "Why distance dominates for media.",
      children: [
        {
          slug: "latency-table",
          title: "The latency table",
          description:
            "Cache and memory are nanoseconds; cross-continent is tens of milliseconds.",
        },
        {
          slug: "bandwidth-math",
          title: "Bandwidth math",
          description: "Turn requests per second into megabytes per second.",
        },
      ],
    },
    {
      slug: "how-a-cdn-works",
      title: "How a CDN works",
      description: "Cache keys, TTLs, and what the edge can and cannot answer.",
      children: [
        {
          slug: "cache-keys-and-ttl",
          title: "Cache keys and TTL",
          description: "How the edge decides what to store and for how long.",
        },
        {
          slug: "what-a-cdn-cannot-cache",
          title: "What a CDN cannot cache",
          description:
            "Dynamic, personalized, or write-heavy responses must still reach the origin.",
        },
      ],
    },
    {
      slug: "getting-media-off-the-origin",
      title: "Getting media off the origin",
      description:
        "Raise the edge hit rate and watch origin bandwidth collapse.",
      children: [
        {
          slug: "edge-hit-rate",
          title: "Edge hit rate",
          description:
            "The single knob that determines how much traffic the origin sees.",
        },
      ],
    },
  ],
  lessons: [
    {
      slug: "latency-numbers",
      title: "Latency numbers every programmer should know",
      attribution:
        "Synthesised from donnemartin/system-design-primer (Peter Norvig's table)",
      sections: [
        {
          kind: "scenario",
          title: "8 GB/s of photos",
          body: "5,000 requests per second, 80% of them photos, 2 MB each: 4,000 × 2 MB = 8,000 MB/s = 8 GB/s leaving the origin. No single origin can sustain that, and every photo travels the full distance to the user.",
        },
        {
          kind: "concept",
          title: "Distance dominates",
          body: "A cache hit in memory is nanoseconds. A round trip within one data center is about half a millisecond. Cross-continent is tens of milliseconds, and cross-ocean is worse. For a 2 MB photo, the transfer time dwarfs the server's processing time, so the closer the bytes are to the user, the better.",
        },
        {
          kind: "concept",
          title: "Turn req/s into MB/s",
          body: "Bandwidth is requests × payload. 4,000 media requests per second × 2 MB = 8 GB/s. A CDN does not reduce the bytes per request; it reduces how many of those bytes must leave the origin by serving most of them from a nearby edge node.",
        },
        {
          kind: "diagram",
          caption:
            "Media flows through the CDN edge before reaching origin storage",
          graph: diagramGraph(0.95),
        },
        {
          kind: "your_turn",
          prompt:
            "Your app serves 10,000 req/s, 60% media, 1.5 MB each. What is the media bandwidth? If a CDN answers 90% at the edge, how much reaches the origin?",
        },
        {
          kind: "compare",
          body: "A beginner sizes the origin for peak media bandwidth. A senior engineer sizes the edge for it and keeps the origin for misses and writes.",
        },
        {
          kind: "video",
          videoId: "vz6ShBpxt2U",
          title:
            "System Design Basics in Bangla | CDN + Message Queue + API Gateway Explained",
          caption: "Bangla walkthrough of CDN, message queue, and API gateway.",
        },
        {
          kind: "concept",
          title: "Go deeper (free reads)",
          body: "Free reading on CDNs:\n\n- [donnemartin/system-design-primer — CDN](https://github.com/donnemartin/system-design-primer) — primer section.\n- [Cloudflare: What is a CDN?](https://www.cloudflare.com/learning/cdn/what-is-a-cdn/) — free explainer.\n- [AWS CloudFront docs](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html) — how a CDN works.\n- [web.dev: Cache HTTP responses](https://web.dev/articles/http-cache) — caching and TTL.",
        },
        {
          kind: "recap",
          points: [
            "Bandwidth = requests × payload size",
            "Distance dominates transfer time for large payloads",
            "A CDN serves most bytes from a nearby edge node",
            "Size the edge for peak media, not the origin",
          ],
        },
      ],
    },
    {
      slug: "cache-keys-and-ttl",
      title: "Cache keys and TTL",
      attribution: "Synthesised from donnemartin/system-design-primer",
      sections: [
        {
          kind: "scenario",
          title: "What does the edge store?",
          body: "A CDN edge node has finite storage. It cannot keep every photo forever. It stores by cache key (usually the URL) and evicts based on TTL and least-recently-used. The first request for a photo is a miss and fetches from origin; later requests are hits.",
        },
        {
          kind: "concept",
          title: "Cache keys and TTLs",
          body: "The cache key is usually the full URL, sometimes plus a few headers. The TTL says how long the edge may serve a copy before revalidating. A long TTL maximizes hits but risks serving stale content; a short TTL keeps content fresh but sends more traffic to the origin. The simulator's `cdn.hitRate` is the resulting share of media answered at the edge.",
        },
        {
          kind: "your_turn",
          prompt:
            "A photo's URL never changes but its bytes do (a user re-uploads). What cache key and TTL would you choose, and what invalidation strategy would you add?",
        },
        {
          kind: "compare",
          body: "A beginner sets a one-year TTL and forgets invalidation. A senior engineer versions the URL (photo.jpg?v=2) so the key changes with the content, making invalidation unnecessary.",
        },
        {
          kind: "recap",
          points: [
            "The cache key is usually the URL",
            "TTL trades hit rate against freshness",
            "Version the URL to avoid invalidation entirely",
            "`cdn.hitRate` is the share answered at the edge",
          ],
        },
      ],
    },
    {
      slug: "what-a-cdn-cannot-cache",
      title: "What a CDN cannot cache",
      attribution: "Synthesised from donnemartin/system-design-primer",
      sections: [
        {
          kind: "scenario",
          title: "Not everything belongs at the edge",
          body: "A CDN is great for immutable photos, but useless for a feed that changes per user or a write that must hit the database. Misclassifying dynamic content as cacheable serves stale or wrong data; misclassifying static content as dynamic wastes origin bandwidth.",
        },
        {
          kind: "concept",
          title: "The uncacheable set",
          body: "CDNs cannot cache personalized responses, authenticated data that varies by user, write operations, or anything with side effects. They can cache public, immutable, or long-lived assets: images, CSS, JS bundles, fonts. The lesson is to separate the two paths so the edge only sees what it can answer.",
        },
        {
          kind: "your_turn",
          prompt:
            "Your app has user avatars (public, immutable URLs) and a personalized home feed. Which goes through the CDN and which must reach the origin?",
        },
        {
          kind: "compare",
          body: "A beginner puts everything behind the CDN and serves stale feeds. A senior engineer splits the paths: static assets at the edge, dynamic data at the origin, with clear cache-control headers on each.",
        },
        {
          kind: "recap",
          points: [
            "CDNs cache public, immutable assets well",
            "Personalized or write-heavy responses must reach the origin",
            "Split the paths so the edge only sees cacheable traffic",
            "Cache-control headers are the contract",
          ],
        },
      ],
    },
  ],
  interviewByte: {
    shape:
      "Photos are 2 MB each and 1 million users per day hit your app. How do you keep origin bandwidth under 10%?",
    strongAnswer:
      "I would put a CDN in front of the photo storage with a high edge hit rate, served by immutable, versioned URLs so invalidation is unnecessary. With a 95% hit rate, only 5% of photo requests reach the origin. I would keep dynamic, personalized, and write traffic off the CDN entirely so the edge only answers what it can cache. I would monitor origin bandwidth directly and treat a rising origin share as a cache-key or TTL problem, not a capacity problem.",
    trap: "Saying 'add more origin bandwidth' instead of reducing origin traffic. Also, claiming the CDN caches everything — it cannot cache personalized or write-heavy responses, and pretending it can serves stale data.",
  },
  task: {
    brief:
      "Photos are 2 MB each and 5,000 req/s are 80% media. Raise the CDN edge hit rate so origin bandwidth drops below 10%.",
    startGraph: taskGraph(0),
    solutionGraph: taskGraph(0.95),
    steps: [
      {
        id: "add-cdn",
        title: "Put a CDN in front of origin storage",
        brief:
          "Ensure a CDN node sits between the app and origin storage so media can be answered at the edge.",
        hint: "The graph already has a CDN node; check it is wired between app and origin.",
        reveal:
          "Keep the CDN node on the media path between app and origin storage. Without it, every photo hits the origin.",
        check: (graph) => {
          const cdn = graph.nodes.find((node) => node.type === "cdn");
          const passed = !!cdn;
          return {
            passed,
            progress: passed
              ? "✓ CDN node present on the media path"
              : "Add a CDN node",
          };
        },
      },
      {
        id: "raise-edge-hit-rate",
        title: "Raise the edge hit rate",
        brief:
          "Increase the CDN's hit rate so at least 90% of media is answered at the edge.",
        hint: "Select the CDN node and raise its Hit Rate in the inspector.",
        reveal:
          "Set the CDN hitRate to 0.95 or higher. At 95%, only 5% of photos reach origin storage.",
        check: (graph) => {
          const cdn = graph.nodes.find((node) => node.type === "cdn");
          const hitRate = (cdn as any)?.hitRate ?? 0;
          const passed = !!cdn && hitRate >= 0.9;
          return {
            passed,
            progress: passed
              ? `✓ Edge hit rate ${(hitRate * 100).toFixed(0)}%`
              : cdn
                ? `${(hitRate * 100).toFixed(0)}% — raise to 90% or higher`
                : "Add a CDN node",
          };
        },
      },
    ],
    passCriteria: [
      {
        id: "origin-bandwidth",
        label: "Origin bandwidth < 10%",
        required: true,
        explain:
          "With a high edge hit rate, only cache misses reach origin storage, so its utilisation stays below 10%.",
        assert: (result) => {
          const origin = result.perNode.find((node) => node.id === "origin-1");
          return result.valid && !!origin && origin.utilisation < 0.1;
        },
      },
    ],
  },
  recap: [
    "Bandwidth = requests × payload size",
    "A CDN serves most bytes from a nearby edge node",
    "Cache keys are usually URLs; TTL trades hit rate against freshness",
    "Version the URL to avoid invalidation entirely",
    "CDNs cannot cache personalized or write-heavy responses",
  ],
  attribution:
    "Synthesised from donnemartin/system-design-primer (375k★), algomaster.io and KodeKloud System Design For Beginners",
};

export default module;
