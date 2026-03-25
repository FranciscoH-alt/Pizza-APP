'use client';

const PIECES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${5 + (i * 5.5) % 90}%`,
  delay: `${(i * 0.07) % 0.8}s`,
  duration: `${1.1 + (i * 0.09) % 0.7}s`,
  size: `${18 + (i * 7) % 16}px`,
}));

export default function PizzaConfetti() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999, overflow: 'hidden' }}>
      {PIECES.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            top: 0,
            left: p.left,
            fontSize: p.size,
            animation: `pizzaFall ${p.duration} ${p.delay} ease-in forwards`,
            lineHeight: 1,
          }}
        >
          🍕
        </span>
      ))}
    </div>
  );
}
