import Image from 'next/image';
import { Check } from 'lucide-react';

interface BattleCardProps {
  name: string;
  image: string | null;
  side: 'a' | 'b';
  onClick?: () => void;
  selected?: boolean;
  dimmed?: boolean;
  disabled?: boolean;
  isLeading?: boolean;
  bounce?: boolean;
  compact?: boolean;
  fillHeight?: boolean;
}

export default function BattleCard({ name, image, side, onClick, selected, dimmed, disabled, isLeading, bounce, compact, fillHeight }: BattleCardProps) {
  const accentColor = side === 'a' ? '#D93025' : '#1C1C1C';
  const fallbackGradient =
    side === 'a'
      ? 'linear-gradient(135deg, #D93025 0%, #9B1C15 100%)'
      : 'linear-gradient(135deg, #3A3A3A 0%, #1C1C1C 100%)';
  const isLogo = image?.startsWith('/restaurants/');

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={bounce ? 'animate-vote-bounce' : undefined}
      style={{
        flex: 1,
        height: fillHeight ? '100%' : undefined,
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: disabled ? 'default' : 'pointer',
        borderRadius: '14px',
        display: 'block',
        WebkitTapHighlightColor: 'transparent',
        // Selected: colored border ring
        outline: selected ? `3px solid ${accentColor}` : '3px solid transparent',
        outlineOffset: '0px',
        transform: selected ? 'scale(1.01)' : dimmed ? 'scale(0.98)' : 'scale(1)',
        opacity: dimmed ? 0.45 : 1,
        transition: bounce ? 'none' : 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease, outline-color 0.15s ease',
      }}
    >
      <div
        className={isLeading && !dimmed ? (side === 'a' ? 'animate-glow-a' : 'animate-glow-b') : undefined}
        style={{
          borderRadius: '14px',
          overflow: 'hidden',
          height: fillHeight ? '100%' : undefined,
          background: '#FFFFFF',
          boxShadow: selected
            ? `0 6px 24px ${accentColor}40`
            : '0 2px 12px rgba(28,28,28,0.10)',
          transition: 'box-shadow 0.2s ease',
          position: 'relative',
        }}
      >
        {/* Image area */}
        <div
          style={{
            position: 'relative',
            height: fillHeight ? '100%' : compact ? '260px' : 'clamp(340px, 58vh, 620px)',
            background: isLogo ? '#FFF8E7' : fallbackGradient,
            overflow: 'hidden',
          }}
        >
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              style={{ objectFit: isLogo ? 'contain' : 'cover', padding: isLogo ? '24px' : 0 }}
              sizes="(max-width: 480px) 50vw, 240px"
              priority
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3.5rem',
              }}
            >
              🍕
            </div>
          )}

          {/* Top gradient for name readability — only for photo images */}
          {!isLogo && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '140px',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.80), transparent)',
              }}
            />
          )}

          {/* Name overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              padding: '16px 16px',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-playfair, "Playfair Display", Georgia, serif)',
                fontWeight: 700,
                fontSize: 'clamp(1.75rem, 5vw, 2.75rem)',
                color: isLogo ? '#1C1C1C' : '#FFFFFF',
                margin: 0,
                lineHeight: 1.2,
                textShadow: isLogo ? 'none' : '0 1px 4px rgba(0,0,0,0.5)',
              }}
            >
              {name}
            </p>
          </div>

          {/* TAP TO VOTE badge — bottom center */}
          {!selected && !dimmed && (
            <div
              style={{
                position: 'absolute',
                bottom: '14px',
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  background: 'rgba(0,0,0,0.72)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: 'clamp(0.875rem, 2.2vw, 1.125rem)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  padding: '6px 14px',
                  borderRadius: 9999,
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                }}
              >
                Tap to vote
              </span>
            </div>
          )}

          {/* Selected checkmark badge */}
          {selected && (
            <div
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: accentColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              <Check size={15} color="#FFF" strokeWidth={3} />
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
