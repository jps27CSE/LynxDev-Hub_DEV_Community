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
    <div className="rounded-xl sm:rounded-2xl border border-border bg-card p-3.5 sm:p-4 lg:p-5 overflow-hidden">
      <div className="flex items-start gap-2.5 sm:gap-3">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-xs sm:text-sm">Daily Tip</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed line-clamp-3">
            {tip}
          </p>
        </div>
      </div>
    </div>
  );
}

export default DailyTip;
