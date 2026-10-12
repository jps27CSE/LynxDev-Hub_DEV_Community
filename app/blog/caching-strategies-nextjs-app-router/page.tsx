import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Caching Strategies for Next.js App Router — LynxDEV",
  description: "Practical approaches to caching in Next.js 16 App Router - when to use static generation, dynamic rendering, unstable_cache, and request-level caching.",
};

export default function CachingPost() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <Link href="/blog">
          <Button variant="ghost" className="gap-2 mb-10 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Button>
        </Link>

        <article>
          <header className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1] text-foreground">
              Caching Strategies for Next.js App Router
            </h1>
            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                October 13, 2025
              </div>
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                LynxDEV Engineering
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["caching", "nextjs", "performance", "app-router", "react-cache"].map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          </header>

          <div className="space-y-8 text-[17px] leading-[1.75] text-foreground/95">
            <section>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-12 mb-6 text-foreground">
                Understanding Caching Layers
              </h2>
              <p className="mb-4">
                Next.js App Router has multiple caching layers. Knowing when to use each is crucial:
              </p>
              <ul className="space-y-3 pl-6 list-disc">
                <li><strong>Request memoization</strong> (<code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">React.cache</code>) - Dedupes identical fetches within a single request</li>
                <li><strong>Data cache</strong> (<code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">unstable_cache</code>) - Persists results across requests</li>
                <li><strong>Full Route Cache</strong> (static generation) - Renders pages at build time</li>
                <li><strong>Router Cache</strong> (client-side) - Caches visited routes in the browser</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-12 mb-6 text-foreground">
                Request-Level Deduplication
              </h2>
              <p className="mb-4">
                Within a single request, use <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">React.cache()</code> to prevent redundant work when the same data accessor is called multiple times.
              </p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
                <code>{`import { cache } from "react";

export const getUserById = cache(async (id: number) => {
  // This only runs once per request even if called multiple times
  return await db.select()...
});`}</code>
              </pre>
            </section>

            <section>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-12 mb-6 text-foreground">
                Cross-Request Caching
              </h2>
              <p className="mb-4">
                For stable, non-user-specific data, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">unstable_cache</code> is ideal. Cache what is stable, never cache what is personalized.
              </p>
            </section>

            <section>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-12 mb-6 text-foreground">
                Choosing the Right Strategy
              </h2>
              <p>
                Static content benefits from build-time generation and cross-request caching. User-specific data should
                remain dynamic and request-scoped. By being intentional about each caching layer, we keep our app fast
                without sacrificing correctness.
              </p>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}
