/**
 * Renders a JSON-LD structured-data block.
 *
 * `dangerouslySetInnerHTML` is the standard, required way to emit JSON-LD — there
 * is no React API for a `<script>` with JSON content. The payload comes from
 * `JSON.stringify` over our own build-time literals in `config/blog.ts`, so
 * there is no user input and no injection surface.
 *
 * The `<` -> `\u003c` escape below is still required: JSON-LD values are
 * interpolated into markup, so a literal `</script>` inside any string would
 * terminate the tag early and re-parse the remainder of the page as HTML. It
 * fires on every `<`, which is harmless for the fields we emit.
 *
 * No eslint-disable comment is used here: this repo has no ESLint config, so a
 * disable directive would be inert noise implying a rule that is never checked.
 */
export function JsonLd({ data }: { data: string }) {
  const safe = data.replace(/</g, "\\u003c");

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safe }} />
  );
}