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

const SLUG = "designing-scalable-architecture";
const POST = getPost(SLUG)!;

export const metadata: Metadata = buildPostMetadata(POST);

export default function DesigningScalableArchitecture() {
  return (
    <BlogLayout meta={POST} toc={POST.toc}>
      <JsonLd data={buildPostJsonLd(POST)} />
      <Lead>
        Every codebase starts organized. The interesting question is not how we
        arranged it on day one — it is which arrangements keep working at month
        eight, after the exceptions pile up.
      </Lead>

      <P>
        This is the set of rules we converged on for LynxDEV after building a
        platform with courses, an interactive code editor, DSA practice, an AI
        mentor and an admin panel. None of them are novel. The value is in
        knowing <em>why</em> each one exists, because the failure mode for
        almost all of them is not a crash — it is a slow erosion.
      </P>

      <H2 id="the-problem">The problem: boundaries erode quietly</H2>

      <P>
        Architectural violations in a codebase rarely announce themselves. The
        usual sequence is:
      </P>

      <OL>
        <li>A rule blocks something legitimate.</li>
        <li>Someone bypasses it once, with a comment explaining why.</li>
        <li>The bypass becomes a pattern because there is no enforcement.</li>
        <li>The pattern becomes the convention.</li>
        <li>
          Six months later the convention is the architecture, and nobody chose
          it.
        </li>
      </OL>

      <P>
        The result is rarely catastrophic. It is a codebase where the folder
        names lie — a <C>lib/</C> that contains business logic, a{" "}
        <C>components/</C> directory that imports the database. Nothing fails.
        Everything is slightly harder to reason about than it should be.
      </P>

      <Callout tone="note">
        The test for an architecture rule is not whether it is good advice. It
        is whether breaking it produces a <em>visible</em> cost. If the cost of
        violating a rule is only felt six months later by someone debugging, the
        rule is documentation, not architecture.
      </Callout>

      <H2 id="principle-1">Principle 1 — Put authorization beside the data</H2>

      <P>
        This is the rule we would most like to have adopted first, because it is
        the one with real security weight.
      </P>

      <P>
        The intuitive structure is to centralize permission checks in middleware
        and let route handlers trust them. It looks clean. It also fails,
        because a data accessor can be called from somewhere the middleware
        never anticipated.
      </P>

      <P>
        Our admin authorization has a shape we are happy with: an allowlist
        sourced from the environment, a direct-ID fast path that avoids a query,
        and — most importantly — <strong>a fail-closed default</strong>.
      </P>

      <Code language="typescript">{`export const isAdmin = cache(async (userId: string): Promise<boolean> => {
  // Empty env = no admins. Not "everyone is an admin".
  if (adminEmails.length === 0 && adminClerkIds.length === 0) return false;

  if (adminClerkIds.includes(userId)) return true;   // fast path, no DB hit

  try {
    const users = await withConnectRetry(() =>
      db
        .select({ email: usersTable.email })
        .from(usersTable)
        .where(eq(usersTable.clerk_id, userId))
        .limit(1),
    );

    if (users.length === 0) return false;
    return adminEmails.includes(users[0].email.toLowerCase());
  } catch (error) {
    log.error("isAdmin DB lookup failed", error);
    return false;                                     // fail closed
  }
});`}</Code>

      <P>Three decisions worth pulling out of that:</P>

      <H3>Fail-closed on misconfiguration</H3>

      <P>
        If the environment variable is missing or empty, the answer is{" "}
        <em>nobody is an admin</em>. The alternative — treating an empty
        allowlist as &ldquo;no restriction&rdquo; — means a deployment typo
        silently grants admin to every user. It is a one-character difference
        between a bug and a breach.
      </P>

      <H3>Fail-closed on error</H3>

      <P>
        If the database is unreachable, the lookup returns <C>false</C> rather
        than throwing. That is deliberately inconvenient: it means a transient
        database blip looks exactly like &ldquo;you are not an admin&rdquo; to
        the admin using the tool, and it fails safe rather than open.
      </P>

      <Callout tone="tip">
        <C>cache()</C> here is doing double duty. It deduplicates the lookup
        within a request — so a layout guard and a route handler checking
        separately cost one query — and it gives us one obvious place to attach
        logging if the policy ever needs to explain itself.
      </Callout>

      <H3>Defense in depth is not the same as a boundary</H3>

      <P>
        Our proxy runs an auth check on every non-public route. That means an
        unsigned API call is redirected before the handler runs, which makes the{" "}
        <C>401</C> responses inside our handlers unreachable in practice.
      </P>

      <P>
        That is fine, and worth writing down explicitly — because it changes how
        you debug. Those <C>401</C> branches are not your auth boundary; they
        are the second lock on the second door. If someone removes the proxy
        check, the handlers still hold.
      </P>

      <H2 id="principle-2">Principle 2 — Colocate by feature, not by layer</H2>

      <P>
        The original plan was layered: all components together, all data access
        together, all types together. It is a defensible structure and it does
        not survive contact with a growing app.
      </P>

      <P>
        The failure is navigational. To answer &ldquo;where does chapter
        progress get written?&rdquo; you search a directory of unrelated
        functions, because everything that touches the database lives together
        regardless of what it does.
      </P>

      <div className="my-8 rounded-xl border border-border/40 overflow-hidden">
        <Fact label="app/">
          Routing only. Pages, layouts, and route handlers compose the product.
        </Fact>
        <Fact label="lib/">
          Data access and pure utilities. The only place that knows the schema.
        </Fact>
        <Fact label="config/">
          Schema, vocabulary, and constants. Zero runtime behaviour.
        </Fact>
        <Fact label="components/">
          Reusable UI. Shadcn primitives plus app-specific components.
        </Fact>
        <Fact label="context/">Exactly one user-state context. Not two.</Fact>
      </div>

      <P>
        The load-bearing rule is the second one: <C>lib/</C> owns all knowledge
        of the database schema. When the schema changes, there is exactly one
        directory to look at, and exactly one place where a query might need
        updating.
      </P>

      <Callout tone="warning">
        &ldquo;Just this one query needs the schema inline&rdquo; is how the
        rule dies. It is genuinely faster, and it is genuinely fine — right up
        until someone adds an index that four scattered queries need to know
        about.
      </Callout>

      <H2 id="principle-3">
        Principle 3 — Server-first, and push interactivity down
      </H2>

      <P>
        The <C>&quot;use client&quot;</C> directive is not additive. Once a file
        is marked, everything it imports and directly renders joins the client
        bundle.
      </P>

      <P>
        The practical consequence is that a single misplaced directive at the
        top of a layout pulls an entire page subtree across the boundary. Our
        dashboard is server-rendered shell plus a handful of client islands; the
        greeting card and stat cards are server components that receive data as
        props.
      </P>

      <P>
        Where interactivity genuinely exists, we push it to the leaf rather than
        the root. A single client component owning its own button state is a
        ~1KB island; the same state at the page root ships the page.
      </P>

      <Callout tone="trap">
        The trap is not &ldquo;too many use client directives.&rdquo; It is{" "}
        <em>one in the wrong place</em>. You cannot measure this by counting
        directives — you measure it by reading the build output and noticing
        which routes went from Server to Client.
      </Callout>

      <H2 id="principle-4">Principle 4 — Separate error from empty</H2>

      <P>
        This is the rule that produced the largest behavioural change on
        LynxDEV, and it started as a small bug report.
      </P>

      <P>
        Our course data accessors caught errors and returned <C>[]</C>. So
        during a database outage the catalog page rendered{" "}
        <em>&ldquo;No courses available yet&rdquo;</em> — which is a confident,
        specific lie. The correct state and the failure state were
        indistinguishable.
      </P>

      <P>The fix was two steps that only work together.</P>

      <Code language="typescript">{`export const getAllCourses = cache(async (): Promise<Course[]> =>
  withCourseCache("all", async () => {
    try {
      const rows = await db.select().from(courses).orderBy(asc(courses.order_index));
      return rows.map(toCourse);
    } catch (error) {
      log.error("[course-data] getAllCourses failed:", error);
      throw error;              // never cached, never silently empty
    }
  }),
);`}</Code>

      <P>
        The accessor rethrows so the error is a real error, and the route has a
        segment-level error boundary that renders a failure state with a retry.
        Now <C>[]</C> means genuinely no courses, and a failure means a visible,
        actionable failure.
      </P>

      <Callout tone="note">
        The <C>throw</C> also keeps the failure out of the cache. If the
        accessor returned a fallback, that fallback would be cached and served
        to every subsequent visitor until it expired.
      </Callout>

      <H2 id="principle-5">Principle 5 — Make config explicit and typed</H2>

      <P>
        Values that are decisions rather than code belong in <C>config/</C>,
        expressed as unions so the compiler carries them:
      </P>

      <Code language="typescript">{`export const SITE_NOTICE_SEVERITIES = ["info", "warning", "critical"] as const;
export type SiteNoticeSeverity = (typeof SITE_NOTICE_SEVERITIES)[number];`}</Code>

      <P>
        A route can then accept only valid values, and a typo is a compile error
        rather than a row that silently stores <C>&quot;critical &quot;</C> with
        a trailing space and never renders as intended.
      </P>

      <H3>The validation strictness that matters</H3>

      <P>
        When a form feeds a database upsert, every field is <em>required</em>{" "}
        and none are <C>.optional()</C>. This is not pedantry:
      </P>

      <Callout tone="warning">
        <p>
          Drizzle omits <C>undefined</C> keys from an update&apos;s SET clause.
          So an optional field that fails to arrive does not error — it leaves
          the old value in place.
        </p>
        <p className="mt-2">
          The result is a <C>200</C> that reports &ldquo;saved&rdquo; while
          having saved nothing. Strict, required schemas are the whole defence.
        </p>
      </Callout>

      <H2 id="principle-6">Principle 6 — Prefer boring, obvious code</H2>

      <P>
        The code that gets read during an incident at 2am is the code that does
        not need a clever comment. Our standards are explicit about avoiding
        deep nesting, god functions, and abstractions that exist to remove two
        repetitions.
      </P>

      <P>
        Where a pattern repeats more than a few times, we extract it — not at
        the second occurrence, but once the shape is genuinely settled. The
        shared error-response helpers in our API layer are five small functions
        that exist because writing{" "}
        <C>
          NextResponse.json(&#123; error: &quot;...&quot; &#125;, &#123; status:
          500 &#125;)
        </C>{" "}
        fourteen slightly different ways was already costing us.
      </P>

      <H2 id="testing">Testing: the honest gap</H2>

      <P>
        We have no test framework. That is a real limitation, not a principle,
        and it is worth being straight about what we did instead.
      </P>

      <UL>
        <LI>
          <strong>Strict TypeScript.</strong> Catches an enormous class of
          mistakes, and it is free.
        </LI>
        <LI>
          <strong>Mandatory builds.</strong> Not typecheck alone — the bundler
          catches things the compiler cannot.
        </LI>
        <LI>
          <strong>Production review docs.</strong> Per-module audits that record
          findings with severity, evidence, and a fix or an explicit acceptance.
        </LI>
        <LI>
          <strong>Manual verification gates.</strong> Changes stop for human
          testing before they are committed.
        </LI>
      </UL>

      <Callout tone="trap" title="What this cost us">
        Two real defects on one feature passed <C>tsc</C> and were caught only
        by reading the build output and by running the code. A review doc
        claimed a sandbox was closed while a second execution path was still
        open. Review discipline caught it — but a test would not have needed the
        luck.
      </Callout>

      <H2 id="takeaways">Takeaways</H2>

      <UL>
        <LI>
          Put authorization next to the data, and make every misconfiguration
          fail closed.
        </LI>
        <LI>
          One directory owns schema knowledge. Everywhere else is a consumer.
        </LI>
        <LI>
          &ldquo;Use client&rdquo; is a subtree operation, not a per-component
          one.
        </LI>
        <LI>
          Never return a fallback value for a failure. Re-throw and render an
          error state.
        </LI>
        <LI>
          Required-not-optional schemas for upserts, because <C>undefined</C> is
          silently skipped by the ORM.
        </LI>
        <LI>
          No test framework is a debt with a maintenance cost, not a neutral
          choice. Document it as such.
        </LI>
      </UL>
    </BlogLayout>
  );
}
