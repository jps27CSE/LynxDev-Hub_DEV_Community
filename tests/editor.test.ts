/**
 * @file
 *
 * Pins `buildSandboxedSrcDoc` (`lib/editor.ts:115`), the document builder for
 * the iframe that lesson code is previewed inside. Both call sites —
 * `components/editor/BrowserPreview.tsx:37` and
 * `app/(routes)/learn/[courseId]/[chapterId]/LessonClient.tsx:307` — pass the
 * result as `srcDoc` alongside `sandbox="allow-scripts"`.
 *
 * WHY THIS FUNCTION DOES NOT ESCAPE ITS INPUT, and why a test says so out loud.
 * The obvious first instinct on reading `buildSandboxedSrcDoc` is that it
 * should escape or sanitise the HTML. It must not, and "fixing" it that way
 * would be a regression rather than a fix:
 *
 *   - The input is authored lesson content, not user input. It arrives from
 *     `config/courses/`, goes through review, and is rendered to other
 *     learners. Escaping it would show every learner a page full of literal
 *     `&lt;div&gt;`.
 *   - The containment is not here. It is `sandbox="allow-scripts"` without
 *     `allow-same-origin`, which gives the frame an *opaque origin*. The
 *     lesson cannot read this page's DOM, cookies, storage or credentials, and
 *     cannot reach the parent — regardless of what the HTML contains.
 *   - Escaping here would also be the wrong *layer*. If the sandbox were ever
 *     loosened, the correct defence is not an escape in a string helper but not
 *     loosening it. A test that records where the security comes from is what
 *     stops the next person moving it.
 *
 * The real regression risk in this file is not injection — it is that someone
 * refactors the `<head>` detection and lesson previews silently lose their
 * stylesheet, or start nesting a doctype inside another document.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildSandboxedSrcDoc } from "../lib/editor";

const CSS = "p { color: red; }";

describe("buildSandboxedSrcDoc", () => {
  describe("fragment input — the common case", () => {
    it("wraps a fragment in a complete document", () => {
      assert.equal(
        buildSandboxedSrcDoc("<p>hi</p>", CSS),
        `<!DOCTYPE html><html><head><style>${CSS}</style></head><body><p>hi</p></body></html>`,
      );
    });

    it("emits exactly one doctype, and it is the outermost element", () => {
      const out = buildSandboxedSrcDoc("<p>hi</p>", CSS);
      assert.equal(out.match(/<!DOCTYPE/gi)?.length, 1);
      assert.ok(out.startsWith("<!DOCTYPE html>"));
    });

    it("leaves the fragment byte-identical", () => {
      const fragment = '<div class="a"><span>1</span></div>';
      assert.ok(buildSandboxedSrcDoc(fragment, CSS).includes(fragment));
    });
  });

  describe("full document input", () => {
    it("injects the stylesheet into an existing head", () => {
      const out = buildSandboxedSrcDoc(
        "<!DOCTYPE html><html><head><title>T</title></head><body>b</body></html>",
        CSS,
      );
      assert.equal(
        out,
        `<!DOCTYPE html><html><head><style>${CSS}</style><title>T</title></head><body>b</body></html>`,
      );
    });

    it("does not add a second doctype or a second html element", () => {
      const out = buildSandboxedSrcDoc(
        "<!DOCTYPE html><html><head></head><body>b</body></html>",
        CSS,
      );
      assert.equal(out.match(/<!DOCTYPE/gi)?.length, 1);
      assert.equal(out.match(/<html[\s>]/gi)?.length, 1);
      assert.equal(out.match(/<head[\s>]/gi)?.length, 1);
    });

    it("preserves attributes on the head tag", () => {
      // The replacement is `/<head([^>]*)>/` -> `<head$1>`, so attributes are
      // captured and re-emitted. Dropping them here would silently strip
      // charset declarations from lesson documents.
      const out = buildSandboxedSrcDoc(
        `<html><head lang="en" data-x="1"><title>T</title></head><body>b</body></html>`,
        CSS,
      );
      assert.ok(
        out.includes(`<head lang="en" data-x="1"><style>${CSS}</style>`),
      );
    });

    it("injects after the html tag when there is no head", () => {
      const out = buildSandboxedSrcDoc("<html><body>b</body></html>", CSS);
      assert.equal(out, `<html><style>${CSS}</style><body>b</body></html>`);
      // Still exactly one head — synthesised implicitly by the parser, never
      // written by us, so no second one can be introduced.
      assert.doesNotMatch(out, /<head[\s>]/i);
    });

    it("preserves attributes on the html tag in the headless branch", () => {
      const out = buildSandboxedSrcDoc(
        `<html lang="en"><body>b</body></html>`,
        CSS,
      );
      assert.equal(
        out,
        `<html lang="en"><style>${CSS}</style><body>b</body></html>`,
      );
    });

    it("matches html and head case-insensitively", () => {
      const out = buildSandboxedSrcDoc("<HTML><BODY>b</BODY></HTML>", CSS);
      assert.ok(out.includes(`<style>${CSS}</style>`));
    });

    it("normalises the matched tag to lowercase as a side effect of the replace", () => {
      // `String.replace` with a literal replacement emits the pattern's own
      // casing, not the subject's, so `<HTML>` becomes `<html>` while the
      // closing `</HTML>` is left alone. HTML is case-insensitive so this
      // parses fine — but it means the output is not a byte-preserving pass
      // through the lesson, and a future reader should not be surprised by it.
      const out = buildSandboxedSrcDoc("<HTML><BODY>b</BODY></HTML>", CSS);
      assert.ok(out.startsWith("<html>"));
      assert.ok(out.includes("</HTML>"));
    });
  });

  describe("stylesheet handling", () => {
    it("defaults to an empty string, not undefined", () => {
      const out = buildSandboxedSrcDoc("<p>hi</p>");
      assert.ok(out.includes("<style></style>"));
    });

    it("injects CSS verbatim, including characters a naive escaper would mangle", () => {
      const gnarly = `a[href="x"] > b::after { content: "\\2014"; }`;
      assert.ok(buildSandboxedSrcDoc("<p>hi</p>", gnarly).includes(gnarly));
    });
  });

  describe("no escaping, by design", () => {
    it("passes markup through untouched in every branch", () => {
      const payload = `<script>alert(1)</script>`;

      // Fragment branch.
      assert.ok(buildSandboxedSrcDoc(payload, CSS).includes(payload));
      // Full-document-with-head branch.
      const full = `<html><head></head><body>${payload}</body></html>`;
      assert.ok(buildSandboxedSrcDoc(full, CSS).includes(payload));
      // Headless full-document branch.
      const headless = `<html><body>${payload}</body></html>`;
      assert.ok(buildSandboxedSrcDoc(headless, CSS).includes(payload));
    });

    it("does not HTML-escape, so a lesson rendering a div shows a div", () => {
      const out = buildSandboxedSrcDoc("<div>x</div>", CSS);
      assert.ok(out.includes("<div>x</div>"));
      assert.ok(!out.includes("&lt;div&gt;"));
    });

    // Not a unit test — a documented boundary. The assertion that would
    // actually protect the learner is the `sandbox="allow-scripts"` attribute
    // on the consuming <iframe>, which lives in a .tsx file and cannot be
    // asserted from here. This note exists so that gap is not mistaken for
    // coverage: passing these tests does NOT mean lesson code is contained.
    // If someone adds allow-same-origin, or moves to a non-sandboxed preview,
    // this file needs a different threat model, not more cases.
  });
});
