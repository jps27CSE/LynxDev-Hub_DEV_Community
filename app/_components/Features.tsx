import {
  BookOpen,
  BrainCircuit,
  Code2,
  Target,
  type LucideIcon,
} from "lucide-react";

type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  glow: string;
  chip: string;
};

const features: Feature[] = [
  {
    title: "Interactive Courses",
    description:
      "Hands-on courses with real exercises and an embedded editor per chapter — structured learning, not just videos.",
    icon: BookOpen,
    accent: "text-cyan-400",
    glow: "bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.2)]",
    chip: "text-cyan-400/80",
  },
  {
    title: "Code Editor",
    description:
      "A dedicated browser workspace — write and run JavaScript instantly, save your code as a file, and import it back.",
    icon: Code2,
    accent: "text-blue-400",
    glow: "bg-blue-400/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]",
    chip: "text-blue-400/80",
  },
  {
    title: "DSA Problems",
    description:
      "Practice 220+ DSA problems — beginner drills to LeetCode classics — statement and editor side by side, mark solved as you go.",
    icon: BrainCircuit,
    accent: "text-amber-400",
    glow: "bg-amber-400/10 shadow-[0_0_20px_rgba(251,191,36,0.2)]",
    chip: "text-amber-400/80",
  },
  {
    title: "Interview Prep",
    description:
      "Practice with 900+ categorized questions and tag-based customization, built around real-world interview chapters.",
    icon: Target,
    accent: "text-lime-400",
    glow: "bg-lime-400/10 shadow-[0_0_20px_rgba(163,230,53,0.2)]",
    chip: "text-lime-400/80",
  },
];

function SectionKicker() {
  return (
    <div className="text-center mb-14">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 font-mono text-xs text-muted-foreground mb-5">
        <span className="text-cyan-400">//</span> features
      </div>
      <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-balance">
        Everything you need to{" "}
        <span className="neon-text-gradient">level up</span>
      </h2>
      <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
        From zero to job-ready — all free, all in one place.
      </p>
    </div>
  );
}

function Features() {
  return (
    <section className="py-20 sm:py-28 border-b border-border/40 bg-[#07090e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionKicker />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="neon-border h-full">
                <div className="rounded-[calc(1rem-1px)] bg-card p-6 h-full flex flex-col">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${feature.glow}`}
                  >
                    <Icon className={`w-6 h-6 ${feature.accent}`} />
                  </div>
                  <h3 className="font-display font-bold text-lg">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed flex-1">
                    {feature.description}
                  </p>
                  <div className={`mt-5 font-mono text-[11px] ${feature.chip}`}>
                    <span className="opacity-60">{"//"}</span>{" "}
                    {feature.title.toLowerCase().replace(/[^a-z]+/g, "-")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Features;
