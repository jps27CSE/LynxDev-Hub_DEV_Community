const difficultyColors: Record<string, string> = {
  easy: "bg-green-500/10 text-green-500 border-green-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  hard: "bg-red-500/10 text-red-500 border-red-500/20",
};

export function difficultyBadgeClass(difficulty: string): string {
  return difficultyColors[difficulty] ?? "bg-muted text-muted-foreground";
}
