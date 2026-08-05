import { Lightbulb } from "lucide-react";

const tips = [
  "Consistency beats intensity. Code for 30 minutes daily rather than 5 hours on weekends.",
  "Build projects, not just follow tutorials. Apply what you learn by creating something yourself.",
  "Teach others to solidify your knowledge. Writing blogs or helping peers reinforces learning.",
  "Focus on fundamentals first. Strong basics in CS concepts will help you adapt to any framework.",
  "Read documentation. It's the most underrated skill for becoming a self-sufficient developer.",
  "Take breaks. Your brain needs time to process and consolidate new information.",
  "Don't compare your journey to others. Everyone learns at their own pace.",
];

function DailyTip() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (now.getTime() - startOfYear.getTime()) / 86_400_000,
  );
  const tip = tips[dayOfYear % tips.length];

  return (
    <div className="rounded-xl border border-border/50 bg-card p-5">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Daily Tip</h3>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            {tip}
          </p>
        </div>
      </div>
    </div>
  );
}

export default DailyTip;
