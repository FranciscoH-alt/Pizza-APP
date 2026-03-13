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
}

export default function BattleCard({ name, image, side, onClick, selected, dimmed, disabled, isLeading, bounce }: BattleCardProps) {
  const accentColor = side === 'a' ? '#D93025' : '#1C1C1C';
  const fallbackGradient =
    side === 'a'
      ? 'linear-gradient(135deg, #D93025 0%, #9B1C15 100%)'
      : 'linear-gradient(135deg, #3A3A3A 0%, #1C1C1C 100%)';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={bounce ? 'animate-vote-bounce' : undefined}
      style={{
        flex: 1,
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: disabled ? 'default' : 'pointer',
        borderRadius: '14px',
        display: 'block',
        WebkitTapHighlightColor: 'transparent',
        // Selected: colored border ring
        outline: selected ? `3px solid ${accentColor}` : '3px solid transparent',
        outlineOffset: '2px',
        transform: selected ? 'scale(1.03)' : dimmed ? 'scale(0.97)' : 'scale(1)',
        opacity: dimmed ? 0.45 : 1,
        transition: bounce ? 'none' : 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease, outline-color 0.15s ease',
      }}
    >
      <div
        className={isLeading && !dimmed ? (side === 'a' ? 'animate-glow-a' : 'animate-glow-b') : undefined}
        style={{
          borderRadius: '14px',
          overflow: 'hidden',
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
            height: '200px',
            background: fallbackGradient,
            overflow: 'hidden',
          }}
        >
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              style={{ objectFit: 'cover' }}
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

          {/* Bottom gradient for name readability */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '80px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.72), transparent)',
            }}
          />

          {/* Name overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '10px 12px',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-playfair, "Playfair Display", Georgia, serif)',
                fontWeight: 700,
                fontSize: '0.9375rem',
                color: '#FFFFFF',
                margin: 0,
                lineHeight: 1.2,
                textShadow: '0 1px 3px rgba(0,0,0,0.4)',
              }}
            >
              {name}
            </p>
            {!selected && !dimmed && (
              <p
                style={{
                  margin: '3px 0 0',
                  fontSize: '0.6875rem',
                  color: 'rgba(255,255,255,0.75)',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Tap to vote
              </p>
            )}
          </div>

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
