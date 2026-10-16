import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Tag } from "lucide-react";
import { getSortedPosts } from "@/config/blog";
import { buildBlogIndexJsonLd, buildBlogIndexMetadata } from "@/lib/blog-seo";
import { JsonLd } from "@/components/blog/JsonLd";

export const metadata: Metadata = buildBlogIndexMetadata();

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogIndex() {
  const posts = getSortedPosts();
  const [featured, ...rest] = posts;

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-[820px] px-5 py-8 sm:px-8 sm:py-10">
        <JsonLd data={buildBlogIndexJsonLd()} />
        <div>
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            LynxDEV
          </Link>
        </div>

        <header className="mt-10 sm:mt-14 pb-10">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
            Engineering Blog
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            How we build LynxDEV. Architecture, caching, security and
            performance — including the bugs we shipped and what they taught us.
          </p>
        </header>

        {featured && (
          <Link href={`/blog/${featured.slug}`} className="group block">
            <article className="rounded-2xl border border-border/50 bg-card/40 p-7 transition-all duration-300 hover:border-cyan-400/30 hover:bg-card/60">
              <div className="flex items-center gap-2 text-xs font-medium text-cyan-400/90">
                <span className="rounded-full bg-cyan-400/10 px-2 py-0.5">
                  Latest
                </span>
                <span className="text-muted-foreground">
                  {formatDate(featured.date)}
                </span>
              </div>
              <h2 className="mt-3.5 text-2xl sm:text-3xl font-semibold tracking-tight leading-snug text-foreground transition-colors group-hover:text-cyan-200">
                {featured.title}
              </h2>
              <p className="mt-3 leading-relaxed text-foreground/70">
                {featured.description}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span className="inline-flex items-center gap-1.5 text-foreground transition-colors group-hover:gap-2.5">
                  Read post
                  <ArrowRight className="size-4 transition-all duration-300 group-hover:translate-x-0.5" />
                </span>
                <span className="font-mono text-xs text-muted-foreground/70">
                  {featured.readTime}
                </span>
              </div>
            </article>
          </Link>
        )}

        {rest.length > 0 && (
          <div className="mt-12">
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground/70">
              More from the team
            </h2>
            <div className="mt-5 divide-y divide-border/30">
              {rest.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block py-7 first:pt-0"
                >
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                    <span aria-hidden>·</span>
                    <span className="font-mono">{post.readTime}</span>
                  </div>
                  <h3 className="mt-2 text-lg sm:text-xl font-semibold tracking-tight leading-snug text-foreground transition-colors group-hover:text-cyan-200">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-muted-foreground">
                    {post.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-muted/25 px-2.5 py-0.5 text-xs text-muted-foreground"
                      >
                        <Tag className="size-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <footer className="mt-16 border-t border-border/30 py-8 text-sm text-muted-foreground">
          Posts are written by the LynxDEV engineering team. Corrections and
          suggestions are welcome.
        </footer>
      </div>
    </div>
  );
}