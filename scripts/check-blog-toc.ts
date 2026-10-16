/**
 * Verifies the blog TOC wiring in both directions.
 *
 * Anchors are hand-maintained across two files (`config/blog.ts` and the post
 * component), so they can drift: renaming an `id` leaves a dead anchor that
 * renders as a normal link and navigates nowhere. Neither the type system nor
 * the build catches that.
 *
 * Direction matters, and the first version of this script only checked one:
 *   config -> HTML   (an anchor points at a heading that does not exist)
 *   HTML   -> config (a post exists but is unregistered)
 *
 * The second direction matters because an unregistered post still builds and
 * still renders. It is simply invisible: absent from the index, absent from the
 * sitemap, no canonical, and unreachable by scroll-spy — and the script reported
 * "all anchors resolve" the whole time.
 *
 * Run: `npm run check:blog-toc`
 * Requires a completed `npm run build` (reads the prerendered HTML).
 */
import fs from "node:fs";
import path from "node:path";
import { POSTS } from "../config/blog";

const APP_BLOG_DIR = path.join(process.cwd(), "app", "blog");
const OUT_DIR = path.join(process.cwd(), ".next", "server", "app", "blog");

let failures = 0;

function fail(message: string): void {
  console.error(message);
  failures++;
}

if (!fs.existsSync(OUT_DIR)) {
  console.error(`No build output at ${OUT_DIR}. Run \`npm run build\` first.`);
  process.exit(1);
}

/** Post directories on disk, excluding Next's dynamic segment and non-post files. */
function findPostDirs(): string[] {
  return fs
    .readdirSync(APP_BLOG_DIR, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        !entry.name.startsWith("[") &&
        // opengraph-image.tsx is a metadata route, not a post.
        fs.existsSync(path.join(APP_BLOG_DIR, entry.name, "page.tsx")),
    )
    .map((entry) => entry.name)
    .sort();
}

// ---- slug integrity ---------------------------------------------------------

/**
 * The slug exists in three places per post: the directory name, the `SLUG`
 * const inside the page, and `config.slug`. The directory name is the one place
 * that cannot drift from the URL that actually works, so the other two are
 * asserted against it rather than against each other.
 *
 * A mismatch is not cosmetic. `getPost(SLUG)!` is a non-null assertion, so a
 * typo'd `config.slug` makes the post fail its lookup — and because the page
 * renders regardless, the post stays invisible from the index, the sitemap and
 * the TOC while still building successfully.
 */
function checkSlugIntegrity(): void {
  for (const post of POSTS) {
    const pagePath = path.join(APP_BLOG_DIR, post.slug, "page.tsx");

    if (!fs.existsSync(pagePath)) continue; // already reported as a missing dir

    const source = fs.readFileSync(pagePath, "utf-8");
    const declared = source.match(/const SLUG = "([^"]+)"/);

    if (!declared) {
      fail(
        `FAIL ${post.slug}: page.tsx has no \`const SLUG = "..."\` declaration.`,
      );
      continue;
    }

    if (declared[1] !== post.slug) {
      fail(
        `FAIL ${post.slug}: page.tsx declares SLUG="${declared[1]}" but config says ` +
          `"${post.slug}". getPost() would miss and the post would render empty.`,
      );
    }
  }
}

// ---- config -> HTML ---------------------------------------------------------

for (const post of POSTS) {
  const htmlFile = path.join(OUT_DIR, `${post.slug}.html`);

  if (!fs.existsSync(htmlFile)) {
    fail(`FAIL ${post.slug}: no prerendered HTML. Did the post render?`);
    continue;
  }

  const html = fs.readFileSync(htmlFile, "utf-8");
  const headingIds = new Set(
    [...html.matchAll(/<h[23][^>]*\sid="([^"]+)"/g)].map((m) => m[1]),
  );

  const broken = post.toc.filter((entry) => !headingIds.has(entry.id));

  if (broken.length > 0) {
    fail(
      `FAIL ${post.slug}: ${broken.length} TOC id(s) have no matching heading:`,
    );
    for (const entry of broken) {
      console.error(`     - ${entry.id}  ("${entry.title}")`);
    }
    continue;
  }

  const orphaned = [...headingIds].filter(
    (id) => !post.toc.some((entry) => entry.id === id),
  );
  if (orphaned.length > 0) {
    console.warn(
      `WARN ${post.slug}: heading(s) missing from TOC: ${orphaned.join(", ")}`,
    );
  }

  console.log(
    `OK   ${post.slug}: ${post.toc.length}/${post.toc.length} anchors resolve`,
  );
}

// ---- HTML -> config ---------------------------------------------------------

const configured = new Set(POSTS.map((p) => p.slug));
const onDisk = findPostDirs();

const unregistered = onDisk.filter((slug) => !configured.has(slug));
if (unregistered.length > 0) {
  fail(
    `FAIL ${unregistered.length} post(s) built but not registered in config/blog.ts: ` +
      `${unregistered.join(", ")}. They render, but are absent from the index, ` +
      `the sitemap and the TOC — add a POSTS entry for each.`,
  );
}

const missingDir = [...configured].filter((slug) => !onDisk.includes(slug));
if (missingDir.length > 0) {
  fail(
    `FAIL config/blog.ts lists ${missingDir.length} post(s) with no directory in ` +
      `app/blog/: ${missingDir.join(", ")}. Remove the entry or add the page.`,
  );
}

// ---- slug integrity ---------------------------------------------------------

checkSlugIntegrity();

// ---- report -----------------------------------------------------------------

if (failures > 0) {
  console.error(`\n${failures} problem(s) found.`);
  process.exit(1);
}

console.log(`\nAll ${POSTS.length} posts registered; all anchors resolve.`);
