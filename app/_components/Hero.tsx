import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Infinity as InfinityIcon,
  Sparkles,
} from "lucide-react";

const stats = [
  { value: "12+", label: "Interactive courses", accent: "text-cyan-400" },
  { value: "900+", label: "Interview questions", accent: "text-fuchsia-400" },
  { value: "$0", label: "Forever free", accent: "text-lime-400" },
];

function TerminalLines() {
  return (
    <div className="font-mono text-[13px] sm:text-sm leading-relaxed">
      <p className="text-muted-foreground/60">
        <span className="text-cyan-400">$</span> lynxdevhub{" "}
        <span className="text-fuchsia-400">--launch</span>
      </p>
      <p className="text-lime-400">✔ booting developer platform...</p>
      <p className="text-slate-300">
        <span className="text-cyan-400">✔</span> 12+ interactive courses loaded
      </p>
      <p className="text-slate-300">
        <span className="text-cyan-400">✔</span> 900+ interview questions
        indexed
      </p>
      <p className="text-slate-300">
        <span className="text-cyan-400">✔</span>{" "}
        <span className="text-fuchsia-400">ai-mentor</span> online — streaming
        ready
      </p>
      <p className="mt-3 text-slate-400">
        <span className="text-cyan-400">$</span> welcome, developer.
        <span className="neon-caret" />
      </p>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/40">
      <div className="absolute inset-0 bg-[#05060a]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_80%)]" />
      <div className="absolute -top-40 -left-40 h-[36rem] w-[36rem] rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="absolute -top-20 -right-32 h-[34rem] w-[34rem] rounded-full bg-fuchsia-500/10 blur-[120px]" />
      <div className="absolute bottom-0 left-1/3 h-80 w-[40rem] rounded-full bg-lime-500/[0.06] blur-[100px]" />
      <div className="neon-grid-floor" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28 lg:py-36">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-10 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-1.5 text-sm font-medium text-cyan-200/90 mb-8">
              <span className="neon-pulse w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="font-mono">$</span> a dev platform by Jack Pritom
              Soren
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-bold tracking-tight leading-[1.02] text-balance [filter:drop-shadow(0_0_28px_rgba(34,211,238,0.18))]">
              <span className="neon-text-gradient">Learn. Build.</span>
              <br />
              <span className="neon-text-gradient">Grow.</span>{" "}
              <span className="relative inline-block">
                For free.
                <span className="absolute -inset-x-2 -bottom-1 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent sm:-bottom-2" />
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Interactive courses, an AI mentor, interview prep, and a developer
              community — handcrafted, zero-cost, and built for engineers who
              want to ship.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4">
              <Link href="/sign-in" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-base px-8 h-12 rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white shadow-[0_0_24px_rgba(34,211,238,0.35)] hover:shadow-[0_0_36px_rgba(232,121,249,0.5)] hover:brightness-110 transition-all"
                >
                  Start Building Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/courses" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-base px-8 py-2 rounded-lg border-cyan-400/30 bg-transparent text-cyan-100 hover:bg-cyan-400/10 hover:text-white hover:border-cyan-400/60"
                >
                  Browse Courses
                </Button>
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0 border-t border-border/50 pt-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <div
                    className={`font-display font-bold text-2xl sm:text-3xl ${stat.accent}`}
                  >
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="neon-border rounded-2xl shadow-[0_0_60px_rgba(34,211,238,0.12)]">
              <div className="rounded-[calc(1rem-1px)] bg-[#0a0c12] p-2">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <span className="w-3 h-3 rounded-full bg-lime-400/80" />
                  <span className="ml-3 font-mono text-xs text-muted-foreground">
                    lynxdevhub — zsh
                  </span>
                </div>
                <div className="p-5">
                  <TerminalLines />
                </div>
              </div>
            </div>

            <div className="neon-float absolute -top-6 -left-8 rounded-xl border border-cyan-400/30 bg-[#0a0c14]/90 px-4 py-3 shadow-[0_0_30px_rgba(34,211,238,0.15)]">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-xs text-cyan-100">
                  npm run mentor
                </span>
              </div>
            </div>

            <div
              className="neon-float absolute -bottom-5 -right-4 rounded-xl border border-fuchsia-400/30 bg-[#0a0c14]/90 px-4 py-3 shadow-[0_0_30px_rgba(232,121,249,0.15)]"
              style={{ animationDelay: "1.2s" }}
            >
              <div className="flex items-center gap-2">
                <InfinityIcon className="w-4 h-4 text-fuchsia-400" />
                <span className="font-mono text-xs text-fuchsia-100">
                  open source
                </span>
              </div>
            </div>

            <div
              className="neon-float absolute -top-6 right-8 rounded-xl border border-lime-400/30 bg-[#0a0c14]/90 px-4 py-3 shadow-[0_0_30px_rgba(163,230,53,0.15)]"
              style={{ animationDelay: "2.1s" }}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-lime-400" />
                <span className="font-mono text-xs text-lime-100">
                  deploy: success
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
