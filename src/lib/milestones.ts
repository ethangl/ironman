export interface Milestone {
  threshold: number;
  label: string;
  badge: string;
}

export const MILESTONES: Milestone[] = [
  { threshold: 10, label: "Bronze", badge: "🥉" },
  { threshold: 25, label: "Silver", badge: "🥈" },
  { threshold: 50, label: "Gold", badge: "🥇" },
  { threshold: 100, label: "Century Club", badge: "💯" },
  { threshold: 250, label: "Diamond", badge: "💎" },
  { threshold: 500, label: "Legendary", badge: "🔥" },
];

export function getCurrentMilestone(count: number): Milestone | null {
  for (let i = MILESTONES.length - 1; i >= 0; i--) {
    if (count >= MILESTONES[i].threshold) return MILESTONES[i];
  }
  return null;
}

export function getNextMilestone(count: number): Milestone | null {
  return MILESTONES.find((m) => m.threshold > count) ?? null;
}

export function justHitMilestone(
  prevCount: number,
  newCount: number
): Milestone | null {
  return (
    MILESTONES.find(
      (m) => prevCount < m.threshold && newCount >= m.threshold
    ) ?? null
  );
}
