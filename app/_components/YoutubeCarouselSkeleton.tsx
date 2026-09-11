export default function YoutubeCarouselSkeleton() {
  return (
    <section className="py-20 sm:py-28 border-b border-border/40 overflow-hidden bg-[#07090e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 font-mono text-xs text-muted-foreground mb-5">
            <span className="text-fuchsia-400">//</span> watch &amp; learn
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-balance">
            Video tutorials, <span className="neon-text-gradient">zero fluff</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Curated tutorials from Code Insights by Jack
          </p>
        </div>
      </div>
      <div className="relative">
        <div className="flex gap-4 w-max">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[280px] rounded-xl overflow-hidden border border-white/10 bg-card"
            >
              <div className="aspect-video bg-muted animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
