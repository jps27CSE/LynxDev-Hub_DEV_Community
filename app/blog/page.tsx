import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Engineering Blog — LynxDEV",
  description: "Technical deep-dives into building LynxDEV: architecture, performance, and engineering decisions.",
};

const posts = [
  {
    slug: "designing-scalable-architecture",
    title: "Designing a Clean, Scalable Architecture for Learning Platforms",
    date: "2025-10-12",
    description: "Lessons learned in building a maintainable Next.js architecture with clear separation of concerns, caching strategies, and performance optimizations.",
    tags: ["architecture", "nextjs", "performance", "caching"],
  },
  {
    slug: "caching-strategies-nextjs-app-router",
    title: "Caching Strategies for Next.js App Router",
    date: "2025-10-13",
    description: "Practical approaches to caching in Next.js 16 App Router - when to use static generation, dynamic rendering, unstable_cache, and request-level caching.",
    tags: ["caching", "nextjs", "performance"],
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <Link href="/">
          <Button variant="ghost" className="gap-2 mb-10 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>

        <header className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1] text-foreground">
            Engineering Blog
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Technical deep-dives into building scalable web applications.
          </p>
        </header>

        <div className="space-y-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group border-b border-border/40 pb-8 last:border-b-0"
            >
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground group-hover:text-foreground/90 transition-colors">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
              <p className="mt-4 text-[17px] leading-relaxed text-foreground/80">
                {post.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs text-muted-foreground"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-6">
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Read more
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
