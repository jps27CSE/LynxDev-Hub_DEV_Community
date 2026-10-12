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
        </article>
      </div>
    </div>
  );
}
