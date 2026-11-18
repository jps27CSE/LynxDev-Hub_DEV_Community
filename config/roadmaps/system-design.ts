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
    resources: [
      {
        type: "article",
        title: "LynxDEV System Design path",
        url: "/system-design",
      },
      {
        type: "article",
        title: "System Design Primer",
        url: "https://github.com/donnemartin/system-design-primer",
      },
      {
        type: "article",
        title: "Google SRE Book",
        url: "https://sre.google/sre-book/table-of-contents/",
      },
    ],
    children: [
      {
        id: "sd-requirements",
        title: "Requirements & Constraints",
        description: "Functional vs non-functional, SLAs.",
        level: "intermediate",
        resources: [
          {
            type: "article",
            title: "Requirements",
            url: "https://github.com/donnemartin/system-design-primer",
          },
          {
            type: "article",
            title: "Google SRE: Embracing risk",
            url: "https://sre.google/sre-book/embracing-risk/",
          },
          {
            type: "article",
            title: "AWS: Well-Architected Framework",
            url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/the-framework.html",
          },
        ],
      },
      {
        id: "sd-estimation",
        title: "Back-of-the-Envelope Estimation",
        description: "QPS, storage, bandwidth.",
        level: "intermediate",
        resources: [
          {
            type: "article",
            title: "Estimation",
            url: "https://github.com/donnemartin/system-design-primer#system-design-topics-start-here",
          },
          {
            type: "article",
            title: "System Design Primer: Back-of-the-envelope",
            url: "https://github.com/donnemartin/system-design-primer#back-of-the-envelope-calculations",
          },
          {
            type: "article",
            title: "Google SRE: Service level objectives",
            url: "https://sre.google/sre-book/service-level-objectives/",
          },
          {
            type: "article",
            title: "Latency numbers every programmer should know",
            url: "https://gist.github.com/jboner/2841832",
          },
        ],
      },
      {
        id: "sd-scaling",
        title: "Scaling",
        description: "Vertical vs horizontal, stateless services.",
        level: "intermediate",
        resources: [
          {
            type: "article",
            title: "System Design Primer: Scalability",
            url: "https://github.com/donnemartin/system-design-primer#scalability",
          },
          {
            type: "article",
            title: "AWS: Reliability pillar",
            url: "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html",
          },
        ],
        children: [
          {
            id: "sd-loadbalancer",
            title: "Load Balancers",
            description: "L4/L7, algorithms, health checks.",
            level: "intermediate",
            resources: [
              {
                type: "article",
                title: "Load balancing",
                url: "https://aws.amazon.com/what-is/load-balancing/",
              },
              {
                type: "docs",
                title: "NGINX: Load balancing",
                url: "https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/",
              },
              {
                type: "docs",
                title: "AWS: Elastic Load Balancing",
                url: "https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html",
              },
              {
                type: "article",
                title: "System Design Primer: Load balancer",
                url: "https://github.com/donnemartin/system-design-primer#load-balancer",
              },
            ],
          },
          {
            id: "sd-stateless",
            title: "Stateless Services",
            description: "Externalize state; scale out.",
            level: "intermediate",
            resources: [
              {
                type: "article",
                title: "Stateless",
                url: "https://12factor.net/processes",
              },
              {
                type: "article",
                title: "Microsoft: Scale out stateless services",
                url: "https://learn.microsoft.com/en-us/azure/architecture/guide/design-principles/scale-out",
              },
              {
                type: "docs",
                title: "MDN: HTTP is stateless",
                url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview#http_is_stateless_but_not_sessionless",
              },
            ],
          },
        ],
      },
      {
        id: "sd-caching",
        title: "Caching",
        description: "Cache-aside, write-through, TTL, stampede protection.",
        level: "intermediate",
        resources: [
          {
            type: "article",
            title: "Caching",
            url: "https://aws.amazon.com/caching/",
          },
          {
            type: "docs",
            title: "AWS: Caching best practices",
            url: "https://aws.amazon.com/caching/best-practices/",
          },
          {
            type: "docs",
            title: "Redis: Caching",
            url: "https://redis.io/docs/latest/develop/reference/client-side-caching/",
          },
          {
            type: "docs",
            title: "MDN: HTTP caching",
            url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching",
          },
        ],
      },
      {
        id: "sd-data",
        title: "Data Layer",
        description: "Replication, sharding, consistency.",
        level: "advanced",
        resources: [
          {
            type: "article",
            title: "Use The Index, Luke",
            url: "https://use-the-index-luke.com/",
          },
          {
            type: "docs",
            title: "PostgreSQL: Documentation",
            url: "https://www.postgresql.org/docs/current/",
          },
        ],
        children: [
          {
            id: "sd-replicas",
            title: "Read Replicas",
            description: "Scale reads; replication lag.",
            level: "advanced",
            resources: [
              {
                type: "article",
                title: "Replication",
                url: "https://www.postgresql.org/docs/current/high-availability.html",
              },
              {
                type: "docs",
                title: "PostgreSQL: Log-shipping standby",
                url: "https://www.postgresql.org/docs/current/warm-standby.html",
              },
              {
                type: "docs",
                title: "AWS: Read replicas",
                url: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html",
              },
              {
                type: "article",
                title: "System Design Primer: Replication",
                url: "https://github.com/donnemartin/system-design-primer#replication",
              },
            ],
          },
          {
            id: "sd-sharding",
            title: "Sharding / Partitioning",
            description: "Hash vs range; hot keys.",
            level: "advanced",
            resources: [
              {
                type: "article",
                title: "Sharding",
                url: "https://www.mongodb.com/docs/manual/sharding/",
              },
              {
                type: "docs",
                title: "Vitess: Documentation",
                url: "https://vitess.io/docs/",
              },
              {
                type: "docs",
                title: "Citus: Sharding concepts",
                url: "https://docs.citusdata.com/en/stable/get_started/concepts.html",
              },
            ],
          },
        ],
      },
      {
        id: "sd-edge",
        title: "Edge & CDN",
        description: "Static content, edge compute.",
        level: "intermediate",
        resources: [
          {
            type: "article",
            title: "CDN",
            url: "https://web.dev/articles/content-delivery-networks",
          },
          {
            type: "docs",
            title: "AWS: CloudFront overview",
            url: "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html",
          },
          {
            type: "docs",
            title: "MDN: Content Delivery Network",
            url: "https://developer.mozilla.org/en-US/docs/Glossary/CDN",
          },
        ],
      },
      {
        id: "sd-ratelimit",
        title: "Rate Limiting",
        description: "Token bucket, sliding window, distributed limits.",
        level: "intermediate",
        resources: [
          {
            type: "article",
            title: "Rate limiting",
            url: "https://cloud.google.com/architecture/rate-limiting-strategies-techniques",
          },
          {
            type: "article",
            title: "Stripe: Scaling your API with rate limiters",
            url: "https://stripe.com/blog/rate-limiters",
          },
          {
            type: "docs",
            title: "Cloudflare: Rate limiting",
            url: "https://developers.cloudflare.com/waf/rate-limiting-rules/",
          },
          {
            type: "docs",
            title: "Kong: Rate limiting",
            url: "https://developer.konghq.com/plugins/rate-limiting/",
          },
        ],
      },
      {
        id: "sd-reliability",
        title: "Reliability",
        description: "Failures, retries, circuit breakers, idempotency.",
        level: "advanced",
        resources: [
          {
            type: "article",
            title: "Google SRE Book",
            url: "https://sre.google/sre-book/table-of-contents/",
          },
          {
            type: "article",
            title: "AWS: Reliability pillar",
            url: "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html",
          },
        ],
        children: [
          {
            id: "sd-failures",
            title: "How Systems Fail",
            description: "Cascading failures, blast radius.",
            level: "advanced",
            resources: [
              {
                type: "article",
                title: "Chaos Engineering",
                url: "https://principlesofchaos.org/",
              },
              {
                type: "article",
                title: "Google SRE: Postmortem culture",
                url: "https://sre.google/sre-book/postmortem-culture/",
              },
              {
                type: "article",
                title: "Google SRE: Handling overload",
                url: "https://sre.google/sre-book/handling-overload/",
              },
              {
                type: "article",
                title: "AWS: Post-event summaries",
                url: "https://aws.amazon.com/premiumsupport/technology/pes/",
              },
            ],
          },
          {
            id: "sd-retries",
            title: "Timeouts, Retries, Circuit Breakers",
            description: "Backoff, jitter, bulkheads.",
            level: "advanced",
            resources: [
              {
                type: "article",
                title: "Hystrix",
                url: "https://github.com/Netflix/Hystrix/wiki",
              },
              {
                type: "article",
                title: "AWS: Exponential backoff and jitter",
                url: "https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/",
              },
              {
                type: "docs",
                title: "Microsoft: Transient fault handling",
                url: "https://learn.microsoft.com/en-us/azure/architecture/best-practices/transient-faults",
              },
              {
                type: "docs",
                title: "Envoy: Retry policy",
                url: "https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/router_filter#config-http-filters-router-x-envoy-retry-on",
              },
            ],
          },
          {
            id: "sd-idempotency",
            title: "Idempotency",
            description: "Safe retries, idempotency keys.",
            level: "advanced",
            resources: [
              {
                type: "article",
                title: "Idempotency",
                url: "https://stripe.com/blog/idempotency",
              },
              {
                type: "article",
                title: "AWS: Idempotent APIs",
                url: "https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-apis/",
              },
              {
                type: "docs",
                title: "Stripe: Idempotent requests",
                url: "https://docs.stripe.com/api/idempotent_requests",
              },
              {
                type: "docs",
                title: "IETF: Idempotency-Key header",
                url: "https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/",
              },
            ],
          },
        ],
      },
      {
        id: "sd-practice",
        title: "Practice",
        description: "Design real systems; do mock interviews.",
        level: "advanced",
        optional: true,
        resources: [
          {
            type: "article",
            title: "System Design Primer",
            url: "https://github.com/donnemartin/system-design-primer",
          },
          {
            type: "article",
            title: "system-design-101 (GitHub)",
            url: "https://github.com/ByteByteGoHq/system-design-101",
          },
          {
            type: "article",
            title: "High Scalability",
            url: "http://highscalability.com/",
          },
        ],
      },
    ],
  },
};
