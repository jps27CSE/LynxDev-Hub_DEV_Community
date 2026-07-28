import { NextResponse } from "next/server";
import { z } from "zod";
import { validationError, badJson } from "@/lib/api-error";
import { db } from "@/config/db";
import { interviewCategories } from "@/config/schema";
import { eq } from "drizzle-orm";

const questionTemplates: Record<string, { question: string; answer: string; difficulty: string; tags: string[] }[]> = {
  "software-engineer": [
    { question: "Explain how garbage collection works in languages like Java or Go.", answer: "Garbage collection automatically reclaims memory occupied by objects no longer referenced. Common algorithms: mark-and-sweep (traverse reachable objects, sweep unmarked), reference counting (track pointer count), generational (frequent young-gen collections, rare old-gen). Go uses a concurrent mark-and-sweep with STW (stop-the-world) pauses; Java offers multiple GC implementations (G1, ZGC, Shenandoah).", difficulty: "hard", tags: ["memory-management", "runtime"] },
    { question: "How would you design a URL shortener like TinyURL?", answer: "1) Generate a unique short key (base62 encoding of auto-increment ID or hash). 2) Store mapping in DB (key → original URL). 3) Handle redirect (301/302 from short URL to original). Scale: use a distributed ID generator (Snowflake), cache hot URLs in Redis, DB sharding by key hash. Estimate: ~100M URLs/month = ~38 writes/second, reads ~10x more.", difficulty: "hard", tags: ["system-design"] },
    { question: "What is the difference between an abstract class and an interface?", answer: "Abstract classes can have both abstract and concrete methods, constructors, and instance variables. Interfaces define a contract (method signatures) — traditionally only abstract methods, but modern languages support default methods. A class can extend only one abstract class but implement multiple interfaces. Use abstract classes for shared state; interfaces for shared behavior across unrelated classes.", difficulty: "medium", tags: ["oop"] },
    { question: "Explain how Dijkstra's algorithm works.", answer: "Dijkstra finds the shortest path from a source node to all other nodes in a weighted graph. Maintain a priority queue of unvisited nodes (cost from source). Pop the node with smallest cost, relax its neighbors (update cost if new path is shorter). Repeat until all nodes processed. Complexity: O((V+E) log V) with binary heap. Does NOT work with negative edge weights.", difficulty: "medium", tags: ["algorithms", "graph"] },
    { question: "What is the difference between synchronous and asynchronous programming?", answer: "Synchronous: operations block until completion — simple to reason about but wastes CPU during I/O waits. Asynchronous: operations initiate and continue later via callbacks/promises/async-await — better resource utilization. JavaScript uses event loop: call stack, microtask queue (Promises), macrotask queue (setTimeout). Async/await is syntactic sugar over Promises.", difficulty: "medium", tags: ["concurrency"] },
    { question: "Explain the concept of idempotency in APIs.", answer: "Idempotency means multiple identical requests have the same effect as a single request. GET, PUT, DELETE are idempotent; POST is not (creates new resources). Idempotency keys (client-generated unique tokens) ensure safe retries. Example: a payment API should not charge twice for the same order if the client retries. Implemented by checking idempotency key before processing.", difficulty: "medium", tags: ["api-design"] },
    { question: "What are ACID transactions in distributed systems?", answer: "ACID guarantees: Atomicity (all-or-nothing), Consistency (valid state transitions), Isolation (concurrent transactions don't interfere), Durability (committed data persists). In distributed systems: Atomicity uses 2PC/3PC; Consistency requires application-level invariants; Isolation uses locking or MVCC; Durability uses replication + write-ahead logs. Trade-offs described by the CAP theorem.", difficulty: "hard", tags: ["distributed-systems", "databases"] },
  ],
  "frontend-engineer": [
    { question: "Explain React's useEffect dependencies array.", answer: "useEffect(fn, deps) runs fn after render if any dependency changed. Empty [] = run once on mount. No array = run on every render. Return a cleanup function to avoid memory leaks. Common bugs: stale closures (omit deps), infinite loops (mutate deps on every render), missing deps (eslint-plugin-react-hooks helps).", difficulty: "medium", tags: ["react", "hooks"] },
    { question: "What is the difference between controlled and uncontrolled components in React?", answer: "Controlled: form state managed by React (value + onChange). Uncontrolled: state managed by DOM (ref-based). Controlled gives full control (validation, instant feedback) but more boilerplate. Uncontrolled is simpler for basic forms but harder to validate. Prefer controlled for complex forms, uncontrolled for simple/legacy integrations.", difficulty: "medium", tags: ["react", "forms"] },
    { question: "How does CSS specificity work?", answer: "Specificity determines which CSS rule applies when conflicts arise. Calculated as: inline styles (1000) > ID selectors (100) > class/pseudo-class/attribute (10) > element/pseudo-element (1). '!important' overrides everything. Best practice: avoid !important and overly specific selectors; use BEM or CSS modules for scoping.", difficulty: "easy", tags: ["css"] },
    { question: "What is the event loop in JavaScript?", answer: "JavaScript is single-threaded but non-blocking via the event loop. Call stack executes synchronous code. Async operations (Promises, setTimeout) go to web APIs, then callback queue. Event loop checks call stack → if empty, pushes first callback from microtask queue (Promises), then macrotask queue (setTimeout, I/O). This enables async behavior without multi-threading.", difficulty: "medium", tags: ["javascript"] },
    { question: "Explain the concept of code splitting and lazy loading.", answer: "Code splitting breaks bundles into smaller chunks loaded on demand. React.lazy() + Suspense dynamically imports components. Benefits: faster initial load, lower bandwidth, better performance. Webpack/Rollup automatically split on dynamic imports. Route-based splitting is most common. Trade-off: extra network requests for chunks.", difficulty: "medium", tags: ["performance", "react"] },
  ],
  "backend-engineer": [
    { question: "Explain how database connection pooling works.", answer: "Connection pooling maintains a cache of database connections for reuse. Instead of creating/tearing down connections per request, the pool lends connections and returns them after use. Benefits: reduced latency (no TCP handshake per query), controlled concurrency (max pool size), efficient resource usage. Pool size depends on DB CPU cores + query latency.", difficulty: "medium", tags: ["databases", "performance"] },
    { question: "What is the difference between optimistic and pessimistic locking?", answer: "Pessimistic locking prevents conflicts by locking rows when read (SELECT ... FOR UPDATE). Optimistic locking assumes no conflict — uses version numbers/timestamps and checks on update. Pessimistic is safer but reduces concurrency; optimistic has better throughput but requires conflict handling (retry). Choose based on contention levels.", difficulty: "medium", tags: ["databases", "concurrency"] },
    { question: "How does TLS/SSL work?", answer: "TLS provides encrypted communication over TCP. Handshake: 1) Client sends supported ciphers + random nonce. 2) Server sends certificate (public key) + chosen cipher + nonce. 3) Client verifies certificate via CA chain, generates pre-master secret, encrypts with server's public key. 4) Both derive session keys. 5) Switch to symmetric encryption. Certificate authorities (CAs) validate identity.", difficulty: "hard", tags: ["security", "networking"] },
    { question: "What is the difference between message queues and event streams?", answer: "Message queues (RabbitMQ, SQS) deliver each message to one consumer, with ack/nack, dead-letter queues. Event streams (Kafka, Pulsar) persist events immutably, multiple consumers can replay from any offset. Queues: point-to-point, transient. Streams: pub-sub, persistent log. Kafka is better for event sourcing, auditing; queues for task distribution.", difficulty: "hard", tags: ["distributed-systems", "architecture"] },
  ],
  "fullstack-engineer": [
    { question: "How would you handle real-time updates in a web app?", answer: "Options: 1) WebSocket (full-duplex persistent connection) — low latency, server pushes updates. 2) Server-Sent Events (SSE) — one-way server→client, simpler than WebSocket. 3) Polling — client repeatedly requests updates (simple but wasteful). 4) Webhooks — server calls external URL on events. For real-time collab (Google Docs), use WebSocket + Operational Transform or CRDT.", difficulty: "hard", tags: ["real-time", "architecture"] },
    { question: "Explain the concept of progressive enhancement.", answer: "Progressive enhancement starts with a baseline (HTML-only) that works everywhere, then layers CSS (better presentation) and JavaScript (enhanced interactivity). Opposite of graceful degradation (build full experience then handle fallbacks). Benefits: accessibility, SEO-friendly, resilient to JS failures. Modern frameworks support SSR as a form of progressive enhancement.", difficulty: "medium", tags: ["best-practices", "accessibility"] },
  ],
  "devops-engineer": [
    { question: "What is a sidecar pattern in Kubernetes?", answer: "The sidecar pattern deploys a helper container alongside the main container in the same Pod. Use cases: log collection (Fluentd), service mesh proxies (Envoy), config reloaders, secret sync. Sidecars share the same network namespace and volume. Benefits: separation of concerns, reusable infrastructure components, non-invasive to application code.", difficulty: "hard", tags: ["kubernetes", "patterns"] },
    { question: "Explain GitOps and how it works.", answer: "GitOps uses Git as the single source of truth for infrastructure and application config. A Git repo contains desired state; an operator (ArgoCD, Flux) continuously reconciles actual state with Git. Changes via PR (review + approve + merge). Benefits: audit trail, easy rollback, declarative config, developer-friendly workflows. Key principle: never manually modify production.", difficulty: "hard", tags: ["gitops", "ci-cd"] },
    { question: "What is the difference between canary and blue-green deployment?", answer: "Blue-green: two identical environments with instant switch — fast rollback (switch back), but double resource cost. Canary: incremental rollout to small subset of users — lower risk (affects few initially), but slower rollout and more complex monitoring. Canary is safer for major changes; blue-green better for quick, full rollouts.", difficulty: "medium", tags: ["deployment"] },
  ],
  "qa-engineer": [
    { question: "Explain the difference between verification and validation.", answer: "Verification checks if the product is built correctly (meets specifications) — static testing, reviews, walkthroughs. Validation checks if the right product was built (meets user needs) — dynamic testing, UAT. 'Are we building the product right?' vs 'Are we building the right product?' Both are essential for quality assurance.", difficulty: "medium", tags: ["testing-basics"] },
    { question: "What is contract testing and when would you use it?", answer: "Contract testing verifies that two services (consumer + provider) agree on API interactions. Tools: Pact, Spring Cloud Contract. Unlike integration tests (which require both services running), contract tests run independently with mocked providers/consumers. Use in microservices architectures to catch API breaking changes early in CI.", difficulty: "hard", tags: ["testing-strategy"] },
    { question: "How do you measure test coverage meaningfully?", answer: "Coverage metrics: line, branch, function, and mutation coverage. High coverage ≠ quality tests (may test wrong things). Meaningful coverage: focus on critical paths, edge cases, and risk areas. Set coverage goals per module. Mutation testing (changing code to verify tests catch it) gives better quality signal than line coverage alone.", difficulty: "medium", tags: ["testing-tools"] },
  ],
};

