import type { Roadmap } from "./types";

export const systemDesignRoadmap: Roadmap = {
  slug: "system-design",
  title: "System Design",
  description:
    "Step-by-step guide to system design — capacity planning, caching, sharding, rate limiting, CDNs, failures, retries, and idempotency.",
  category: "system-design",
  level: "intermediate",
  updatedAt: "2026-10-25",
  estimatedHours: 80,
  tags: ["architecture", "scalability", "caching", "sharding", "reliability"],
  root: {
    id: "sd-r-root",
    title: "System Design Foundations",
    description: "How to think about large-scale systems.",
    level: "intermediate",
    resources: [{ type: "article", title: "LynxDEV System Design path", url: "/system-design" }],
    children: [
      { id: "sd-requirements", title: "Requirements & Constraints", description: "Functional vs non-functional, SLAs.", level: "intermediate", resources: [{ type: "article", title: "Requirements", url: "https://github.com/donnemartin/system-design-primer" }] },
      { id: "sd-estimation", title: "Back-of-the-Envelope Estimation", description: "QPS, storage, bandwidth.", level: "intermediate", resources: [{ type: "article", title: "Estimation", url: "https://github.com/donnemartin/system-design-primer#system-design-topics-start-here" }] },
      {
        id: "sd-scaling",
        title: "Scaling",
        description: "Vertical vs horizontal, stateless services.",
        level: "intermediate",
        resources: [],
        children: [
          { id: "sd-loadbalancer", title: "Load Balancers", description: "L4/L7, algorithms, health checks.", level: "intermediate", resources: [{ type: "article", title: "Load balancing", url: "https://aws.amazon.com/what-is/load-balancing/" }] },
          { id: "sd-stateless", title: "Stateless Services", description: "Externalize state; scale out.", level: "intermediate", resources: [{ type: "article", title: "Stateless", url: "https://12factor.net/processes" }] },
        ],
      },
      {
        id: "sd-caching",
        title: "Caching",
        description: "Cache-aside, write-through, TTL, stampede protection.",
        level: "intermediate",
        resources: [{ type: "article", title: "Caching", url: "https://aws.amazon.com/caching/" }],
      },
      {
        id: "sd-data",
        title: "Data Layer",
        description: "Replication, sharding, consistency.",
        level: "advanced",
        resources: [],
        children: [
          { id: "sd-replicas", title: "Read Replicas", description: "Scale reads; replication lag.", level: "advanced", resources: [{ type: "article", title: "Replication", url: "https://www.postgresql.org/docs/current/high-availability.html" }] },
          { id: "sd-sharding", title: "Sharding / Partitioning", description: "Hash vs range; hot keys.", level: "advanced", resources: [{ type: "article", title: "Sharding", url: "https://www.mongodb.com/docs/manual/sharding/" }] },
        ],
      },
      {
        id: "sd-edge",
        title: "Edge & CDN",
        description: "Static content, edge compute.",
        level: "intermediate",
        resources: [{ type: "article", title: "CDN", url: "https://www.cloudflare.com/learning/cdn/what-is-a-cdn/" }],
      },
      {
        id: "sd-ratelimit",
        title: "Rate Limiting",
        description: "Token bucket, sliding window, distributed limits.",
        level: "intermediate",
        resources: [{ type: "article", title: "Rate limiting", url: "https://cloud.google.com/architecture/rate-limiting-strategies-techniques" }],
      },
      {
        id: "sd-reliability",
        title: "Reliability",
        description: "Failures, retries, circuit breakers, idempotency.",
        level: "advanced",
        resources: [],
        children: [
          { id: "sd-failures", title: "How Systems Fail", description: "Cascading failures, blast radius.", level: "advanced", resources: [{ type: "article", title: "Chaos Engineering", url: "https://principlesofchaos.org/" }] },
          { id: "sd-retries", title: "Timeouts, Retries, Circuit Breakers", description: "Backoff, jitter, bulkheads.", level: "advanced", resources: [{ type: "article", title: "Hystrix", url: "https://github.com/Netflix/Hystrix/wiki" }] },
          { id: "sd-idempotency", title: "Idempotency", description: "Safe retries, idempotency keys.", level: "advanced", resources: [{ type: "article", title: "Idempotency", url: "https://stripe.com/blog/idempotency" }] },
        ],
      },
      {
        id: "sd-practice",
        title: "Practice",
        description: "Design real systems; do mock interviews.",
        level: "advanced",
        optional: true,
        resources: [{ type: "article", title: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer" }],
      },
    ],
  },
};