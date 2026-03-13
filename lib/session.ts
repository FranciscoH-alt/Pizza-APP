'use client';

const SESSION_KEY = 'daily-slice-session';

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function getVotedBattles(): Record<string, 'a' | 'b'> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem('daily-slice-votes') || '{}');
  } catch {
    return {};
  }
}

export function saveVote(battleId: string, selected: 'a' | 'b'): void {
  if (typeof window === 'undefined') return;
  const votes = getVotedBattles();
  votes[battleId] = selected;
  localStorage.setItem('daily-slice-votes', JSON.stringify(votes));
}

export function getVoteForBattle(battleId: string): 'a' | 'b' | null {
  const votes = getVotedBattles();
  return votes[battleId] ?? null;
}
