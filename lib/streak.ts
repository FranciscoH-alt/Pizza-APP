import type { StreakData } from '@/types';

const STREAK_KEY = 'daily-slice-streak';
export const MILESTONE_LEVELS = [3, 7, 30];

function yesterday(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function getStreak(): StreakData {
  if (typeof window === 'undefined') {
    return { current: 0, longest: 0, lastVoteDate: null, lifetimeVotes: 0, milestonesReached: [] };
  }
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return { current: 0, longest: 0, lastVoteDate: null, lifetimeVotes: 0, milestonesReached: [] };
    return JSON.parse(raw) as StreakData;
  } catch {
    return { current: 0, longest: 0, lastVoteDate: null, lifetimeVotes: 0, milestonesReached: [] };
  }
}

export function recordDailyVote(today: string): { streak: StreakData; newMilestone: number | null } {
  if (typeof window === 'undefined') return { streak: getStreak(), newMilestone: null };

  const prev = getStreak();

  // Already recorded for today — no change
  if (prev.lastVoteDate === today) return { streak: prev, newMilestone: null };

  const newCurrent =
    prev.lastVoteDate === yesterday(today) ? prev.current + 1 : 1;

  const newLongest = Math.max(prev.longest, newCurrent);
  const newLifetime = prev.lifetimeVotes + 1;

  // Check if a new milestone was just crossed for the first time
  const newMilestone =
    MILESTONE_LEVELS.find(
      (m) => newCurrent >= m && !prev.milestonesReached.includes(m)
    ) ?? null;

  const newMilestones = newMilestone
    ? [...prev.milestonesReached, newMilestone]
    : prev.milestonesReached;

  const updated: StreakData = {
    current: newCurrent,
    longest: newLongest,
    lastVoteDate: today,
    lifetimeVotes: newLifetime,
    milestonesReached: newMilestones,
  };

  localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
  return { streak: updated, newMilestone };
}
