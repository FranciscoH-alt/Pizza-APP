'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashPage() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Fade in
    const t1 = setTimeout(() => setVisible(true), 50);
    // Redirect to battle after splash
    const t2 = setTimeout(() => router.replace('/battle'), 1600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [router]);

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'linear-gradient(160deg, #D93025 0%, #9B1C15 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        padding: '40px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '24px',
          background: 'rgba(255,255,255,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        🍕
      </div>

      {/* Wordmark */}
      <div style={{ textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: 'var(--font-playfair, "Playfair Display", serif)',
            fontSize: '2rem',
            fontWeight: 700,
            color: '#FFF8E7',
            margin: '0 0 8px',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          }}
        >
          The Daily Slice
        </h1>
        <p
          style={{
            color: 'rgba(255,248,231,0.75)',
            fontSize: '1rem',
            margin: 0,
            fontWeight: 400,
            letterSpacing: '0.01em',
          }}
        >
          Vote the best slice in town
        </p>
      </div>

      {/* Loading dot */}
      <div
        style={{
          marginTop: '32px',
          display: 'flex',
          gap: '6px',
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'rgba(255,248,231,0.5)',
              animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
