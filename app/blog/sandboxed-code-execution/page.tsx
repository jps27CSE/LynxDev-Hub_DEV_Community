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

const SLUG = "sandboxed-code-execution";
const POST = getPost(SLUG)!;

export const metadata: Metadata = buildPostMetadata(POST);

export default function SandboxedExecution() {
  return (
    <BlogLayout meta={POST} toc={POST.toc}>
      <JsonLd data={buildPostJsonLd(POST)} />
      <Lead>
        Learning platforms have an unusual requirement: every user is a script
        author, and their code has to run somewhere. The interesting engineering
        is not in running it — it is in deciding where, and what that decision
        costs you in features.
      </Lead>

      <P>
        On LynxDEV, lessons run JavaScript and preview HTML/CSS with no server
        execution at all. That decision shaped the sandbox, and the sandbox
        shaped what lessons we can author. Both halves of that sentence are
        worth being explicit about.
      </P>

      <H2 id="the-options">The options, honestly</H2>

      <div className="my-8 rounded-xl border border-border/40 overflow-hidden">
        <Fact label="Main thread eval">
          Fastest to build. Shares the window, can freeze the tab, and inherits
          full origin privileges.
        </Fact>
        <Fact label="Server sandbox">
          Real isolation, but you now operate an untrusted-code execution service
          and have to survive it being slow or exploited.
        </Fact>
        <Fact label="Browser worker">
          Separate thread and separate global scope, zero server cost. Isolation
          is good but not absolute.
        </Fact>
        <Fact label="Opaque-origin iframe">
          Full document rendering with a genuinely foreign origin. The right tool
          for HTML.
        </Fact>
      </div>

      <P>
        We run the last two, and the choice is mostly about which capability the
        lesson needs. A console lesson wants captured output. A CSS lesson wants
        a rendered page. Those need different tools.
      </P>

      <H2 id="worker">Layer one — the Web Worker</H2>

      <P>
        A Worker is a separate thread with its own global scope. It has no{" "}
        <C>window</C>, no <C>document</C>, and — critically — an infinite loop
        in the worker cannot freeze the page, because the UI thread never
        evaluates it.
      </P>

      <P>
        The worker is created from a Blob so there is no separate file to
        deploy, and terminated as soon as it responds or times out:
      </P>

      <Code language="typescript">{`const blob = new Blob([workerSource], { type: "text/javascript" });
workerUrl = URL.createObjectURL(blob);
worker = new Worker(workerUrl);

const done = (result: RunResult) => {
  clearTimeout(timer);
  worker.terminate();
  URL.revokeObjectURL(workerUrl);
  resolve(result);
};

const timer = setTimeout(
  () => done({ output: "", error: "Execution timed out — infinite loop?" }),
  RUN_TIMEOUT_MS, // 5s
);`}</Code>

      <Callout tone="tip">
        The timeout is not a nicety, it is the feature. For a learner the
        difference between a tab that hangs forever and a message that says{" "}
        <em>&ldquo;Execution timed out — infinite loop?&rdquo;</em> is the
        difference between a bug report and a learning moment. A correct error
        message is a teaching tool.
      </Callout>

      <H2 id="globals">Layer two — shadowing what the worker still has</H2>

      <P>
        A Worker is not a security boundary in the formal sense. It still has{" "}
        <C>fetch</C>, and a worker&apos;s network access originates from the
        page&apos;s origin — meaning a pasted snippet could call our own
        authenticated endpoints.
      </P>

      <P>
        So inside the worker we shadow the globals that matter. The learner code
        is invoked through a <C>new Function</C> whose parameters{" "}
        <em>are</em> those globals:
      </P>

      <Code language="typescript">{`const BLOCKED_GLOBALS = [
  "fetch",
  "XMLHttpRequest",
  "WebSocket",
  "importScripts",
  "navigator",
  "self",
  "globalThis",
  "postMessage",
];

new Function("console", ...BLOCKED_GLOBALS, e.data.code)(
  mockConsole,
  ...BLOCKED_GLOBALS.map(() => undefined),   // every one is undefined
);`}</Code>

      <P>
        The comment in our source explains the non-obvious part: each name is
        both a parameter of the wrapper function{" "}
        <em>and</em> an argument to it. That is deliberate. It means the
        parameter list and the shadowing list cannot drift apart when someone
        adds a tenth entry — a class of bug that would otherwise be silent and
        security-relevant.
      </P>

      <Callout tone="warning">
        Parameter shadowing only overrides an identifier <em>inside</em> the
        function body. It is not a hardened boundary against determined code —
        it stops the realistic cases (a snippet that fetches, a curious learner
        poking at <C>fetch</C>) without pretending to be a VM.
      </Callout>

      <P>
        Console output is captured rather than forwarded, with hard caps — the
        worker tracks both line count and character budget, truncates cleanly,
        and reports how many lines were dropped instead of silently cutting:
      </P>

      <Code language="typescript">{`const MAX_LOG_LINES = 10000;
const MAX_LOG_CHARS = 500000;
// ... increments dropped instead of growing unboundedly
body + (dropped ? "\\n… " + dropped.toLocaleString() + " more lines truncated" : "")`}</Code>

      <P>
        Without the caps, a learner running a loop with a <C>console.log</C>{" "}
        inside it produces an out-of-memory error in the tab instead of a
        timeout message. The caps exist so the failure mode stays the good one.
      </P>

      <H2 id="iframe">Layer three — opaque origins for HTML</H2>

      <P>
        HTML lessons need a rendered document, which a Worker cannot provide. A
        Worker has no DOM, so the choice is an iframe — and the iframe is where
        we got it wrong first.
      </P>

      <P>
        The original implementation wrote lesson HTML into an iframe via{" "}
        <C>document.write()</C> with no <C>sandbox</C> attribute. That iframe was
        same-origin: it could read the parent&apos;s cookies, read
        same-origin <C>localStorage</C>, and call our authenticated APIs with
        the user&apos;s credentials.
      </P>

      <Callout tone="trap" title="We had already claimed this was fixed">
        <p>
          A prior review had closed the <C>eval()</C> path by moving it to a
          worker, and written that the self-XSS vector was shut. It was not. The
          browser-preview path was a separate execution surface and nobody had
          checked it.
        </p>
        <p className="mt-2">
          The lesson: &ldquo;we fixed the sandbox&rdquo; is a claim about a
          specific code path, not a property of the feature. Every execution
          surface needs its own audit, and a fix report should list which
          surfaces were checked.
        </p>
      </Callout>

      <P>The fix is two attributes:</P>

      <Code language="tsx">{`<iframe
  srcDoc={document}
  sandbox="allow-scripts"
  title="Lesson preview"
/>`}</Code>

      <P>
        <C>srcDoc</C> plus <C>sandbox="allow-scripts"</C> gives the frame an{" "}
        <strong>opaque origin</strong>. It can still run its own JavaScript and
        style itself, but it has no access to the parent document, no cookies,
        no credentialed fetches, and no shared storage. There is no{" "}
        <C>allow-same-origin</C>, which is the whole point — adding it back would
        restore everything we just removed.
      </P>

      <P>
        It also changes how we inject preview styling. Since{" "}
        <C>contentDocument</C> is now unreachable from the parent, the CSS has to
        be baked into the document itself:
      </P>

      <Code language="typescript">{`export function buildSandboxedSrcDoc(html: string, css = ""): string {
  const styleBlock = \`<style>\${css}</style>\`;
  if (/<html[\\s>]/i.test(html)) {
    if (/<head[\\s>]/i.test(html)) {
      return html.replace(/<head([^>]*)>/i, \`<head$1>\${styleBlock}\`);
    }
    return html.replace(/<html([^>]*)>/i, \`<html$1>\${styleBlock}\`);
  }
  return \`<!DOCTYPE html><html><head>\${styleBlock}</head><body>\${html}</body></html>\`;
}`}</Code>

      <H3>Why this constrains content authoring</H3>

      <P>
        An opaque origin means lesson HTML cannot read or write the parent page
        in any way. That is the correct security posture, but it is a real
        constraint on what we can teach. A lesson demonstrating DOM APIs against
        the surrounding page simply cannot work here, and we plan those lessons
        differently rather than weakening the sandbox.
      </P>

      <Callout tone="tip">
        Security changes are authoring constraints, not just engineering ones.
        Write the constraint down where lesson authors will see it — otherwise
        someone will eventually author a lesson that needs the thing you just
        removed, and the pressure to loosen it will arrive later.
      </Callout>

      <H2 id="persistence">The part people forget: code persists</H2>

      <P>
        Saved lesson code lives in <C>localStorage</C>. That turns every one of
        these surfaces from a momentary action into a{" "}
        <strong>reopening stored vector</strong> — the payload is re-executed on
        every subsequent visit to that lesson, not just once.
      </P>

      <P>
        It is worth stating plainly: this is self-XSS, so the realistic threat is
        a user running code they themselves wrote, which is the entire point of
        the feature. We treat it as a robustness and defence-in-depth problem
        rather than a critical vulnerability — but &ldquo;self-inflicted&rdquo;{" "}
        should come from having bounded the blast radius, not from assuming good
        intentions.
      </P>

      <H3>Storage can fail, and failing silently is its own bug</H3>

      <P>
        <C>localStorage</C> throws in private mode and when a quota is exceeded.
        Both our read and write helpers catch and return{" "}
        <C>null</C>/<C>false</C> rather than propagating, because a storage
        failure must not take down the lesson. The write returns a boolean so
        the caller can tell &ldquo;saved&rdquo; from &ldquo;silently not
        saved&rdquo; — the alternative is code that appears to persist and
        vanishes on reload.
      </P>

      <H2 id="layered">The layers, collected</H2>

      <OL>
        <LI>
          <strong>Thread isolation</strong> — a Worker, so a runaway loop is
          killable and cannot freeze the tab.
        </LI>
        <LI>
          <strong>Timeout</strong> — 5s, enforced by the parent, so termination
          does not depend on the code cooperating.
        </LI>
        <LI>
          <strong>Shadowed globals</strong> — network and ambient-identity APIs
          removed from the executed scope.
        </LI>
        <LI>
          <strong>Output caps</strong> — bounded memory so the failure mode stays
          a readable message.
        </LI>
        <LI>
          <strong>Opaque origin</strong> — <C>sandbox="allow-scripts"</C> for
          anything that renders.
        </LI>
        <LI>
          <strong>Graceful storage failure</strong> — private mode and quota
          exhaustion degrade, they do not crash.
        </LI>
      </OL>

      <P>
        No single layer is a boundary. The value is that each one covers a
        different failure mode, and removing any one of them does not
        immediately produce an exploit — which is exactly what makes the next
        audit tractable.
      </P>

      <H2 id="takeaways">Takeaways</H2>

      <UL>
        <LI>
          Untrusted code execution is an architectural choice with a feature
          cost. Budget for both halves.
        </LI>
        <LI>
          A Worker solves freezing and gives a fresh global scope; it does not
          by itself remove network access.
        </LI>
        <LI>
          Shadowing is a hardening measure, not a boundary. Say so in the code
          so the next reader does not over-trust it.
        </LI>
        <LI>
          <C>sandbox="allow-scripts"</C> without{" "}
          <C>allow-same-origin</C> is what makes an iframe safe.
        </LI>
        <LI>
          Audit every execution surface. &ldquo;We fixed the sandbox&rdquo;
          refers to one code path, not to the feature.
        </LI>
        <LI>
          Timeouts and output caps are UX features. A learner learns more from{" "}
          <C>&ldquo;infinite loop?&rdquo;</C> than from a frozen tab.
        </LI>
      </UL>
    </BlogLayout>
  );
}