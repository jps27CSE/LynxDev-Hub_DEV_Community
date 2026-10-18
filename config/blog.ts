export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  author: string;
  description: string;
  tags: string[];
  /**
   * Chapter list for the sticky rail. Each `id` must match an `id` prop on an
   * `H2`/`H3` in the post body. Anchors are hand-maintained, so
   * `scripts/check-blog-toc.ts` verifies every entry resolves against the
   * rendered HTML — a stale id produces a dead link rather than a visible error.
   */
  toc: { id: string; title: string; depth: 2 | 3 }[];
};

/**
 * Single source of truth for the engineering blog.
 *
 * Posts are authored as static Server Components under `app/blog/<slug>/page.tsx`
 * rather than as markdown. That trades file portability for total control over
 * typography, callouts and inline runnable code — and for a build with no
 * markdown parser anywhere in the request path.
 */
export const POSTS: PostMeta[] = [
  {
    slug: "designing-scalable-architecture",
    title: "Designing a Clean, Scalable Architecture for Learning Platforms",
    date: "2026-10-08",
    readTime: "13 min read",
    author: "LynxDEV Engineering",
    description:
      "How we structure a server-first codebase: domain colocation, explicit boundaries, and the rules that keep it legible as the app grows.",
    tags: ["architecture", "nextjs", "project-structure", "design"],
    toc: [
      {
        id: "the-problem",
        title: "The problem: boundaries erode quietly",
        depth: 2,
      },
      {
        id: "principle-1",
        title: "Put authorization beside the data",
        depth: 2,
      },
      {
        id: "principle-2",
        title: "Colocate by feature, not by layer",
        depth: 2,
      },
      {
        id: "principle-3",
        title: "Server-first, push interactivity down",
        depth: 2,
      },
      { id: "principle-4", title: "Separate error from empty", depth: 2 },
      { id: "principle-5", title: "Make config explicit and typed", depth: 2 },
      { id: "principle-6", title: "Prefer boring, obvious code", depth: 2 },
      { id: "testing", title: "Testing: the honest gap", depth: 2 },
      { id: "takeaways", title: "Takeaways", depth: 2 },
    ],
  },
  {
    slug: "caching-strategies-nextjs-app-router",
    title: "Caching in Next.js: The Four Layers, and How to Choose",
    date: "2026-10-10",
    readTime: "14 min read",
    author: "LynxDEV Engineering",
    description:
      "Request dedup, the cross-request data cache, route caching and the client router cache — with the two caching bugs we shipped and how we found them.",
    tags: ["caching", "nextjs", "performance"],
    toc: [
      {
        id: "why-it-matters",
        title: "Why caching deserves more than a config flag",
        depth: 2,
      },
      { id: "the-four-layers", title: "The four layers", depth: 2 },
      {
        id: "one-distinction",
        title: "The one distinction that prevents most mistakes",
        depth: 3,
      },
      { id: "layer-1-react-cache", title: "Layer 1 — React cache()", depth: 2 },
      {
        id: "preloading",
        title: "Preloading, and the waterfall it prevents",
        depth: 3,
      },
      {
        id: "layer-2-data-cache",
        title: "Layer 2 — the cross-request data cache",
        depth: 2,
      },
      {
        id: "why-version",
        title: "Why version, and not just tags, for seed content",
        depth: 3,
      },
      {
        id: "why-ttl",
        title: "Why TTL is a backstop, not the primary mechanism",
        depth: 3,
      },
      {
        id: "shared-references",
        title: "Why cached values are shared references",
        depth: 3,
      },
      {
        id: "layer-3-route-cache",
        title: "Layer 3 — the full route cache",
        depth: 2,
      },
      {
        id: "suspense-first",
        title: "Suspense boundaries change the caching question",
        depth: 3,
      },
      {
        id: "layer-4-router-cache",
        title: "Layer 4 — the client router cache",
        depth: 2,
      },
      {
        id: "the-migration",
        title: "Next.js 16 replaced most of this",
        depth: 2,
      },
      {
        id: "invalidation-semantics",
        title: "Invalidation semantics worth memorising",
        depth: 3,
      },
      {
        id: "nesting-rule",
        title: "The nesting rule that will bite you",
        depth: 3,
      },
      {
        id: "short-lifetimes",
        title: "Short lifetimes quietly change what gets prerendered",
        depth: 3,
      },
      { id: "how-we-decide", title: "How we decide, in practice", depth: 2 },
      {
        id: "two-questions",
        title: "The two questions that settle it",
        depth: 3,
      },
      {
        id: "verification",
        title: "Verification is part of the change",
        depth: 3,
      },
      {
        id: "anti-patterns",
        title: "Anti-patterns we have stopped doing",
        depth: 2,
      },
      { id: "takeaways", title: "Takeaways", depth: 2 },
    ],
  },
  {
    slug: "server-client-boundary",
    title: "The Server/Client Boundary Is a Type Error You Cannot See",
    date: "2026-10-12",
    readTime: "9 min read",
    author: "LynxDEV Engineering",
    description:
      "One value import dragged a database driver into the browser bundle while tsc stayed green. The rules we adopted to make that boundary enforceable.",
    tags: ["react", "nextjs", "bundling", "architecture", "security"],
    toc: [
      { id: "what-happened", title: "What happened", depth: 2 },
      {
        id: "why-tsc-passed",
        title: "Why the type checker was right to pass",
        depth: 2,
      },
      {
        id: "the-fix",
        title: "The fix, and why we moved the constant",
        depth: 2,
      },
      { id: "the-rules", title: "The rules we adopted", depth: 2 },
      {
        id: "server-only",
        title: "The tool we should have reached for first",
        depth: 2,
      },
      { id: "broader", title: "The general shape of this bug", depth: 2 },
    ],
  },
  {
    slug: "rate-limiting-on-serverless",
    title: "Rate Limiting That Survives Serverless",
    date: "2026-10-14",
    readTime: "10 min read",
    author: "LynxDEV Engineering",
    description:
      "Why an in-memory limiter is not a rate limiter on serverless, and how to build a global fixed-window one out of a single table row.",
    tags: ["security", "serverless", "databases", "reliability"],
    toc: [
      {
        id: "the-problem",
        title: "Why the in-memory limiter is a fiction",
        depth: 2,
      },
      {
        id: "the-table",
        title: "What the store actually needs to do",
        depth: 2,
      },
      {
        id: "the-window",
        title: "Fixed windows, and why the window is computed client-side",
        depth: 2,
      },
      {
        id: "atomicity",
        title: "Increment and read in one statement",
        depth: 2,
      },
      { id: "fail-closed", title: "Choosing the failure direction", depth: 2 },
      { id: "where-it-runs", title: "Where the check belongs", depth: 2 },
      { id: "responding", title: "Responding properly", depth: 2 },
      { id: "takeaways", title: "Takeaways", depth: 2 },
    ],
  },
  {
    slug: "sandboxed-code-execution",
    title: "Running Untrusted Code in the Browser Without a Server",
    date: "2026-10-16",
    readTime: "10 min read",
    author: "LynxDEV Engineering",
    description:
      "Web Workers, opaque-origin iframes and global shadowing — a layered sandbox for executing learner code, and the feature costs it imposes.",
    tags: ["security", "javascript", "web-workers", "architecture"],
    toc: [
      { id: "the-options", title: "The options, honestly", depth: 2 },
      { id: "worker", title: "Layer one — the Web Worker", depth: 2 },
      {
        id: "globals",
        title: "Layer two — shadowing what the worker still has",
        depth: 2,
      },
      {
        id: "iframe",
        title: "Layer three — opaque origins for HTML",
        depth: 2,
      },
      {
        id: "persistence",
        title: "The part people forget: code persists",
        depth: 2,
      },
      { id: "layered", title: "The layers, collected", depth: 2 },
      { id: "takeaways", title: "Takeaways", depth: 2 },
    ],
  },
];

export function getPost(slug: string): PostMeta | undefined {
  return POSTS.find((post) => post.slug === slug);
}

export function getSortedPosts(): PostMeta[] {
  return [...POSTS].sort((a, b) => b.date.localeCompare(a.date));
}
