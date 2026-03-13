'use client';

import { useState } from 'react';
import { Phone, MapPin, ExternalLink, Tag, Copy, Check } from 'lucide-react';
import type { Deal } from '@/types';

interface DealCardProps {
  deal: Deal;
  onCTAClick?: (deal: Deal, ctaType: 'call' | 'directions' | 'order') => void;
}

// Extract coupon code from description text
// Matches: "code FIVE25", "Code: G-PZ78", "coupon code G-MSC11_1", "code 29203"
function extractCouponCode(text: string | null): string | null {
  if (!text) return null;
  const match = text.match(/(?:coupon\s+)?code[:\s]+([A-Z0-9_-]{3,})/i);
  return match ? match[1].toUpperCase() : null;
}

function CouponBadge({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <button
      onClick={handleCopy}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        background: copied ? '#F0FFF4' : '#FFFBF0',
        border: `2px dashed ${copied ? '#2D6A4F' : '#E8A020'}`,
        borderRadius: '10px',
        padding: '10px 14px',
        cursor: 'pointer',
        marginBottom: '12px',
        WebkitTapHighlightColor: 'transparent',
        transition: 'background 0.2s ease, border-color 0.2s ease',
      }}
    >
      <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#8A7A6A', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
        Promo code
      </span>
      <span
        style={{
          flex: 1,
          fontFamily: 'var(--font-ibm-mono, "IBM Plex Mono", monospace)',
          fontWeight: 700,
          fontSize: '1rem',
          color: copied ? '#2D6A4F' : '#C07800',
          letterSpacing: '0.08em',
          textAlign: 'left',
        }}
      >
        {code}
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', fontWeight: 600, color: copied ? '#2D6A4F' : '#8A7A6A', whiteSpace: 'nowrap' }}>
        {copied ? <Check size={13} /> : <Copy size={13} />}
        {copied ? 'Copied!' : 'Tap to copy'}
      </span>
    </button>
  );
}

export default function DealCard({ deal, onCTAClick }: DealCardProps) {
  const couponCode = extractCouponCode(deal.description);

  // Strip "Use code XXXX" from description so code only appears in the badge
  const cleanDescription = deal.description
    ? deal.description
        .replace(/\.?\s*(?:Use\s+)?(?:coupon\s+)?(?:code|Code)[:\s]+[A-Z0-9_-]{3,}\.?/gi, '')
        .trim()
        .replace(/\.$/, '')
        .trim()
    : null;

  return (
    <div className="card" style={{ padding: '18px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-playfair, "Playfair Display", serif)', fontWeight: 700, fontSize: '1rem', color: '#1C1C1C', margin: '0 0 2px' }}>
            {deal.restaurant_name}
          </p>
          {deal.area && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', color: '#8A7A6A' }}>
              <MapPin size={11} />
              {deal.area}
            </span>
          )}
        </div>
        {deal.expiration && (
          <span className="badge badge-gold">
            <Tag size={9} />
            {deal.expiration}
          </span>
        )}
      </div>

      {/* Deal title */}
      <p style={{ fontWeight: 700, fontSize: '1.0625rem', color: '#D93025', margin: '0 0 8px' }}>
        {deal.title}
      </p>

      {/* Description (cleaned — code stripped out) */}
      {cleanDescription && (
        <p style={{ fontSize: '0.875rem', color: '#3A3A3A', margin: '0 0 12px', lineHeight: 1.5 }}>
          {cleanDescription}
        </p>
      )}

      {/* Prominent coupon code — tap to copy */}
      {couponCode && <CouponBadge code={couponCode} />}

      {/* CTA buttons */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {deal.phone && (
          <a href={`tel:${deal.phone}`} className="deal-cta deal-cta-call" onClick={() => onCTAClick?.(deal, 'call')}>
            <Phone size={13} />
            Call
          </a>
        )}
        {deal.address && (
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(deal.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="deal-cta deal-cta-directions"
            onClick={() => onCTAClick?.(deal, 'directions')}
          >
            <MapPin size={13} />
            Directions
          </a>
        )}
        {deal.link && (
          <a
            href={deal.link}
            target="_blank"
            rel="noopener noreferrer"
            className="deal-cta deal-cta-order"
            onClick={() => onCTAClick?.(deal, 'order')}
          >
            <ExternalLink size={13} />
            Order Online
          </a>
        )}
        {!deal.phone && !deal.address && !deal.link && (
          <span style={{ fontSize: '0.8125rem', color: '#8A7A6A', fontStyle: 'italic' }}>Visit in store</span>
        )}
      </div>
    </div>
  );
}
