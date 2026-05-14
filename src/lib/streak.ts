/**
 * Calculate the current consecutive-day streak ending on `upToDate`.
 *
 * @param dates   ISO date strings (YYYY-MM-DD) of all existing mood entries.
 * @param upToDate  The date being saved (included in the streak even if not yet in `dates`).
 * @returns Number of consecutive days in the streak (≥ 1 after a successful save).
 */
export function calculateStreak(dates: string[], upToDate: string): number {
  const dateSet = new Set(dates);
  dateSet.add(upToDate); // include the date just saved

  let streak = 0;
  const [y, m, d] = upToDate.split('-').map(Number);
  let current = new Date(y, m - 1, d); // local midnight

  while (true) {
    const iso = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
    if (!dateSet.has(iso)) break;
    streak++;
    current = new Date(current.getFullYear(), current.getMonth(), current.getDate() - 1);
  }

  return streak;
}

export const STREAK_MILESTONES = [3, 7, 14, 30, 100] as const;
export type StreakMilestone = (typeof STREAK_MILESTONES)[number];

/** Return the exact milestone value if `streak` hits one, otherwise null. */
export function getStreakMilestone(streak: number): StreakMilestone | null {
  return (STREAK_MILESTONES as readonly number[]).includes(streak)
    ? (streak as StreakMilestone)
    : null;
}

/** Human-readable label for a streak milestone toast. */
export function milestoneMessage(milestone: StreakMilestone): string {
  const labels: Record<StreakMilestone, string> = {
    3:   '3-day streak — you\'re building a habit! 🌱',
    7:   '7-day streak — one whole week! keep it up! 🌟',
    14:  '14-day streak — two weeks strong, you\'re on a roll! 🔥',
    30:  '30-day streak — incredible consistency! 💪',
    100: '100-day streak — you\'re a mood-tracking legend! 🏆',
  };
  return labels[milestone];
}
