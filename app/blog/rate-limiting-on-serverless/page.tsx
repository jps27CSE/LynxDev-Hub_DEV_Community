import type { Metadata } from "next";
import { CodeBlock as Code } from "@/components/code-block";
import { BlogLayout } from "@/components/blog/BlogLayout";
import { getPost } from "@/config/blog";
import { buildPostJsonLd, buildPostMetadata } from "@/lib/blog-seo";
import { JsonLd } from "@/components/blog/JsonLd";
import { Callout } from "@/components/blog/Callout";
import {
  P,
  H2,
  H3,
  UL,
  OL,
  LI,
  Lead,
  Fact,
  InlineCode as C,
} from "@/components/blog/Prose";

const SLUG = "rate-limiting-on-serverless";
const POST = getPost(SLUG)!;

export const metadata: Metadata = buildPostMetadata(POST);

export default function RateLimitingServerless() {
  return (
    <BlogLayout meta={POST} toc={POST.toc}>
      <JsonLd data={buildPostJsonLd(POST)} />
      <Lead>
        Every rate limiter tutorial uses a Map. On a long-running Node server
        that works. On a serverless platform it is not slow or approximate — it
        is{" "}
        <em>not a rate limiter at all</em>, and it fails silently in the exact
        direction that costs you money.
      </Lead>

      <P>
        LynxDEV has two AI-backed endpoints. Their limit is not a nicety: it is
        the primary control on spend. This post covers why the obvious
        implementations are wrong under serverless, and the one we shipped
        instead.
      </P>

      <H2 id="the-problem">Why the in-memory limiter is a fiction</H2>

      <P>
        A <C>Map</C> keyed by user id, incremented per request, lives inside one
        process. On serverless, requests are distributed across many short-lived
        instances, each with its own heap.
      </P>

      <P>
        A user allowed 5 requests per minute who gets routed to four instances
        does not get 5 requests. They get 20 — 5 on each. Worse, the limits are
        per instance, so a burst scales the allowance <em>linearly with load</em>{" "}
        exactly when you most need it flat.
      </P>

      <Callout tone="warning">
        The failure mode is asymmetric and expensive. Under-reporting a breach
        costs you nothing; under-enforcing one costs real money on every request
        you failed to block.
      </Callout>

      <P>
        The usual workaround is a shared store — Redis, Upstash, KV. That is the
        right answer for most teams and adds an operational dependency we did
        not want for a single counter.
      </P>

      <H2 id="the-table">What the store actually needs to do</H2>

      <P>
        We already have a database. The requirements for a correct limiter are
        narrow:
      </P>

      <OL>
        <LI>Be global across all instances.</LI>
        <LI>Be atomic — no read-modify-write window.</LI>
        <LI>Not grow without bound.</LI>
        <LI>Fail in a direction we choose deliberately.</LI>
      </OL>

      <P>
        One table row per (user, scope) satisfies all four. Note point three:
        one row per <em>user and scope</em>, never per request. A fixed window
        overwrites itself when it expires, so the table size is bounded by
        distinct users regardless of traffic volume.
      </P>

      <Code language="typescript">{`export const rateLimits = mysqlTable("rate_limits", {
  bucket: varchar("bucket", { length: 255 }).primaryKey(),
  window_start: bigint("window_start", { mode: "number" }).notNull(),
  count: int().notNull().default(0),
});`}</Code>

      <P>
        The bucket key encodes all three dimensions —{" "}
        <C>user:&#123;userId&#125;:&#123;scope&#125;</C> — so a user hitting the
        mentor endpoint does not consume their progress budget.
      </P>

      <H2 id="the-window">Fixed windows, and why the window is computed client-side</H2>

      <P>
        The window start is not stored as &ldquo;when did this bucket begin&rdquo;
        and compared against <C>now()</C>. It is{" "}
        <em>quantized</em>:
      </P>

      <Code language="typescript">{`const windowStart = Math.floor(Date.now() / windowMs) * windowMs;
const bucket = \`user:\${userId}:\${scope}\`;`}</Code>

      <P>Two properties fall out of this:</P>

      <UL>
        <LI>
          <strong>Expiry needs no cleanup job.</strong> An old window is simply
          never compared equal again, and the next write overwrites it. No cron,
          no <C>DELETE</C>, no table growth.
        </LI>
        <LI>
          <strong>The reset time is exact.</strong> It is{" "}
          <C>windowStart + windowMs</C>, so the <C>Retry-After</C> header we
          return is the true boundary rather than an estimate.
        </LI>
      </UL>

      <P>
        The trade-off is real and worth stating: fixed windows allow a burst of{" "}
        <C>2 × limit</C> across a boundary — 5 requests at 11:59:59 and 5 more at
        12:00:01. Sliding windows or token buckets eliminate this at the cost of
        real state and more read-modify-write risk. For abuse control on
        self-service endpoints, the boundary burst is an acceptable trade for a
        fully atomic single statement.
      </P>

      <H2 id="atomicity">The interesting part — increment and read in one statement</H2>

      <P>
        The naive version is wrong and wrong in a way that looks correct:
      </P>

      <Code language="sql">{`-- DO NOT SHIP THIS
SELECT count FROM rate_limits WHERE bucket = ?;        -- reads N
-- ... time passes, other requests land ...
UPDATE rate_limits SET count = N + 1 WHERE bucket = ?; -- writes N+1, losing every
                                                           -- concurrent increment`}</Code>

      <P>
        Under concurrency that loses updates, so the limiter under-counts and
        lets bursts through. The fix is to never read and never write
        separately — do both in one atomic statement.
      </P>

      <P>
        MySQL and TiDB have no <C>INSERT ... RETURNING</C>, so the usual answer is
        to upsert and then select the row. That reintroduces the race. Instead we
        use the <C>LAST_INSERT_ID()</C> trick: the server maintains a
        per-connection variable, and setting it as part of the upsert makes the
        new value readable on the <em>same pinned connection</em> that performed
        the write.
      </P>

      <Code language="sql">{`INSERT INTO rate_limits (bucket, window_start, count)
VALUES (?, ?, LAST_INSERT_ID(1))
ON DUPLICATE KEY UPDATE
  count = LAST_INSERT_ID(
    IF(window_start >= ?, count + 1, 1)      -- same window: increment
  ),
  window_start = IF(
    window_start >= ?,                        -- same window: keep
    window_start,                             -- expired: reset to new window
    ?
  )`}</Code>

      <P>Then read the value straight back on that connection:</P>

      <Code language="typescript">{`const count = await db.transaction(async (tx) => {
  await tx.execute(sql\`INSERT INTO rate_limits ... ON DUPLICATE KEY UPDATE ...\`);
  const rows = await tx.execute(sql\`SELECT LAST_INSERT_ID() AS c\`);
  const result = rows as unknown as Array<Array<{ c: number }>>;
  return result[0]?.[0]?.c ?? 1;
});`}</Code>

      <Callout tone="note">
        The explicit transaction matters only because it pins both statements to
        one connection. On a pool, two separate awaits could land on different
        connections, and <C>LAST_INSERT_ID()</C> would read someone else&apos;s
        value. The transaction is not there for atomicity of the data — the
        upsert already provides that — it is there for connection affinity.
      </Callout>

      <P>
        The <C>IF(window_start &gt;= ?)</C> comparison is doing double duty: it
        decides whether to increment or reset, and it updates{" "}
        <C>window_start</C> to match. Every concurrent caller receives exactly
        its own position in the sequence, so there is no read of a stale count.
      </P>

      <H2 id="fail-closed">Choosing the failure direction</H2>

      <P>
        If the database is unreachable, the limiter has two honest options: let
        the request through, or reject it. We reject — the function throws and
        the route returns a 500.
      </P>

      <Callout tone="trap">
        <p>
          Fail-open looks friendlier and is the wrong default here. A limiter
          that silently disables itself under load is an outage you discover on
          an invoice.
        </p>
        <p className="mt-2">
          The important part is that this is a{" "}
          <em>deliberate, documented choice</em>, not an accident of error
          handling. &ldquo;Fails closed&rdquo; in a comment above the{" "}
          <C>throw</C> is what makes it reviewable.
        </p>
      </Callout>

      <H2 id="where-it-runs">Where the check belongs</H2>

      <P>
        Our middleware is auth-only — it verifies the session and nothing else.
        The rate limit check lives in each route handler, after authentication,
        because that is where we know the user id.
      </P>

      <Code language="typescript">{`export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  const admin = await isAdmin(userId);
  if (!admin) return forbidden();

  const limited = await enforceDbRateLimit(userId, "admin-site-notice", path, "PATCH");
  if (limited) return limited;

  // ... validate, execute
}`}</Code>

      <P>
        Authenticate first, then limit. The other order lets an unauthenticated
        caller burn database round-trips before being rejected — which means the
        limiter itself becomes the attack surface.
      </P>

      <H3>Why the database write is acceptable here</H3>

      <P>
        A rate-limit check costs one upsert. That is not free, and it is worth
        being honest about the trade: we are paying one round-trip to protect
        endpoints that cost far more than a round-trip to serve. Applying it
        indiscriminately to every request would be a net loss.
      </P>

      <P>
        So limits are configured per route, and only where the cost is
        asymmetric — AI calls, writes that trigger side effects, anything a
        client could loop. Cheap reads are governed by caching instead.
      </P>

      <H2 id="responding">Responding properly</H2>

      <P>
        A 429 without usable headers forces clients into guesswork. We return the
        full state:
      </P>

      <Code language="typescript">{`return NextResponse.json(
  { error: "Too many requests. Please slow down." },
  {
    status: 429,
    headers: {
      "Retry-After": String(Math.max(1, Math.ceil(retryAfterSeconds))),
      "X-RateLimit-Limit": String(limit),
      "X-RateLimit-Remaining": String(remaining),
      "X-RateLimit-Reset": String(Math.ceil(resetMs / 1000)),
    },
  },
);`}</Code>

      <P>
        <C>Retry-After</C> is the one that matters for correctness, and it is
        exact because of the quantized window. The rest is observability.
      </P>

      <H2 id="takeaways">Takeaways</H2>

      <UL>
        <LI>
          In-memory limiting is per-instance. On serverless that means the limit
          scales with traffic.
        </LI>
        <LI>
          One row per (user, scope), not per request — the table stays bounded by
          user count.
        </LI>
        <LI>
          Quantize the window and expiry becomes free: no cleanup job, and the
          reset time is exact.
        </LI>
        <LI>
          Never read-modify-write. Use <C>LAST_INSERT_ID()</C> inside a pinned
          transaction to get the increment back without a second round-trip.
        </LI>
        <LI>
          Decide the failure direction on purpose. Ours is closed, and we say so
          in a comment.
        </LI>
        <LI>
          Limit where it is worth the round-trip, not on every request.
        </LI>
      </UL>
    </BlogLayout>
  );
}