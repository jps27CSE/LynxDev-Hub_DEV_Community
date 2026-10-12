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
  InlineCode as C,
} from "@/components/blog/Prose";

const SLUG = "server-client-boundary";
const POST = getPost(SLUG)!;

export const metadata: Metadata = buildPostMetadata(POST);

export default function ServerClientBoundary() {
  return (
    <BlogLayout meta={POST} toc={POST.toc}>
      <JsonLd data={buildPostJsonLd(POST)} />
      <Lead>
        A client component imported one string constant from a data-access
        module. TypeScript passed. The production build failed with a bundler
        error I had never seen. Neither tool was wrong — they were answering
        different questions.
      </Lead>

      <P>
        This is the most valuable architectural bug we have shipped, because it
        is invisible to the type system by construction. Here is what happened,
        why both tools behaved correctly, and the rules we adopted afterwards.
      </P>

      <H2 id="what-happened">What happened</H2>

      <P>
        We built a global notice banner — an admin-toggled maintenance or warning
        message shown above every page. The data layer lives in{" "}
        <C>lib/site-notice.ts</C>, which reads a singleton row and projects it
        into a small public shape for the banner to render.
      </P>

      <P>
        The banner is a client component: it has to read{" "}
        <C>sessionStorage</C> to remember dismissals. So the banner needed the
        severity type and the list of valid severity values. Those lived in{" "}
        <C>lib/site-notice.ts</C>, which imports <C>config/db</C>, which creates
        a <C>mysql2</C> connection pool.
      </P>

      <Code language="tsx">{`// components/SiteNoticeBanner.tsx  — "use client"
import type { ActiveSiteNotice } from "@/lib/site-notice";   // fine, erased
import { SITE_NOTICE_SEVERITIES } from "@/lib/site-notice"; // not fine`}</Code>

      <P>
        Type-only imports are erased at compile time. A value import is not. So
        the bundler pulled <C>lib/site-notice.ts</C> into the browser graph,
        followed its import of <C>config/db</C>, and attempted to bundle the
        MySQL driver — which depends on Node's <C>net</C>, <C>tls</C> and{" "}
        <C>timers</C> modules.
      </P>

      <Callout tone="trap" title="The error">
        <p>
          <C>Can&apos;t resolve &apos;net&apos;</C> — from a build that had
          passed <C>tsc --noEmit</C> with zero errors.
        </p>
      </Callout>

      <H2 id="why-tsc-passed">Why the type checker was right to pass</H2>

      <P>
        This is the part worth sitting with. The code was genuinely
        type-correct. Importing a constant from a module is a legal operation.
        Nothing about the <C>const SITE_NOTICE_SEVERITIES = [&quot;info&quot;, ...]</C>{" "}
        declaration says where it is allowed to execute.
      </P>

      <P>
        <C>tsc</C> answers:{" "}
        <em>do these types line up?</em> The bundler answers:{" "}
        <em>can every module in this graph run in the target environment?</em> Two
        different questions. Only the second one catches this.
      </P>

      <P>
        The general lesson: type errors and bundler errors are{" "}
        <strong>different error classes</strong>. A green typecheck is a
        necessary condition for a working build, not a sufficient one. Our
        engineering notes now say this explicitly, because the instinct after a
        green <C>tsc</C> is to trust it.
      </P>

      <H2 id="the-fix">The fix, and why we moved the constant</H2>

      <P>
        The obvious patch is to keep the vocabulary in{" "}
        <C>lib/site-notice.ts</C> and have the client component read it from
        there — which is what we would have done without the incident, because
        it was already there. That patch is wrong, or rather, it works while
        leaving the trap armed for the next person.
      </P>

      <P>
        Instead the vocabulary moved to a module with zero imports —{" "}
        <C>config/site-notice.ts</C> — and <C>lib/site-notice.ts</C>{" "}
        <em>imports</em> from it.
      </P>

      <Code language="typescript">{`// config/site-notice.ts — zero imports, safe for any graph
export const SITE_NOTICE_SEVERITIES = ["info", "warning", "critical"] as const;
export type SiteNoticeSeverity = (typeof SITE_NOTICE_SEVERITIES)[number];`}</Code>

      <P>Two details in that refactor are the actual lesson.</P>

      <OL>
        <LI>
          <strong>Import, do not re-export.</strong> <C>lib/site-notice.ts</C>{" "}
          imports the constants. It does not{" "}
          <C>export &#123; SITE_NOTICE_SEVERITIES &#125; from ...</C>. A
          re-export would keep the same convenient import path alive and
          preserve the exact trap for the next component.
        </LI>
        <LI>
          <strong>The rule has to be mechanical.</strong> &ldquo;Be careful what
          you re-export&rdquo; is advice. &ldquo;If a module transitively reaches{" "}
          <C>config/db</C>, a client component may only{" "}
          <C>import type</C> from it&rdquo; is a rule that can be checked.
        </LI>
      </OL>

      <Callout tone="tip">
        The general form of this rule is worth keeping: identify the modules that
        reach Node built-ins, then constrain the import direction at that
        boundary. One well-placed constraint beats a code review checklist that
        everyone eventually stops reading.
      </Callout>

      <H2 id="the-rules">The rules we adopted</H2>

      <OL>
        <LI>
          <strong><C>import type</C> is always safe.</strong> Type-only imports
          are erased and never enter the client graph. Reach for them
          deliberately when a client component needs a shape but not a value.
        </LI>
        <LI>
          <strong>Keep vocabulary in zero-import modules.</strong> Constants,
          unions and labels used by both sides of the boundary live in a module
          that imports nothing. This is the same instinct as separating a types
          file from an implementation file.
        </LI>
        <LI>
          <strong>Project, do not spread.</strong> The data layer returns an
          explicit allowlist of five primitive fields. The underlying row also
          carries an internal user identifier that must never reach a client
          prop. Spreading the row would be one refactor away from a leak.
        </LI>
        <LI>
          <strong>Never bridge a value across the boundary to save an import.</strong>
          The performance cost of one extra module is zero. The cost of a
          bundler failure is a broken build.
        </LI>
      </OL>

      <H3>On the allowlist projection specifically</H3>

      <P>
        The notice row has an <C>updated_by</C> field holding a user identifier.
        Returning the row directly would have worked perfectly until someone
        added <C>&#123;...record&#125;</C> to a response body. So the shared read
        path returns a named projection:
      </P>

      <Code language="typescript">{`export type ActiveSiteNotice = {
  version: string;      // doubles as the dismissal key
  severity: SiteNoticeSeverity;
  display: SiteNoticeDisplay;
  title: string;
  message: string;
};`}</Code>

      <P>
        Adding a column to the table now requires a deliberate edit here before
        it can reach a client component. That is the point — not that the
        projection is clever, but that it makes the safe action the default one.
      </P>

      <H2 id="server-only">The tool we should have reached for first</H2>

      <P>
        Next.js ships a <C>server-only</C> package that turns this whole class
        of mistake into a build-time error. Importing it at the top of a
        server-only module makes any client-side import of that module fail
        loudly, at build, with a message that explains itself.
      </P>

      <Code language="typescript">{`// config/db.tsx
import "server-only"; // any client import of this module now fails the build

export const db = drizzle(mysql.createPool(poolConfig));`}</Code>

      <P>
        We had not adopted it, and that is a genuine gap in our setup rather
        than a deliberate trade-off — there was no reason not to. It is the
        cheapest possible enforcement of the rule we ended up writing in prose.
      </P>

      <H2 id="broader">The general shape of this bug</H2>

      <P>
        Server/Client boundaries fail quietly in a specific way: the failure is
        not in the code you wrote, it is in the graph that code{" "}
        <em>reaches</em>. Import graphs are invisible in review, invisible to
        the type checker, and fully deterministic — which means the bug is not
        intermittent, it is waiting for the next person to add one import.
      </P>

      <P>
        The defence has to be structural. Put the constraint where the mistake
        happens, not in a document where it is eventually forgotten:
      </P>

      <UL>
        <LI>Mark the modules that reach Node built-ins.</LI>
        <LI>Constrain what may be imported from them, mechanically.</LI>
        <LI>Keep shared vocabulary in dependency-free modules.</LI>
        <LI>Project explicitly at the boundary instead of spreading rows.</LI>
        <LI>Always read the build output — the bundler is the type checker you are missing.</LI>
      </UL>
    </BlogLayout>
  );
}