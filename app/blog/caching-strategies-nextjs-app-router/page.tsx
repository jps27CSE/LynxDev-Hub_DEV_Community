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

const SLUG = "caching-strategies-nextjs-app-router";
const POST = getPost(SLUG)!;

export const metadata: Metadata = buildPostMetadata(POST);

export default function CachingDeepDive() {
  return (
    <BlogLayout meta={POST} toc={POST.toc}>
      <JsonLd data={buildPostJsonLd(POST)} />
      <Lead>
        Caching is where most Next.js performance advice goes wrong, because
        most of it stops at one layer. The App Router has four, they interact,
        and the one that bites you is usually not the one you were told to worry
        about.
      </Lead>

      <P>
        This post walks all four, then shows the two caching bugs we shipped to
        production on LynxDEV and how we found them — including one that made
        four fully static pages quietly billable.
      </P>

      <H2 id="why-it-matters">Why caching deserves more than a config flag</H2>

      <P>
        Caching is the highest-leverage performance tool in this stack and the
        easiest to get quietly wrong, because a cache that is misconfigured
        almost never fails. It serves the wrong data, or serves right data too
        slowly, and the symptom is a vague sense that things feel off.
      </P>

      <P>
        There is also a subtler cost. In this architecture, a cache entry is not
        free — it is a database round-trip you chose not to make. So caching is
        also how you decide <em>where your infrastructure budget goes</em>. A
        page that renders from cache costs a fraction of one that does not.
        Getting this right is not an optimization pass at the end; it is a
        design decision made at the start.
      </P>

      <H2 id="the-four-layers">The four layers</H2>

      <P>
        Every cache in the App Router answers a different question. Before
        choosing one, it helps to name what each one is keyed on and how long it
        lives.
      </P>

      <div className="my-8 rounded-xl border border-border/40 overflow-hidden">
        <Fact label="React cache()">
          Keyed on function arguments. Lives for one request. Deduplicates work.
        </Fact>
        <Fact label="Data cache">
          Keyed on the wrapped function + key parts. Cross-request and survives
          deploys. This is <C>unstable_cache</C>.
        </Fact>
        <Fact label="Full route cache">
          Keyed on the URL path plus the route's build ID. Stores rendered HTML
          and the RSC payload. This is what ISR revalidates.
        </Fact>
        <Fact label="Router cache">
          Client-side only. Keyed on visited routes. Backs instant client-side
          navigation.
        </Fact>
      </div>

      <Callout tone="note">
        These are not alternatives. A single request can pass through all four,
        and a bug in one can be masked by another. That is exactly what happened
        to us.
      </Callout>

      <H3 id="one-distinction">
        The one distinction that prevents most mistakes
      </H3>

      <P>
        Layers 1 and 2 are <strong>yours</strong>. Layers 3 and 4 are{" "}
        <strong>the framework&apos;s</strong>, driven by what your render
        touches. The single most common confusion is treating a <C>cache()</C>{" "}
        wrapper as a static-rendering tool — it is not. It deduplicates work
        inside one request and does nothing about how the route is cached or
        revalidated.
      </P>

      <P>
        Conversely, a route being static does not mean its data is cached at the
        data layer — it means the rendered output is. If two routes share one
        accessor and you want to invalidate them independently, a tag on the
        data layer is the right tool; invalidating by path would be both less
        precise and more expensive.
      </P>

      <H2 id="layer-1-react-cache">
        Layer 1 — React <C>cache()</C> (request scope)
      </H2>

      <P>
        This is not a cache in the performance sense. It is request-scoped
        memoization. Two components in the same render pass that call{" "}
        <C>getCourse(7)</C> get one database query, not two.
      </P>

      <P>
        It exists because Server Components can read data independently — you
        are not obliged to fetch at the top and thread props downward. When each
        component fetches what it needs, dedup becomes your problem, and{" "}
        <C>cache()</C> solves it without a context provider or prop drilling.
      </P>

      <P>
        On LynxDEV every data accessor in <C>lib/</C> is wrapped in it. The
        dashboard's welcome banner and status strip both need the user row;
        without the wrapper that is two queries per page view.
      </P>

      <Callout tone="warning">
        <C>cache()</C> is scoped to a single request. It does not reduce
        database load across users, and it will not make a page static. If you
        are reaching for it to "make things faster," you picked the wrong layer.
      </Callout>

      <H3 id="preloading">Preloading, and the waterfall it prevents</H3>

      <P>
        <C>cache()</C> also unlocks the preload pattern. Start the request
        before the work that blocks you, then read it later — the render picks
        up the already in-flight promise instead of starting a second one.
      </P>

      <P>
        Without preloading, a component that renders after blocking work starts
        its query late even though its inputs were already available. That is
        the classic server-component waterfall: not N+1 at the SQL layer, but a
        serial chain of awaits in the render tree.
      </P>

      <H2 id="layer-2-data-cache">Layer 2 — the cross-request data cache</H2>

      <P>
        Our course catalog, chapter content, problem statements and interview
        questions are authored once and never change at runtime. Re-querying
        them on every page view is pure waste. This is the layer that fixed it.
      </P>

      <P>
        The whole abstraction in <C>lib/content-cache.ts</C> is 32 lines,
        because the underlying primitive is one function:
      </P>

      <Code language="typescript">{`import { unstable_cache } from "next/cache";

export function createContentCache({ tag, version, ttl }: ContentCacheConfig) {
  return function withContentCache<T>(key: string, fn: () => Promise<T>) {
    return unstable_cache(fn, [key, String(version)], {
      tags: [tag],
      revalidate: ttl, // number of seconds, or false = indefinite
    })();
  };
}`}</Code>

      <P>
        Three decisions are baked in there, and each one is worth defending.
      </P>

      <H3 id="why-version">Why version, and not just tags, for seed content</H3>

      <P>
        The tag exists so an admin endpoint can invalidate on demand. But seed
        scripts run outside the Next.js runtime — a Node script calling Drizzle
        has no access to <C>revalidateTag()</C>. So content changes driven by a
        re-seed are invalidated by bumping <C>version</C>, which becomes part of
        the cache key. Old entries become unreachable rather than deleted.
      </P>

      <P>
        That is the entire invalidation strategy for immutable content:{" "}
        <C>version: 1</C> today, <C>version: 2</C> after the next curriculum
        change. No timer, no staleness window.
      </P>

      <H3 id="why-ttl">Why TTL is a backstop, not the primary mechanism</H3>

      <P>
        For courses we pass <C>ttl: false</C> — cache indefinitely. The only
        reason to ever want a TTL is as insurance against a failed invalidation.
        For content that genuinely changes (a global notice, for example) we use
        a real TTL and accept the cost that comes with it.
      </P>

      <Callout tone="trap" title="The ISR window trap">
        <p>
          We set a site-notice cache TTL to 60 seconds. That TTL lives inside a
          function called from the root layout — and a <C>revalidate</C> value
          propagates up to the enclosing route. One number in a data-access file
          silently converted four fully static routes into per-minute
          revalidation.
        </p>
        <p className="mt-2">
          We caught it by diffing the <C>npm run build</C> route table, which
          had silently changed from <C>○ (Static)</C> to a revalidate column.
          Reading the build output is now part of our definition of done for any
          cache change.
        </p>
      </Callout>

      <H3 id="shared-references">Why cached values are shared references</H3>

      <P>
        A cross-request cache hands the <em>same object</em> to every caller. If
        a Server Component mutates that object in place, it corrupts the cache
        for every subsequent request — and the corruption is invisible, because
        it only shows up for the next user.
      </P>

      <P>
        We document this on the factory itself rather than leaving it to be
        rediscovered: treat results as read-only, or copy at the boundary. The
        note costs two lines and removes a class of bug that is genuinely hard
        to trace.
      </P>

      <H2 id="layer-3-route-cache">Layer 3 — the full route cache</H2>

      <P>
        A route is static if nothing in its render touches request-time APIs.
        Static routes are prerendered at build time and revalidated on a
        schedule; dynamic routes render per request.
      </P>

      <P>
        The practical question is not "should this page be dynamic?" but "what
        is the smallest dynamic region?" A dashboard whose entire tree is
        dynamic pays for that on every navigation, even when only one card needs
        the user record.
      </P>

      <P>
        Our answer is Suspense boundaries. Static chrome renders immediately;
        the user-specific islands stream in behind a skeleton.
      </P>

      <Code language="tsx">{`<Suspense fallback={<ContinueLearningSkeleton />}>
  <ContinueLearning email={email} />
</Suspense>

<Suspense fallback={<StatCardSkeleton />}>
  <InterviewStats />
</Suspense>`}</Code>

      <P>
        Each boundary is an independent streaming unit. A slow interview-stats
        query delays one card, not the page.
      </P>

      <Callout tone="note">
        Related pitfall: <C>Promise.all</C> fails the whole batch if one promise
        rejects. If the stats cards degrade independently,{" "}
        <C>Promise.allSettled</C> is the honest choice — you keep the cards that
        worked.
      </Callout>

      <H3 id="suspense-first">
        Suspense boundaries change the caching question
      </H3>

      <P>
        Once a slow section sits behind its own boundary, it stops blocking the
        page — which invites the question of whether it needs caching at all. In
        our dashboard the answer was no: those cards are cheap queries, and
        caching them would mean an invalidation path for a difference nobody
        could perceive.
      </P>

      <P>
        The order of reasoning matters here. Reach for a boundary first (it is
        free and always correct), measure, and only then consider caching. The
        reverse order — adding a cache and then a boundary — usually leaves an
        unnecessary cache behind.
      </P>

      <Callout tone="tip">
        A useful rule of thumb: if the section renders fast enough that the
        skeleton is barely visible, caching it buys nothing real and costs you a
        staleness decision you must maintain forever.
      </Callout>

      <H2 id="layer-4-router-cache">Layer 4 — the client router cache</H2>

      <P>
        This one lives in the browser and holds previously visited routes, which
        is why navigation feels instant. It is also the layer people
        accidentally fight by sprinkling <C>router.refresh()</C> everywhere.
      </P>

      <P>
        We keep it simple: server components own data, and anything genuinely
        live (the AI mentor stream) is client state by design. We do not mirror
        server data into client state, because the moment you do, you own two
        sources of truth and a synchronization bug.
      </P>

      <H2 id="the-migration">Next.js 16 replaced most of this</H2>

      <P>
        Worth being explicit, since our code above uses the older API:{" "}
        <C>unstable_cache</C> is legacy in Next.js 16. It has been superseded by
        Cache Components — a declarative model built on the <C>'use cache'</C>{" "}
        directive, with <C>cacheLife()</C> for lifetime and <C>cacheTag()</C>{" "}
        for invalidation. Cache Components becomes the default in Next.js 17.
      </P>

      <P>The mechanical translation looks like this:</P>

      <Code language="typescript">{`// Before
const getCachedUser = unstable_cache(
  async (id: string) => queryUser(id),
  ["user"],
  { tags: ["users"], revalidate: 60 },
);

// After
async function getCachedUser(id: string) {
  "use cache";
  cacheTag("users");
  cacheLife({ revalidate: 60 });
  return queryUser(id);
}`}</Code>

      <P>The differences that actually change how you write it:</P>

      <UL>
        <LI>
          <strong>No manual keys.</strong> The cache key is derived from
          arguments and closures, so the <C>keyParts</C> array disappears.
        </LI>
        <LI>
          <strong>Lifetime is explicit at the call site.</strong> The docs
          recommend setting <C>cacheLife</C> in every scope rather than
          inheriting the <C>default</C> profile — an implicit 15-minute lifetime
          nested three levels deep is not something you can reason about.
        </LI>
        <LI>
          <strong>Storage differs.</strong> <C>use cache</C> defaults to
          in-memory per instance, which does not survive serverless instances or
          deploys. <C>unstable_cache</C> persists. If you rely on{" "}
          <C>unstable_cache</C>'s persistence today, that is a real migration
          concern, not a cosmetic one.
        </LI>
      </UL>

      <H3 id="invalidation-semantics">
        Invalidation semantics worth memorising
      </H3>

      <div className="my-8 rounded-xl border border-border/40 overflow-hidden">
        <Fact label="updateTag(tag)">
          Expires immediately. Read-your-own-writes — the author sees their edit
          on the next render. Server Actions only.
        </Fact>
        <Fact label="revalidateTag(tag)">
          Serves stale while refreshing in the background. Correct for content
          where a short delay is fine.
        </Fact>
        <Fact label="revalidatePath(path)">
          Invalidates a route. Less precise than a tag when several routes share
          the same data.
        </Fact>
      </div>

      <P>
        We hit this during the site-notice work: <C>revalidateTag</C> in Next 16
        takes a second argument, and <C>updateTag</C> — the primitive we
        actually wanted — is Server-Action-only. From a Route Handler the
        correct call is <C>revalidateTag(tag, &#123; expire: 0 &#125;)</C>. This
        is the kind of detail that is invisible until an admin clicks Save and
        nothing updates.
      </P>

      <Callout
        tone="trap"
        title="Invalidation must not be able to fail the write"
      >
        <p>
          We deliberately placed <C>revalidateTag</C> outside the <C>try</C>{" "}
          block that wraps the write. The row is already committed — if cache
          invalidation throws, the correct response is{" "}
          <em>report success and let the TTL backstop cover it</em>, not a 500.
        </p>
        <p className="mt-2">
          A 500 there would tell the admin to retry, which re-bumps{" "}
          <C>updated_at</C> and re-announces a notice that people had already
          dismissed. Correctness of the write outranks freshness of the cache.
        </p>
      </Callout>

      <H3 id="nesting-rule">The nesting rule that will bite you</H3>

      <P>
        A cached scope with no explicit <C>cacheLife</C> inherits <C>default</C>{" "}
        (15 minutes), and an inner cache with a <em>shorter</em> lifetime
        silently drags the outer one down with it. An inner cache can only ever
        shorten the outer scope, never extend it. Next throws a prerender error
        for the accidental version of this, which is one of the better error
        messages in the framework.
      </P>

      <H3 id="short-lifetimes">
        Short lifetimes quietly change what gets prerendered
      </H3>

      <P>
        This one is worth internalising because it is invisible in the code.
        Cache lifetime determines whether cached content is eligible for
        prerendering at all. A <C>revalidate</C> of zero, or an <C>expire</C>{" "}
        under five minutes, turns a would-be-static region into a{" "}
        <strong>dynamic hole</strong> resolved at request time. A <C>stale</C>{" "}
        under thirty seconds drops it from prerenders entirely, because a
        prefetch would expire before the user could click.
      </P>

      <P>
        So a seemingly harmless lifetime tweak — &ldquo;let&apos;s make this
        fresher, one minute instead of an hour&rdquo; — can move a region from
        build-time output to per-request compute. That is how a small config
        change turns into a large infrastructure bill.
      </P>

      <Callout tone="warning">
        This is the mechanism behind the bug described above. The same principle
        applies in <C>use cache</C>: lifetime is not just a freshness knob, it
        is a rendering-mode selector.
      </Callout>

      <H2 id="how-we-decide">How we decide, in practice</H2>

      <P>
        The rule we actually use is not technical, it is about staleness
        tolerance:
      </P>

      <OL>
        <LI>
          <strong>Never changes at runtime?</strong> Cross-request cache,
          indefinite TTL, version-bump invalidation. Courses, chapters,
          problems.
        </LI>
        <LI>
          <strong>Changes, but staleness is tolerable?</strong> Cross-request
          cache with a TTL and tag, invalidated on write. The notice banner.
        </LI>
        <LI>
          <strong>Per-user and must be fresh?</strong> Request scope only —
          <C>cache()</C>, no cross-request layer. Progress, enrollments, points.
        </LI>
        <LI>
          <strong>Live by nature?</strong> No cache. The mentor stream, progress
          writes.
        </LI>
      </OL>

      <H3 id="two-questions">The two questions that settle it</H3>

      <P>
        When the framework list is not obviously decisive, these two questions
        resolve almost every case.
      </P>

      <div className="my-8 rounded-xl border border-border/40 overflow-hidden">
        <Fact label="1. What breaks if this is stale?">
          If nothing breaks, cache it aggressively and invalidate on write. If a
          stale value is a security or correctness problem — a revoked role, a
          wrong price — do not cache it across requests.
        </Fact>
        <Fact label="2. Who invalidates it?">
          A cache with no named invalidation path is a cache with an unbounded
          staleness window. If you cannot name the function or tag that clears
          it, either the data is truly static or the design is incomplete.
        </Fact>
      </div>

      <P>
        Those two questions catch the failure mode that is hardest to notice:
        caching something correct-looking whose invalidation nobody owns. It
        works perfectly in testing, because nothing has been invalidated yet.
      </P>

      <H3 id="verification">Verification is part of the change</H3>

      <P>
        Then we verify. Read the build route table, and check that each entry
        still says what we think it says — <C>○ (Static)</C> for routes we
        believe are static, a revalidate column where we expect one. Caching is
        the one area where the gap between intent and reality survives{" "}
        <C>tsc</C> and even a green build.
      </P>

      <Callout tone="tip">
        Make it a habit rather than a step: any commit that touches a cache TTL,
        a <C>revalidate</C> value, or a <C>cacheLife</C> should include the
        build route table diff in its description. The diff is the proof, and it
        takes ten seconds.
      </Callout>

      <H2 id="anti-patterns">Anti-patterns we have stopped doing</H2>

      <UL>
        <LI>
          <strong>Caching to fix a slow page.</strong> Find the N+1 first. A
          cache in front of a bad query hides the problem until the cache
          misses.
        </LI>
        <LI>
          <strong>Caching user data across requests.</strong> Request scope is
          the correct boundary for anything personalized. This is not a
          performance suggestion — it is a data-leak prevention rule.
        </LI>
        <LI>
          <strong>
            Wrapping errors in fallbacks before adding error states.
          </strong>
          A cached empty result is worse than a thrown error, because it
          converts a loud failure into a silent wrong answer.
        </LI>
        <LI>
          <strong>
            Tuning TTLs for freshness without knowing the rendering cost.
          </strong>{" "}
          Shortening a lifetime may be moving work from build time to request
          time. Check what it does to the route table.
        </LI>
      </UL>

      <H2 id="takeaways">Takeaways</H2>

      <UL>
        <LI>
          Name the layer before you reach for a function. Most caching bugs are
          layer confusion.
        </LI>
        <LI>
          Cross-request caches return shared references. Treat results as
          immutable.
        </LI>
        <LI>
          A cache TTL in shared code becomes the enclosing route's ISR window.
          Check the build output.
        </LI>
        <LI>
          Keep invalidation out of the write's failure path — the row is already
          committed.
        </LI>
        <LI>
          <C>unstable_cache</C> is legacy. If you are starting fresh in Next 16,
          start with <C>'use cache'</C>.
        </LI>
      </UL>
    </BlogLayout>
  );
}
