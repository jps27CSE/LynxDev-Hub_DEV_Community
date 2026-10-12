import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Engineering Blog — LynxDEV",
  description: "Technical deep-dives into building LynxDEV: architecture, performance, and engineering decisions for a zero-cost platform.",
};

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-paper" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-fuchsia-500/5 rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="pt-8">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="py-16 sm:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/50 bg-card/50 text-xs text-muted-foreground mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              Engineering Blog
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight leading-[1.1]">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400">
                LynxDEV
              </span>{" "}
              Engineering
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Technical deep-dives into building a zero-cost, production-grade developer learning platform. 
              We share our architecture decisions, performance optimizations, and lessons learned.
            </p>
          </div>

          <div className="mt-12 space-y-6">
            {posts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No blog posts found.
              </div>
            ) : (
              posts.map((post) => (
                <article
                  key={post.slug}
                  className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-cyan-500/[0.04] to-transparent" />
                  <div className="relative">
                    <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight group-hover:text-cyan-300 transition-colors">
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
                      <div>By {post.author}</div>
                    </div>
                    <p className="mt-4 text-muted-foreground leading-relaxed">
                      {post.description}
                    </p>
                    {post.tags.length > 0 && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-border/50 bg-muted/30 text-xs text-muted-foreground"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-6">
                      <Link href={`/blog/${post.slug}`}>
                        <Button variant="outline" className="border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10 hover:border-cyan-400/60">
                          Read more
                        </Button>
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
