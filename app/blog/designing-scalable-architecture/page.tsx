import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Designing a Clean, Scalable Architecture for Learning Platforms — LynxDEV",
  description: "Lessons learned in building a maintainable Next.js architecture with clear separation of concerns, caching strategies, and performance optimizations.",
};

export default function ArchitecturePost() {
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
              Designing a Clean, Scalable Architecture for Learning Platforms
            </h1>
            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                October 12, 2025
              </div>
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                LynxDEV Engineering
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["architecture", "nextjs", "performance", "caching", "scalability"].map((tag) => (
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
                The Architecture Mindset
              </h2>
              <p className="mb-4">
                Building a learning platform comes with unique challenges: content-heavy pages, interactive editors,
                real-time progress tracking, and a need for snappy performance. The key is striking a balance between
                simplicity and scalability while keeping the codebase maintainable.
              </p>
              <p>
                Our approach prioritizes clarity over cleverness, with a strong emphasis on type safety and
                predictable data flow.
              </p>
            </section>

            <section>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-12 mb-6 text-foreground">
                Core Principles
              </h2>
              <ol className="space-y-4 pl-6 list-decimal">
                <li>
                  <strong>Server-first by default</strong> - Leverage React Server Components for data fetching and
                  static content. Only reach for client components when you need interactivity, browser APIs, or state
                  management tied to user actions.
                </li>
                <li>
                  <strong>Separation of concerns</strong> - Keep data access in <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">lib/</code>, schema and types in <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">config/</code>, and UI logic in components.
                </li>
                <li>
                  <strong>Explicit data boundaries</strong> - Pass data down from Server Components as props to Client
                  Components. Avoid mixing server-only code with client bundles.
                </li>
                <li>
                  <strong>Performance-conscious caching</strong> - Use Next.js' built-in caching mechanisms
                  strategically. Cache stable content while keeping user-specific data fresh.
                </li>
                <li>
                  <strong>Type-safe throughout</strong> - Drizzle ORM paired with Zod validation ensures end-to-end
                  type safety from database to API to UI.
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-12 mb-6 text-foreground">
                Application Structure
              </h2>
              <p className="mb-4">
                We organize the codebase around feature domains rather than technical layers. This colocation makes
                it easier to reason about each feature in isolation.
              </p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
                <code>{`app/
├── (auth)/      # Authentication routes
├── (routes)/    # Protected application routes
└── api/         # API endpoints

lib/             # Data access, utilities, business logic
config/          # Database schema, constants, types
components/      # Reusable UI components
hooks/           # Custom React hooks
context/         # React context providers`}</code>
              </pre>
            </section>

            <section>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-12 mb-6 text-foreground">
                Key Takeaways
              </h2>
              <p>
                The best architecture is one that grows with you. By keeping things simple, explicit, and type-safe,
                we maintain velocity while avoiding unnecessary complexity. Server Components, proper caching, and clear
                boundaries form the foundation of a maintainable codebase.
              </p>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}
