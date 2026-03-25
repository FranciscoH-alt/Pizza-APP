'use client';

import { useState } from 'react';
import type { Battle, VoteSelection } from '@/types';

interface ShareCardProps {
  battle: Battle;
  voted: VoteSelection;
  onShare?: () => void;
}

export default function ShareCard({ battle, voted, onShare }: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  const votedName = voted === 'a' ? battle.option_a : voted === 'b' ? battle.option_b : null;
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://thedailyslice.app';
  const shareText = votedName
    ? `I voted ${votedName} in today's pizza battle! 🍕\n${battle.option_a} vs ${battle.option_b}\nVote at ${appUrl}`
    : `Today's battle: ${battle.title}\nVote at ${appUrl}`;

  async function handleShare() {
    onShare?.();
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText, url: appUrl });
        return;
      } catch {
        // dismissed — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <button
      onClick={handleShare}
      style={{
        width: '100%',
        background: '#1C1C1C',
        color: '#FFF8E7',
        border: 'none',
        borderRadius: 9999,
        padding: '12px 0',
        fontWeight: 700,
        fontSize: '0.9375rem',
        cursor: 'pointer',
        letterSpacing: '0.01em',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {copied ? '✓ LINK COPIED!' : '🍕 SHARE YOUR PICK'}
    </button>
  );
}
