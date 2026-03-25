'use client';

import type { Battle, VoteSelection } from '@/types';

interface ResultsBarProps {
  battle: Battle;
  voted: VoteSelection;
  hideTagline?: boolean;
}

const TAGLINES: Record<string, string[]> = {
  round: ["You're a well-rounded person!", "Rolling with the classics!", "You're part of Team Round!", "Nice… keeping it classic!"],
  square: ["You're not a square!", "You like a square deal!", "You're part of Team Square!", "Corners > curves. Respect."],
  pepperoni: ["You're part of Team Pepperoni!", "Classic taste, no apologies.", "Pepperoni forever. End of debate."],
  cheese: ["You're a purist — and we love it.", "You're part of Team Cheese!", "Less is more. You get it."],
};

function pickTagline(option: string): string {
  const key = option.toLowerCase().trim();
  const list = TAGLINES[key] ?? [`You're part of Team ${option}!`, `${option} all the way!`, `Team ${option} for the win!`];
  return list[Math.floor(Math.random() * list.length)];
}

function getStatus(vote: 'a' | 'b', votesA: number, votesB: number): { emoji: string; text: string; color: string } {
  const mine = vote === 'a' ? votesA : votesB;
  const theirs = vote === 'a' ? votesB : votesA;
  const diff = mine - theirs;
  const pct = (votesA + votesB) > 0 ? Math.abs(diff) / (votesA + votesB) : 0;
  if (diff === 0) return { emoji: '🤝', text: "Dead heat!", color: '#8A7A6A' };
  if (pct < 0.05) return { emoji: '📍', text: 'Too close to call!', color: '#E8A020' };
  if (diff > 0 && pct >= 0.15) return { emoji: '🏆', text: 'Your team is DOMINATING!', color: '#2D6A4F' };
  if (diff > 0) return { emoji: '🔥', text: 'Your team is winning!', color: '#2D6A4F' };
  if (pct >= 0.15) return { emoji: '😤', text: 'Your team is fighting back!', color: '#D93025' };
  return { emoji: '⚔️', text: 'Your team is close behind!', color: '#D93025' };
}

export default function ResultsBar({ battle, voted, hideTagline }: ResultsBarProps) {
  if (!voted) return null;

  const votedOption = voted === 'a' ? battle.option_a : battle.option_b;
  const otherOption = voted === 'a' ? battle.option_b : battle.option_a;
  const userVotes = voted === 'a' ? battle.votes_a : battle.votes_b;
  const otherVotes = voted === 'a' ? battle.votes_b : battle.votes_a;
  const tagline = pickTagline(votedOption);
  const status = getStatus(voted, battle.votes_a, battle.votes_b);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Tagline */}
      {!hideTagline && (
        <p style={{ fontFamily: 'var(--font-playfair, "Playfair Display", serif)', fontWeight: 700, fontSize: '1.125rem', color: '#1C1C1C', margin: 0, textAlign: 'center', lineHeight: 1.3 }}>
          {tagline}
        </p>
      )}

      {/* Scoreboard */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#F7F0E0', borderRadius: 14, padding: '32px 20px' }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#8A7A6A' }}>YOUR PICK</p>
          <p style={{ margin: '8px 0 0', fontFamily: 'var(--font-ibm-mono, monospace)', fontWeight: 700, fontSize: 'clamp(3rem, 7vw, 4.5rem)', color: '#D93025', lineHeight: 1 }}>{userVotes.toLocaleString()}</p>
          <p style={{ margin: '8px 0 0', fontSize: 'clamp(1.25rem, 3vw, 1.625rem)', fontWeight: 600, color: '#1C1C1C' }}>{votedOption}</p>
        </div>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1C1C1C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ color: '#FFF8E7', fontSize: '0.75rem', fontWeight: 800 }}>VS</span>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#8A7A6A' }}>THEM</p>
          <p style={{ margin: '8px 0 0', fontFamily: 'var(--font-ibm-mono, monospace)', fontWeight: 700, fontSize: 'clamp(3rem, 7vw, 4.5rem)', color: '#3A3A3A', lineHeight: 1 }}>{otherVotes.toLocaleString()}</p>
          <p style={{ margin: '8px 0 0', fontSize: 'clamp(1.25rem, 3vw, 1.625rem)', fontWeight: 600, color: '#1C1C1C' }}>{otherOption}</p>
        </div>
      </div>

      {/* Status */}
      <p style={{ margin: 0, textAlign: 'center', fontSize: 'clamp(1.25rem, 3vw, 1.625rem)', fontWeight: 700, color: status.color }}>
        {status.emoji} {status.text}
      </p>
    </div>
  );
}
