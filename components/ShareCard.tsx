'use client';

import { useState } from 'react';
import { Copy, Check, MoreHorizontal } from 'lucide-react';
import type { Battle, VoteSelection } from '@/types';
import { formatVotePercent } from '@/lib/utils';

interface ShareCardProps {
  battle: Battle;
  voted: VoteSelection;
  onShare?: () => void;
}

// X (Twitter) bird icon as SVG
function XIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// Facebook icon
function FBIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

// SMS / Messages icon
function SMSIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export default function ShareCard({ battle, voted, onShare }: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  const total = battle.votes_a + battle.votes_b;
  const pctA = formatVotePercent(battle.votes_a, total);
  const pctB = formatVotePercent(battle.votes_b, total);
  const votedName = voted === 'a' ? battle.option_a : voted === 'b' ? battle.option_b : null;

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://thedailyslice.app';
  const shareText = votedName
    ? `I voted ${votedName} in today's pizza battle! 🍕\n${battle.option_a}: ${pctA}% vs ${battle.option_b}: ${pctB}%\nVote at ${appUrl}`
    : `Today's battle: ${battle.title}\n${battle.option_a}: ${pctA}% vs ${battle.option_b}: ${pctB}%\nVote at ${appUrl}`;

  function trackAndShare() {
    onShare?.();
  }

  function shareToX() {
    trackAndShare();
    const text = encodeURIComponent(shareText);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'noopener');
  }

  function shareToFacebook() {
    trackAndShare();
    const url = encodeURIComponent(appUrl);
    const quote = encodeURIComponent(votedName ? `I voted ${votedName}! 🍕` : battle.title);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`, '_blank', 'noopener');
  }

  function shareViaSMS() {
    trackAndShare();
    const body = encodeURIComponent(shareText);
    // iOS uses &body=, Android uses ?body=
    window.open(`sms:?&body=${body}`);
  }

  async function copyLink() {
    trackAndShare();
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  async function shareMore() {
    trackAndShare();
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText, url: appUrl });
      } catch {
        // dismissed
      }
    }
  }

  const socialButtons: Array<{
    label: string;
    icon: React.ReactNode;
    bg: string;
    color: string;
    onClick: () => void;
  }> = [
    { label: 'X', icon: <XIcon />, bg: '#000000', color: '#FFFFFF', onClick: shareToX },
    { label: 'Facebook', icon: <FBIcon />, bg: '#1877F2', color: '#FFFFFF', onClick: shareToFacebook },
    { label: 'Message', icon: <SMSIcon />, bg: '#34C759', color: '#FFFFFF', onClick: shareViaSMS },
    {
      label: copied ? 'Copied!' : 'Copy',
      icon: copied ? <Check size={17} /> : <Copy size={17} />,
      bg: '#F2E8D0',
      color: '#1C1C1C',
      onClick: copyLink,
    },
    ...(typeof navigator !== 'undefined' && 'share' in navigator
      ? [{ label: 'More', icon: <MoreHorizontal size={17} />, bg: '#F2E8D0', color: '#1C1C1C', onClick: shareMore }]
      : []),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Visual preview card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #D93025 0%, #9B1C15 100%)',
          borderRadius: '16px',
          padding: '24px',
          color: '#FFF8E7',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

        <p style={{ margin: '0 0 4px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.8 }}>
          The Daily Slice
        </p>

        {votedName ? (
          <p style={{ fontFamily: 'var(--font-playfair, "Playfair Display", serif)', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 16px', lineHeight: 1.2 }}>
            I voted<br />{votedName} 🍕
          </p>
        ) : (
          <p style={{ fontFamily: 'var(--font-playfair, "Playfair Display", serif)', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 16px', lineHeight: 1.3 }}>
            {battle.title}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[{ label: battle.option_a, pct: pctA }, { label: battle.option_b, pct: pctB }].map(({ label, pct }) => (
            <div key={label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8125rem', fontWeight: 600 }}>
                <span>{label}</span>
                <span style={{ fontFamily: 'monospace' }}>{pct}%</span>
              </div>
              <div style={{ height: '8px', borderRadius: '9999px', background: 'rgba(255,255,255,0.25)' }}>
                <div style={{ height: '100%', width: `${pct}%`, borderRadius: '9999px', background: '#FFF8E7' }} />
              </div>
            </div>
          ))}
        </div>

        <p style={{ margin: '14px 0 0', fontSize: '0.6875rem', opacity: 0.7 }}>
          thedailyslice.app · {battle.location}
        </p>
      </div>

      {/* Social share buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {socialButtons.map((btn) => (
          <button
            key={btn.label}
            onClick={btn.onClick}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              padding: '12px 6px',
              background: btn.bg,
              color: btn.color,
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '0.6875rem',
              fontWeight: 700,
              transition: 'opacity 0.15s ease, transform 0.1s ease',
              WebkitTapHighlightColor: 'transparent',
              minWidth: 0,
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onTouchStart={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
            onTouchEnd={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {btn.icon}
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
