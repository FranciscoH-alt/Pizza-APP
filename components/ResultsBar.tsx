'use client';

import { useEffect, useState } from 'react';
import { Crown } from 'lucide-react';
import type { Battle, VoteSelection } from '@/types';
import { formatVotePercent, formatVoteCount } from '@/lib/utils';

interface ResultsBarProps {
  battle: Battle;
  voted: VoteSelection;
}

export default function ResultsBar({ battle, voted }: ResultsBarProps) {
  const [animate, setAnimate] = useState(false);
  const total = battle.votes_a + battle.votes_b;
  const pctA = formatVotePercent(battle.votes_a, total);
  const pctB = formatVotePercent(battle.votes_b, total);
  const winnerSide = battle.votes_a >= battle.votes_b ? 'a' : 'b';
  const winnerName = winnerSide === 'a' ? battle.option_a : battle.option_b;

  useEffect(() => {
    // Trigger bar animation after mount
    const t = setTimeout(() => setAnimate(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Winner announcement */}
      <div
        className="animate-scale-in"
        style={{
          textAlign: 'center',
          padding: '16px',
          background: 'linear-gradient(135deg, #FFF0C8, #FFF8E7)',
          borderRadius: '14px',
          border: '1px solid rgba(232, 160, 32, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Crown size={18} color="#C07800" />
          <span
            style={{
              fontFamily: 'var(--font-playfair, "Playfair Display", serif)',
              fontWeight: 700,
              fontSize: '1.0625rem',
              color: '#C07800',
            }}
          >
            {winnerName} is leading
          </span>
        </div>
        <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: '#8A7A6A' }}>
          {formatVoteCount(total)} slice{total !== 1 ? 's' : ''} cast today
        </p>
      </div>

      {/* Option A bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#1C1C1C' }}>
            {battle.option_a}
            {voted === 'a' && <span className="badge badge-tomato" style={{ marginLeft: '8px', fontSize: '0.6875rem' }}>Your pick</span>}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-ibm-mono, "IBM Plex Mono", monospace)',
              fontWeight: 700,
              fontSize: '1.25rem',
              color: '#D93025',
            }}
          >
            {pctA}%
          </span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill-a"
            style={{ width: animate ? `${pctA}%` : '0%' }}
          />
        </div>
      </div>

      {/* Option B bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#1C1C1C' }}>
            {battle.option_b}
            {voted === 'b' && <span className="badge badge-tomato" style={{ marginLeft: '8px', fontSize: '0.6875rem' }}>Your pick</span>}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-ibm-mono, "IBM Plex Mono", monospace)',
              fontWeight: 700,
              fontSize: '1.25rem',
              color: '#1C1C1C',
            }}
          >
            {pctB}%
          </span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill-b"
            style={{ width: animate ? `${pctB}%` : '0%' }}
          />
        </div>
      </div>

      {/* Location flavor */}
      <p
        style={{
          textAlign: 'center',
          fontSize: '0.875rem',
          color: '#8A7A6A',
          margin: 0,
          fontStyle: 'italic',
        }}
      >
        {battle.location} is leaning {winnerSide === 'a' ? battle.option_a : battle.option_b} today 🔥
      </p>
    </div>
  );
}
