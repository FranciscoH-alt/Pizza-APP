interface StreakBadgeProps {
  streak: number;
  isMilestone?: boolean;
}

export default function StreakBadge({ streak, isMilestone }: StreakBadgeProps) {
  if (streak < 1) return null;

  const isCrown = streak >= 30;
  const isGolden = streak >= 7;
  const isAnimated = streak >= 3;

  const icon = isCrown ? '👑' : '🔥';

  const label = streak === 1 ? '1 day streak' : `${streak} day streak`;

  const bg = isCrown
    ? '#D93025'
    : isGolden
    ? '#FFF0C8'
    : streak >= 3
    ? '#FFF0C8'
    : '#F2E8D0';

  const color = isCrown
    ? '#FFFFFF'
    : isGolden
    ? '#C07800'
    : streak >= 3
    ? '#C07800'
    : '#8A7A6A';

  const border = isGolden
    ? '1px solid rgba(232,160,32,0.4)'
    : isCrown
    ? 'none'
    : '1px solid #E0D4B8';

  return (
    <div
      className={isAnimated ? (isMilestone ? 'animate-milestone' : 'animate-streak') : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        borderRadius: 9999,
        padding: '5px 12px',
        background: bg,
        color,
        border,
        fontSize: '0.8125rem',
        fontWeight: 700,
        letterSpacing: '0.02em',
      }}
    >
      <span style={{ fontSize: '0.875rem' }}>{icon}</span>
      {label}
    </div>
  );
}