const difficultyWeights: Record<string, number> = { easy: 0.4, medium: 0.4, hard: 0.2 };

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateQuestions(
  templates: { question: string; answer: string; difficulty: string; tags: string[] }[],
  count: number,
  selectedTags: string[]
) {
  let pool = templates;
  if (selectedTags.length > 0) {
    pool = templates.filter((t) => t.tags.some((tag) => selectedTags.includes(tag)));
  }
  if (pool.length === 0) pool = templates;

  const result: typeof pool = [];
  const difficultyOrder = ["easy", "medium", "hard"];

  while (result.length < count) {
    for (const diff of difficultyOrder) {
      const diffPool = pool.filter((t) => t.difficulty === diff);
      if (diffPool.length === 0) continue;
      const target = Math.ceil(count * (difficultyWeights[diff] ?? 0.33));
      while (result.length < count && result.filter((r) => r.difficulty === diff).length < target && diffPool.length > 0) {
        const pick = diffPool.splice(Math.floor(Math.random() * diffPool.length), 1)[0];
        result.push(pick);
      }
    }
    if (result.length < count) {
      const remaining = pool.filter((t) => !result.includes(t));
      if (remaining.length === 0) break;
      result.push(pickRandom(remaining));
    }
  }

  return result.slice(0, count);
}

const GenerateSchema = z.object({
  categorySlug: z.string().min(1),
  tags: z.array(z.string()).default([]),
  count: z.number().int().min(1).max(50).default(5),
});

export async function POST(request: Request) {
  try {
    let body: unknown;
    try { body = await request.json(); }
    catch { return badJson(); }

    const parsed = GenerateSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { categorySlug, tags, count } = parsed.data;

    const catResult = await db
      .select()
      .from(interviewCategories)
      .where(eq(interviewCategories.slug, categorySlug))
      .limit(1);

    if (catResult.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const templates = questionTemplates[categorySlug];
    if (!templates || templates.length === 0) {
      return NextResponse.json({ error: "No templates available for this category" }, { status: 400 });
    }

    const generated = generateQuestions(templates, Math.min(count, 50), tags);

    const enriched = generated.map((g) => ({
      question: g.question,
      answer: g.answer,
      difficulty: g.difficulty,
      tags: g.tags,
    }));

    return NextResponse.json({ questions: enriched });
  } catch (error) {
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
