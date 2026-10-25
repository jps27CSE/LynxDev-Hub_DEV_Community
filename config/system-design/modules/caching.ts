import type { SdModule } from "../types";
import { defaultNode } from "@/lib/system-design/nodes";

const module: SdModule = {
  slug: "caching",
  order: 6,
  part: 1,
  partTitle: "Scaling up",
  title: "Caching",
  description:
    "Learn where to put a cache, the five caching strategies, eviction and TTL, the hard problem of invalidation, and how to survive a cache stampede.",
  story:
    "Our photo-sharing app is now behind a load balancer with three app servers, but the database is still the bottleneck. Feed views, profile lookups, photo metadata - 95% of our traffic is reads, and every single one hits the database. At 50,000 requests per second the database is at 100% utilisation and p95 latency is climbing. We don't need more machines. We need to stop asking the database the same questions over and over.",
  chapters: [
    {
      slug: "where-to-cache",
      title: "Where to Cache",
      description:
        "The four places a cache can live, and which one solves which problem.",
      children: [
        {
          slug: "client-cache",
          title: "Client-Side Cache",
          description:
            "Browser cache, app cache, CDN edge. Fastest, but you don't control it.",
        },
        {
          slug: "server-cache",
          title: "Server-Side Cache",
          description:
            "In-memory or shared cache like Redis between app and database.",
        },
      ],
    },
    {
      slug: "strategies",
      title: "Caching Strategies",
      description: "Five ways to keep a cache in sync with the database.",
      children: [
        {
          slug: "cache-aside",
          title: "Cache-Aside (Lazy Loading)",
          description:
            "App checks cache first; on miss, reads from DB and populates cache.",
        },
        {
          slug: "write-through",
          title: "Write-Through & Write-Behind",
          description: "Synchronous vs asynchronous cache updates on write.",
        },
        {
          slug: "refresh-ahead",
          title: "Refresh-Ahead",
          description: "Predictively refresh entries before they expire.",
        },
      ],
    },
    {
      slug: "invalidation",
      title: "Invalidation & Stampede",
      description: "The two problems that make caching hard in production.",
      children: [
        {
          slug: "invalidation",
          title: "Cache Invalidation",
          description:
            "How to make sure a cache doesn't serve stale data forever.",
        },
        {
          slug: "stampede",
          title: "Cache Stampede",
          description:
            "What happens when a popular key expires and everyone rushes the DB.",
        },
      ],
    },
  ],
  lessons: [
    {
      slug: "where-to-cache",
      title: "Where should the cache live?",
      attribution: "Synthesised from donnemartin/system-design-primer",
      sections: [
        {
          kind: "scenario",
          title: "The same question, asked a million times",
          body: "Your feed endpoint runs `SELECT * FROM posts ORDER BY created_at DESC LIMIT 20`. At 50,000 reads per second that is 50,000 identical queries per second hitting one database. The database does the same work 50,000 times and returns the same 20 rows 50,000 times. That is the problem a cache exists to solve.",
        },
        {
          kind: "concept",
          title: "Four places a cache can live",
          body: "Client (browser / app): stores data locally. Fastest possible, but you don't control it and it can be stale for a long time. Good for static assets and user preferences.\n\nCDN edge: serves static content from a server close to the user. Great for images, videos, JS bundles. Cannot cache personalised or dynamic data easily.\n\nApplication (in-memory or shared like Redis): sits between your app servers and the database. This is the one we are building today. It answers 'do I already know this?' before asking the database.\n\nDatabase (query cache / materialised views): the database caches its own results. Helpful but limited - it still costs a round trip and connection.",
        },
        {
          kind: "concept",
          title: "The rule of thumb",
          body: "Cache as close to the user as you can, but only as close as correctness allows. Static assets go to the CDN. Personalised reads go to a shared application cache like Redis. Never cache something you cannot afford to be slightly stale, unless you have a way to invalidate it.",
        },
        {
          kind: "diagram",
          caption:
            "Application cache sitting between app servers and the database",
          graph: {
            nodes: [
              (() => {
                const n = defaultNode("client", "client-1", 40, 200);
                (n as any).label = "Users";
                return n;
              })(),
              (() => {
                const n = defaultNode("load_balancer", "lb-1", 200, 200);
                (n as any).label = "Load Balancer";
                (n as any).algorithm = "rr";
                (n as any).rateLimitPerMin = null;
                return n;
              })(),
              (() => {
                const n = defaultNode("app_server", "app-1", 380, 120);
                (n as any).label = "App 1";
                (n as any).replicas = 1;
                (n as any).maxConcurrency = null;
                (n as any).breakerEnabled = false;
                return n;
              })(),
              (() => {
                const n = defaultNode("app_server", "app-2", 380, 200);
                (n as any).label = "App 2";
                (n as any).replicas = 1;
                (n as any).maxConcurrency = null;
                (n as any).breakerEnabled = false;
                return n;
              })(),
              (() => {
                const n = defaultNode("app_server", "app-3", 380, 280);
                (n as any).label = "App 3";
                (n as any).replicas = 1;
                (n as any).maxConcurrency = null;
                (n as any).breakerEnabled = false;
                return n;
              })(),
              (() => {
                const n = defaultNode("cache", "cache-1", 580, 200);
                (n as any).label = "Redis Cache";
                (n as any).hitRate = 0.9;
                (n as any).ttlMs = 60000;
                (n as any).stampedeGuard = true;
                return n;
              })(),
              (() => {
                const n = defaultNode("database", "db-1", 780, 200);
                (n as any).label = "Database";
                (n as any).readReplicas = 0;
                (n as any).partitions = 1;
                (n as any).hotKeyShare = 0;
                return n;
              })(),
            ] as any,
            edges: [
              {
                id: "e1",
                from: "client-1",
                to: "lb-1",
                label: null,
                retry: { attempts: 0, backoffMs: 0, jitter: false },
                partitioned: false,
              },
              {
                id: "e2",
                from: "lb-1",
                to: "app-1",
                label: null,
                retry: { attempts: 0, backoffMs: 0, jitter: false },
                partitioned: false,
              },
              {
                id: "e3",
                from: "lb-1",
                to: "app-2",
                label: null,
                retry: { attempts: 0, backoffMs: 0, jitter: false },
                partitioned: false,
              },
              {
                id: "e4",
                from: "lb-1",
                to: "app-3",
                label: null,
                retry: { attempts: 0, backoffMs: 0, jitter: false },
                partitioned: false,
              },
              {
                id: "e5",
                from: "app-1",
                to: "cache-1",
                label: null,
                retry: { attempts: 0, backoffMs: 0, jitter: false },
                partitioned: false,
              },
              {
                id: "e6",
                from: "app-2",
                to: "cache-1",
                label: null,
                retry: { attempts: 0, backoffMs: 0, jitter: false },
                partitioned: false,
              },
              {
                id: "e7",
                from: "app-3",
                to: "cache-1",
                label: null,
                retry: { attempts: 0, backoffMs: 0, jitter: false },
                partitioned: false,
              },
              {
                id: "e8",
                from: "cache-1",
                to: "db-1",
                label: null,
                retry: { attempts: 0, backoffMs: 0, jitter: false },
                partitioned: false,
              },
            ],
            scenario: {
              arrivalRate: 50000,
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
            "For our photo app, list three things you would cache and three things you would NOT cache. For each, say why.",
        },
        {
          kind: "compare",
          body: "A beginner caches everything. A senior engineer asks 'what is the cost of serving stale data here?' before adding a cache. User profile photos: stale for a minute is fine. Payment status: stale for a second is a bug.",
        },
        {
          kind: "video",
          videoId: "mzZ62duH20o",
          title:
            "System Design Basics in Bangla | Caching Strategies Explained (Read & Write Strategies)",
          caption:
            "Bangla walkthrough of cache-aside, read-through, write-through, write-behind, and write-aside.",
        },
        {
          kind: "concept",
          title: "Go deeper (free reads)",
          body: "Free reading on caching:\n\n- [donnemartin/system-design-primer — Caching](https://github.com/donnemartin/system-design-primer#caching) — the 5 strategies.\n- [When to update the cache (Primer)](https://github.com/donnemartin/system-design-primer#when-to-update-the-cache) — invalidation and stampede.\n- [System Design Handbook](https://www.systemdesignhandbook.com/) — caching patterns.\n- [Redis Caching Patterns](https://redis.io/docs/latest/develop/use/patterns/) — practical patterns.",
        },
        {
          kind: "recap",
          points: [
            "Cache reads, not writes, as a default",
            "Shared application cache (Redis) is the workhorse for personalised reads",
            "CDN for static assets, client cache for offline, DB cache as a bonus",
            "Never cache what you cannot afford to be stale",
          ],
        },
      ],
    },
    {
      slug: "the-five-strategies",
      title: "The Five Caching Strategies",
      attribution: "Synthesised from donnemartin/system-design-primer",
      sections: [
        {
          kind: "scenario",
          title: "How do we keep the cache honest?",
          body: "We decided to cache feed results. But when a user posts a new photo, the cached feed is now wrong. How do we update it? There are five common strategies, and each one makes a different trade-off between freshness, complexity, and write speed.",
        },
        {
          kind: "concept",
          title: "1. Cache-Aside (Lazy Loading)",
          body: "The most common pattern. On read: check cache. If hit, return. If miss, read from DB, write to cache, return. On write: update DB, then delete the cache key (invalidate).\n\nPros: only caches what is actually read. Simple to reason about.\nCons: first request after expiry is slow (cache miss). Cache and DB can briefly disagree.",
        },
        {
          kind: "concept",
          title: "2. Read-Through",
          body: "Like cache-aside, but the cache itself fetches from the DB on a miss, instead of the app. The app only talks to the cache.\n\nPros: app code is simpler. Cons: cache must know how to load data, which couples it to your schema.",
        },
        {
          kind: "concept",
          title: "3. Write-Through",
          body: "On write: update the cache AND the DB synchronously, in the same request. Reads are always fresh.\n\nPros: no stale reads. Cons: writes are slower because they hit two systems. If the cache fails, the write fails.",
        },
        {
          kind: "concept",
          title: "4. Write-Behind (Write-Back)",
          body: "On write: update the cache immediately, queue the DB write for later. The user sees instant success.\n\nPros: very fast writes. Cons: data can be lost if the cache dies before flushing. Risky for anything important.",
        },
        {
          kind: "concept",
          title: "5. Refresh-Ahead",
          body: "Before an entry expires, asynchronously refresh it in the background. The user never sees a miss on a hot key.\n\nPros: hot keys stay warm. Cons: you guess which keys are hot, and you do extra work refreshing keys nobody reads.",
        },
        {
          kind: "your_turn",
          prompt:
            "Our photo app has a 'trending posts' feed that is read 10,000 times per second but changes every minute. Which strategy would you pick and why? What would you NOT pick?",
        },
        {
          kind: "compare",
          body: "Cache-aside is the default because it is the simplest and degrades gracefully. Write-through is for data where staleness is unacceptable. Write-behind is for high-write, loss-tolerant data like view counts. Refresh-ahead is for predictable hot keys. Most systems mix them.",
        },
        {
          kind: "recap",
          points: [
            "Cache-aside: read misses populate the cache; writes invalidate",
            "Read-through: cache loads from DB on miss",
            "Write-through: cache and DB updated together (slow writes, fresh reads)",
            "Write-behind: cache first, DB later (fast writes, risk of loss)",
            "Refresh-ahead: refresh hot keys before they expire",
          ],
        },
      ],
    },
    {
      slug: "ttl-eviction-invalidation",
      title: "TTL, Eviction, and Invalidation",
      attribution: "Synthesised from donnemartin/system-design-primer",
      sections: [
        {
          kind: "scenario",
          title: "The cache that never forgets",
          body: "We cached a user's profile. They changed their bio. But the cache still shows the old bio because nobody told it to update. A cache without an expiry or an invalidation strategy is just a second, stale database.",
        },
        {
          kind: "concept",
          title: "TTL (Time To Live)",
          body: "Every cached entry gets an expiry time. After TTL seconds, the entry is considered stale and is removed or refreshed on next access. TTL is the simplest safety net: even if you forget to invalidate, the data self-corrects within TTL seconds.\n\nShort TTL (seconds): fresher data, more DB load. Long TTL (hours): less DB load, staler data. Pick based on how fast the underlying data changes and how bad staleness is.",
        },
        {
          kind: "concept",
          title: "Eviction Policies",
          body: "Caches have finite memory. When full, something must be evicted. Common policies:\n\nLRU (Least Recently Used): evict the entry not accessed for the longest time. The default for most caches.\n\nLFU (Least Frequently Used): evict the entry accessed the fewest times. Good when some keys are permanently hot.\n\nFIFO: evict the oldest entry. Simple but ignores access patterns.\n\nRandom: surprisingly effective and cheap to implement.",
        },
        {
          kind: "concept",
          title: "Invalidation: the hard problem",
          body: "There are only two hard problems in computer science: cache invalidation and naming things. Invalidation means telling the cache 'this data is no longer valid, drop it.'\n\nStrategies: delete on write (cache-aside), publish/subscribe (DB change triggers cache delete), versioned keys (user:42:v3, increment on change), or accept staleness within TTL.\n\nThe danger: if you invalidate too aggressively, you lose the cache benefit. If you invalidate too lazily, users see stale data. There is no perfect answer - only trade-offs.",
        },
        {
          kind: "your_turn",
          prompt:
            "A user updates their profile photo. Walk through exactly what happens to the cached profile data in cache-aside vs write-through. Which is simpler? Which is fresher?",
        },
        {
          kind: "compare",
          body: "Cache-aside invalidates by deleting the key on write; the next read repopulates it. Write-through updates the cache on write, so reads are immediately fresh but writes are slower. Most teams start with cache-aside plus a reasonable TTL and add complexity only when staleness bites.",
        },
        {
          kind: "recap",
          points: [
            "TTL is the safety net: stale data self-corrects",
            "LRU is the default eviction policy",
            "Invalidation is the hard problem - trade freshness against complexity",
            "Cache-aside + TTL covers 80% of real use cases",
          ],
        },
      ],
    },
    {
      slug: "cache-stampede",
      title: "Cache Stampede (Thundering Herd)",
      attribution: "Synthesised from donnemartin/system-design-primer",
      sections: [
        {
          kind: "scenario",
          title: "The expiry that took down the database",
          body: "A popular key (say, the trending feed) expires at 12:00:00. At 12:00:00.001, ten thousand requests arrive. All miss the cache. All hit the database simultaneously. The database, which was cruising at 5% load, suddenly gets 10,000 queries in one millisecond and falls over. This is a cache stampede, and it is the reason 'just add a cache' is not the end of the story.",
        },
        {
          kind: "concept",
          title: "Why it happens",
          body: "A cache hit is cheap. A cache miss is expensive (DB query). When a hot key expires, every concurrent request becomes a miss at the same instant. The DB receives a spike proportional to the request rate, not the miss rate. The cache was protecting the DB from steady load; expiry removes that protection for one terrible moment.",
        },
        {
          kind: "concept",
          title: "How to prevent it",
          body: "1. Locking: when a key misses, only ONE request fetches from the DB; others wait or get a stale value. (Mutex per key.)\n\n2. Early refresh: refresh the key before it expires, in the background, so it never actually expires under load.\n\n3. Stale-while-revalidate: serve the slightly stale value immediately while refreshing in the background. Users see 1-second-old data; the DB sees one query.\n\n4. Jittered TTL: add random jitter to expiry times so keys don't all expire at once.\n\n5. Never expire hot keys: keep them warm forever and invalidate manually.",
        },
        {
          kind: "concept",
          title: "The stampedeGuard knob",
          body: "In our simulator, the cache node has a `stampedeGuard` property. When enabled, a cache miss on a hot key only triggers one DB fetch; concurrent misses reuse that result instead of each hitting the DB. Toggle it and watch the DB utilisation drop during a cold start or expiry.",
        },
        {
          kind: "your_turn",
          prompt:
            "Our trending feed cache (TTL 60s) is about to expire during peak traffic (50k r/s). Describe what you would do in the next 60 seconds to prevent a stampede, and what you would change permanently.",
        },
        {
          kind: "compare",
          body: "A beginner sets a TTL and hopes. A senior engineer assumes every hot key WILL expire under load and designs for it. Stale-while-revalidate is usually the best default: users barely notice 1-second staleness, and the DB stays healthy.",
        },
        {
          kind: "recap",
          points: [
            "A hot key expiring can take down the database",
            "Stale-while-revalidate serves slightly stale data while refreshing",
            "Early refresh and jittered TTL prevent synchronized expiry",
            "Always assume hot keys will expire under load",
          ],
        },
      ],
    },
  ],
  interviewByte: {
    shape:
      "How would you cache the feed of a photo-sharing app? What are the trade-offs?",
    strongAnswer:
      "I would put a shared cache (Redis) between the app servers and the database, using cache-aside with a short TTL (e.g. 30-60s) for the feed. On read, check the cache; on miss, query the DB and populate the cache. On write (new post), invalidate the relevant feed keys. To avoid a stampede when a hot key expires, I would use stale-while-revalidate or early background refresh. The trade-off is freshness vs DB load: shorter TTL means fresher data but more DB queries; longer TTL means less load but users may see stale feeds. I would not cache personalised or write-heavy data without careful invalidation.",
    trap: "Saying 'just add Redis' without mentioning invalidation or stampede. Or caching writes and serving stale photos. Or claiming a cache makes the system consistent - it doesn't; it makes it faster at the cost of temporary inconsistency.",
  },
  task: {
    brief:
      "Reads are 95% of traffic. Make them fast without serving stale photos.",
    startGraph: {
      nodes: [
        (() => {
          const n = defaultNode("client", "client-1", 40, 200);
          (n as any).label = "Users";
          return n;
        })(),
        (() => {
          const n = defaultNode("load_balancer", "lb-1", 200, 200);
          (n as any).label = "Load Balancer";
          (n as any).algorithm = "rr";
          (n as any).rateLimitPerMin = null;
          return n;
        })(),
        (() => {
          const n = defaultNode("app_server", "app-1", 380, 120);
          (n as any).label = "App 1";
          (n as any).replicas = 1;
          (n as any).maxConcurrency = null;
          (n as any).breakerEnabled = false;
          return n;
        })(),
        (() => {
          const n = defaultNode("app_server", "app-2", 380, 200);
          (n as any).label = "App 2";
          (n as any).replicas = 1;
          (n as any).maxConcurrency = null;
          (n as any).breakerEnabled = false;
          return n;
        })(),
        (() => {
          const n = defaultNode("app_server", "app-3", 380, 280);
          (n as any).label = "App 3";
          (n as any).replicas = 1;
          (n as any).maxConcurrency = null;
          (n as any).breakerEnabled = false;
          return n;
        })(),
        (() => {
          const n = defaultNode("database", "db-1", 620, 200);
          (n as any).label = "Database";
          (n as any).readReplicas = 0;
          (n as any).partitions = 1;
          (n as any).hotKeyShare = 0;
          return n;
        })(),
      ] as any,
      edges: [
        {
          id: "e1",
          from: "client-1",
          to: "lb-1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e2",
          from: "lb-1",
          to: "app-1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e3",
          from: "lb-1",
          to: "app-2",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e4",
          from: "lb-1",
          to: "app-3",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e5",
          from: "app-1",
          to: "db-1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e6",
          from: "app-2",
          to: "db-1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e7",
          from: "app-3",
          to: "db-1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
      ],
      scenario: {
        arrivalRate: 50000,
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
          const n = defaultNode("client", "client-1", 40, 200);
          (n as any).label = "Users";
          return n;
        })(),
        (() => {
          const n = defaultNode("load_balancer", "lb-1", 200, 200);
          (n as any).label = "Load Balancer";
          (n as any).algorithm = "rr";
          (n as any).rateLimitPerMin = null;
          return n;
        })(),
        (() => {
          const n = defaultNode("app_server", "app-1", 380, 120);
          (n as any).label = "App 1";
          (n as any).replicas = 1;
          (n as any).maxConcurrency = null;
          (n as any).breakerEnabled = false;
          return n;
        })(),
        (() => {
          const n = defaultNode("app_server", "app-2", 380, 200);
          (n as any).label = "App 2";
          (n as any).replicas = 1;
          (n as any).maxConcurrency = null;
          (n as any).breakerEnabled = false;
          return n;
        })(),
        (() => {
          const n = defaultNode("app_server", "app-3", 380, 280);
          (n as any).label = "App 3";
          (n as any).replicas = 1;
          (n as any).maxConcurrency = null;
          (n as any).breakerEnabled = false;
          return n;
        })(),
        (() => {
          const n = defaultNode("cache", "cache-1", 580, 200);
          (n as any).label = "Redis Cache";
          (n as any).hitRate = 0.9;
          (n as any).ttlMs = 60000;
          (n as any).stampedeGuard = true;
          return n;
        })(),
        (() => {
          const n = defaultNode("database", "db-1", 780, 200);
          (n as any).label = "Database";
          (n as any).readReplicas = 0;
          (n as any).partitions = 1;
          (n as any).hotKeyShare = 0;
          return n;
        })(),
      ] as any,
      edges: [
        {
          id: "e1",
          from: "client-1",
          to: "lb-1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e2",
          from: "lb-1",
          to: "app-1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e3",
          from: "lb-1",
          to: "app-2",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e4",
          from: "lb-1",
          to: "app-3",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e5",
          from: "app-1",
          to: "cache-1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e6",
          from: "app-2",
          to: "cache-1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e7",
          from: "app-3",
          to: "cache-1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e8",
          from: "cache-1",
          to: "db-1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
      ],
      scenario: {
        arrivalRate: 50000,
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
        id: "add-cache",
        title: "Add a cache",
        brief:
          "Add a shared cache (Redis) between the app servers and the database.",
        hint: "Look in the Data category of the palette.",
        reveal:
          "Add a Cache node. It will sit between app servers and the database, absorbing repeated reads.",
        check: (g) => {
          const hasCache = g.nodes.some((n) => n.type === "cache");
          return {
            passed: hasCache,
            progress: hasCache ? "✓ Cache added" : "Add a cache node",
          };
        },
      },
      {
        id: "wire-cache",
        title: "Wire the cache into the read path",
        brief:
          "Route app traffic through the cache, and the cache through to the database.",
        hint: "Connect app servers → cache → database. Remove or bypass the direct app→DB edges.",
        reveal:
          "Edges should be: App → Cache → Database. If apps still connect directly to the DB, the cache is bypassed.",
        check: (g) => {
          const apps = g.nodes.filter((n) => n.type === "app_server");
          const caches = g.nodes.filter((n) => n.type === "cache");
          const dbs = g.nodes.filter((n) => n.type === "database");
          if (apps.length === 0 || caches.length === 0 || dbs.length === 0) {
            return {
              passed: false,
              progress: "Need app servers, a cache, and a database",
            };
          }
          const cacheId = caches[0].id;
          const dbId = dbs[0].id;
          const appsToCache = apps.filter((a) =>
            g.edges.some((e) => e.from === a.id && e.to === cacheId),
          ).length;
          const cacheToDb = g.edges.some(
            (e) => e.from === cacheId && e.to === dbId,
          );
          if (appsToCache < apps.length) {
            return {
              passed: false,
              progress: `${appsToCache} of ${apps.length} app servers connected to cache`,
            };
          }
          if (!cacheToDb) {
            return {
              passed: false,
              progress: "Connect the cache to the database",
            };
          }
          return { passed: true, progress: "✓ Cache is in the read path" };
        },
      },
    ],
    passCriteria: [
      {
        id: "fast-reads",
        label: "p95 < 150 ms at 50,000 reads/s",
        required: true,
        explain:
          "With a 90% cache hit rate, most reads never reach the database, so p95 should drop well below 150 ms.",
        assert: (r) => r.valid && r.latency.p95 < 150,
      },
      {
        id: "db-idle",
        label: "Database utilisation < 10%",
        required: true,
        explain:
          "The cache's job is to absorb reads so the database stays nearly idle. If the DB is still busy, the cache is bypassed or misconfigured.",
        assert: (r) => {
          const db = r.perNode.find((n) => n.id === "db-1");
          return !!db && db.utilisation < 0.1;
        },
      },
      {
        id: "no-stale-reads",
        label: "0 stale reads",
        required: true,
        explain:
          "A cache must not serve stale photos. If reads are going through a lagging replica or an uninvalidated key, stale count rises.",
        assert: (r) => (r.errorClasses?.stale ?? 0) === 0,
      },
    ],
  },
  recap: [
    "Cache reads, not writes, as a default",
    "Cache-aside + TTL covers most real use cases",
    "Invalidation is the hard problem - trade freshness against complexity",
    "A hot key expiring can take down the database (stampede)",
    "Stale-while-revalidate keeps users happy and the DB healthy",
  ],
  attribution:
    "Synthesised from donnemartin/system-design-primer (375k★), algomaster.io and KodeKloud System Design For Beginners",
};

export default module;
