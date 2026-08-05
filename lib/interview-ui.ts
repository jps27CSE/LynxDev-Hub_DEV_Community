const difficultyColors: Record<string, string> = {
  easy: "bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-500",
  medium:
    "bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:text-yellow-500",
  hard: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-500",
  Beginner:
    "bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-500",
  Intermediate:
    "bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:text-yellow-500",
  Advanced: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-500",
};

const difficultyAccents: Record<string, string> = {
  easy: "border-l-green-500",
  medium: "border-l-yellow-500",
  hard: "border-l-red-500",
};

const difficultyDots: Record<string, string> = {
  easy: "bg-green-500",
  medium: "bg-yellow-500",
  hard: "bg-red-500",
};

const difficultyText: Record<string, string> = {
  easy: "text-green-700 dark:text-green-500",
  medium: "text-yellow-700 dark:text-yellow-500",
  hard: "text-red-600 dark:text-red-500",
};

const difficultyIconBg: Record<string, string> = {
  easy: "bg-green-500/10",
  medium: "bg-yellow-500/10",
  hard: "bg-red-500/10",
  Beginner: "bg-green-500/10",
  Intermediate: "bg-yellow-500/10",
  Advanced: "bg-red-500/10",
};

export const DIFFICULTY_ORDER: Record<string, number> = {
  easy: 0,
  medium: 1,
  hard: 2,
};

export function difficultyBadgeClass(difficulty: string): string {
  return difficultyColors[difficulty] ?? "bg-muted text-muted-foreground";
}

export function difficultyIconClass(difficulty: string): string {
  return difficultyIconBg[difficulty] ?? "bg-muted";
}

export function difficultyAccentClass(difficulty: string): string {
  return difficultyAccents[difficulty] ?? "border-l-border";
}

export function difficultyDotClass(difficulty: string): string {
  return difficultyDots[difficulty] ?? "bg-muted-foreground/50";
}

export function difficultyTextClass(difficulty: string): string {
  return difficultyText[difficulty] ?? "text-muted-foreground";
}
