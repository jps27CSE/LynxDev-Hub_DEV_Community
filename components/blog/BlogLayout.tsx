import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag, User, ArrowRight } from "lucide-react";
import { TableOfContents, type TocItem } from "./TableOfContents";
import { getSortedPosts, type PostMeta } from "@/config/blog";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Neighbours in reverse-chronological order, so "newer" reads right and
 * "older" reads left — the same direction as the archive the reader came from.
 *
 * Returns empty slots at the ends rather than hiding them, because a row that
 * exists on every post but renders a label on 4 of 5 is calmer than a row that
 * appears and disappears.
 */
function getNeighbours(slug: string): {
  newer: PostMeta | null;
  older: PostMeta | null;
} {
  const posts = getSortedPosts();
  const index = posts.findIndex((post) => post.slug === slug);
  if (index === -1) return { newer: null, older: null };

  return {
    newer: index > 0 ? posts[index - 1] : null,
    older: index < posts.length - 1 ? posts[index + 1] : null,
  };
}

function PostLink({
  post,
  direction,
}: {
  post: PostMeta | null;
  direction: "newer" | "older";
}) {
  const isNewer = direction === "newer";

  if (!post) {
    return (
      <div className="hidden sm:block" aria-hidden>
        <span className="text-xs uppercase tracking-wider text-muted-foreground/40">
          {isNewer ? "Newer" : "Older"}
        </span>
        <p className="mt-1.5 text-sm text-muted-foreground/30">—</p>
      </div>
    );
  }

  return (
    <Link
      href={`/blog/${post.slug}`}
      rel={isNewer ? "next" : "prev"}
      className={`group block min-w-0 ${isNewer ? "text-right" : "text-left"}`}
    >
      <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground/70 transition-colors group-hover:text-cyan-400">
        {!isNewer && (
          <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
        )}
        {isNewer ? "Newer" : "Older"}
        {isNewer && (
          <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
        )}
      </span>
      <span className="mt-1.5 block truncate text-sm font-medium text-foreground transition-colors group-hover:text-cyan-300">
        {post.title}
      </span>
      <span className="mt-0.5 block text-xs text-muted-foreground/70">
        {formatDate(post.date)}
      </span>
    </Link>
  );
}

/**
 * Shared article shell.
 *
 * Sizing rationale — the earlier full-width attempt failed because a `w-full`
 * container let the text column pin to the left while the rail was flung to the
 * far viewport edge, leaving a large dead gap between them on wide screens.
 * Constraining the article alone is not enough; the *group* has to be bounded.
 *
 * The container is therefore capped twice. Below `lg` there is no side rail, so
 * the cap is 720px — which the 70ch article almost exactly fills, so `mx-auto`
 * centres it with no dead space. At `lg` the rail appears, the cap widens to
 * 1040px, and a two-column grid divides that into article + 48px gap + 240px
 * rail, putting the rail immediately beside the text rather than at the viewport
 * edge. One breakpoint, two coherent layouts.
 *
 * The header, article and footer link all live in the same grid cell, so they
 * share one left edge and one right edge. A title spanning wider than the prose
 * below it is the most common way a centred article still reads as misaligned.
 *
 * `PostMeta` is imported from `config/blog`, not redeclared. This file used to
 * carry its own copy of the post shape; it had already drifted (`readonly
 * string[]` vs `string[]`) and only type-checked because TypeScript structural
 * typing forgave it. Two definitions of one shape is the same failure mode as two
 * definitions of one title.
 */
export function BlogLayout({
  meta,
  toc = [],
  children,
}: {
  meta: PostMeta;
  toc?: TocItem[];
  children: ReactNode;
}) {
  const neighbours = getNeighbours(meta.slug);

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-[720px] px-5 py-8 sm:px-8 sm:py-10 lg:max-w-[1040px]">
        <Link
          href="/blog"
          className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          All posts
        </Link>

        {/*
          Grid, not flex, so ONE <TableOfContents> instance can occupy two
          different DOM positions depending on viewport:

            mobile  — single column, `order-first` puts the collapsed
                      disclosure above the article
            lg+     — two columns, article left / rail right

          Two instances were the alternative (disclosure in the article column,
          rail in the side column). That rendered two IntersectionObservers per
          page doing identical scroll-spy work, one of them permanently inside
          display:none. One instance means one observer at any width.
        */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-12">
          <div className="min-w-0 max-w-[70ch] lg:max-w-none lg:col-start-1 lg:row-start-1">
            <header className="pb-9 border-b border-border/30">
              <h1 className="text-[1.75rem] sm:text-4xl lg:text-[2.6rem] font-bold tracking-tight leading-[1.15] text-balance">
                {meta.title}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <User className="size-3.5" />
                  {meta.author}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  {formatDate(meta.date)}
                </span>
                <span className="font-mono text-xs text-muted-foreground/70">
                  {meta.readTime}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {meta.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-muted/30 px-2.5 py-0.5 text-xs text-muted-foreground"
                  >
                    <Tag className="size-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </header>

            <article className="pb-14">{children}</article>

            <div className="border-t border-border/30 pt-7">
              <Link
                href="/blog"
                className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
                Back to all posts
              </Link>
            </div>

            {/* Prev/next row. `border-t` above it is the article's own rule; this
                adds the second column without a second divider on mobile, where
                the two links stack instead. */}
            <nav
              aria-label="Post navigation"
              className="mt-10 grid gap-6 border-t border-border/30 pt-7 sm:grid-cols-2"
            >
              <PostLink post={neighbours.older} direction="older" />
              <PostLink post={neighbours.newer} direction="newer" />
            </nav>
          </div>

          {/* `self-stretch` is load-bearing, not cosmetic. `position: sticky`
              can only travel within its parent's box; in a single-column grid
              the cell would otherwise be content-height and the sticky child
              would have almost no travel room. Stretching makes the cell as tall
              as the article, which is what gives the rail somewhere to stick. */}
          <div className="order-first min-w-0 lg:order-none lg:col-start-2 lg:row-start-1">
            <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:overscroll-contain lg:pb-8">
              <TableOfContents items={toc} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
