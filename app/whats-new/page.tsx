import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Code2,
  LucideIcon,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WHATS_NEW } from "@/config/whats-new";

export const metadata: Metadata = {
  title: `What's New — LynxDEV v${WHATS_NEW.version}`,
  description: WHATS_NEW.summary,
};

const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  Code2,
  BrainCircuit,
  Target,
};

const accentMap: Record<string, { accent: string; glow: string }> = {
  BookOpen: {
    accent: "text-cyan-400",
    glow: "bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.2)]",
  },
  Code2: {
    accent: "text-blue-400",
    glow: "bg-blue-400/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]",
  },
  BrainCircuit: {
    accent: "text-amber-400",
    glow: "bg-amber-400/10 shadow-[0_0_20px_rgba(251,191,36,0.2)]",
  },
  Target: {
    accent: "text-lime-400",
    glow: "bg-lime-400/10 shadow-[0_0_20px_rgba(163,230,53,0.2)]",
  },
};

export default function WhatsNewPage() {
  const { version, headline, summary, features, fixesSummary } = WHATS_NEW;

  return (
    <>
      <div className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-grid-paper" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="pt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
          <div className="py-16 sm:py-24">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/50 bg-card/50 text-xs text-muted-foreground mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                v{version} — Latest release
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight leading-[1.1]">
                {headline.split("1.0")[0]}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-500/60">
                  1.0
                </span>
                {headline.split("1.0")[1]}
              </h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-xl leading-relaxed">
                {summary}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-xl font-semibold">What&apos;s New</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Everything available in v{version}, right now
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-emerald-500/70" />
            {features.length} features live
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature) => {
            const Icon = iconMap[feature.icon] ?? Sparkles;
            const colors = accentMap[feature.icon] ?? {
              accent: "text-emerald-500",
              glow: "bg-emerald-500/10",
            };
            return (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-lg overflow-hidden"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-emerald-500/[0.04] to-transparent" />
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ring-1 ring-border relative ${colors.glow}`}
                >
                  <Icon className={`w-6 h-6 ${colors.accent}`} />
                </div>
                <h3 className="font-bold text-lg mt-4 group-hover:text-emerald-500 transition-colors relative">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed relative">
                  {feature.description}
                </p>
                <div
                  className={`mt-5 font-mono text-[11px] ${colors.accent} opacity-80 relative`}
                >
                  <span className="opacity-60">{"//"}</span>{" "}
                  {feature.title.toLowerCase().replace(/[^a-z]+/g, "-")}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 rounded-2xl border border-border/50 bg-card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold">Under the hood</h2>
              <p className="text-sm text-muted-foreground">
                Improvements shipped with v{version}
              </p>
            </div>
          </div>
          <ul className="mt-5 space-y-3">
            {fixesSummary.map((fix) => (
              <li key={fix} className="flex items-start gap-2.5 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500/70 mt-1.5 flex-shrink-0" />
                <span className="text-muted-foreground">{fix}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/dashboard">
              Start Learning
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
