import { Button } from "@/components/ui/button";
import Link from "next/link";

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/40">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground mb-8">
            by Jack Pritom Soren
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight">
            Learn. Build. Grow.{" "}
            <span className="text-primary">For Free.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Interactive coding courses, AI mentorship, developer community, and
            interview prep -- handcrafted by a software engineer for developers.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="w-full sm:w-auto text-base px-8">
                Start Learning Free
              </Button>
            </Link>
            <Link href="/courses">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-base px-8"
              >
                Browse Courses
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
