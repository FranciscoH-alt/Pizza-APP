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

/**
 * Resolves the canonical session ID by syncing with the server's IP→UUID mapping.
 * - If the server recognises this IP and localStorage is empty, the old UUID is restored.
 * - If localStorage already has a UUID, that value wins and the server mapping is updated.
 * Always stores the result back in localStorage before returning.
 */
export async function resolveSession(): Promise<string> {
  if (typeof window === 'undefined') return '';
  const local = localStorage.getItem(SESSION_KEY);
  try {
    const url = local ? `/api/session?sid=${encodeURIComponent(local)}` : '/api/session';
    const res = await fetch(url);
    if (!res.ok) throw new Error('session api failed');
    const { session_id } = await res.json();
    localStorage.setItem(SESSION_KEY, session_id);
    return session_id;
  } catch {
    // Network error or missing service role key — fall back to local UUID
    return getOrCreateSessionId();
  }
}
