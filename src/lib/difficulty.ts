const LABELS = [
  { threshold: 4, label: "Brutal", color: "text-red-400" },
  { threshold: 2.5, label: "Hard", color: "text-orange-400" },
  { threshold: 1.5, label: "Moderate", color: "text-yellow-400" },
  { threshold: 0.8, label: "Chill", color: "text-green-400" },
  { threshold: 0, label: "Easy", color: "text-emerald-400" },
] as const;

export function difficultyLabel(score: number): {
  label: string;
  color: string;
} {
  for (const l of LABELS) {
    if (score >= l.threshold) return { label: l.label, color: l.color };
  }
  return LABELS[LABELS.length - 1];
}
