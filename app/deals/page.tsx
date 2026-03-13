'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Tag } from 'lucide-react';
import type { Deal } from '@/types';
import { getOrCreateSessionId } from '@/lib/session';
import { logEvent } from '@/lib/analytics';
import DealCard from '@/components/DealCard';

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/deals');
        if (res.ok) {
          const data: Deal[] = await res.json();
          setDeals(data);
        }
      } finally {
        setLoading(false);
      }
    }
    load();

    const sessionId = getOrCreateSessionId();
    logEvent({ event_name: 'deals_viewed', session_id: sessionId });
  }, []);

  function handleDealClick(deal: Deal, ctaType: 'call' | 'directions' | 'order') {
    const sessionId = getOrCreateSessionId();
    logEvent({
      event_name: 'deal_clicked',
      session_id: sessionId,
      deal_id: deal.id,
      metadata: { cta_type: ctaType, restaurant: deal.restaurant_name },
    });
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header
        style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid #E0D4B8',
          background: '#FFF8E7',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <Link
            href="/battle"
            style={{
              display: 'flex',
              alignItems: 'center',
              color: '#8A7A6A',
              textDecoration: 'none',
              padding: '4px',
              marginLeft: '-4px',
            }}
          >
            <ArrowLeft size={20} />
          </Link>
          <h1
            style={{
              fontFamily: 'var(--font-playfair, "Playfair Display", serif)',
              fontWeight: 700,
              fontSize: '1.375rem',
              margin: 0,
              color: '#1C1C1C',
              letterSpacing: '-0.02em',
            }}
          >
            Today&apos;s Deals
          </h1>
        </div>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: '#8A7A6A', paddingLeft: '32px' }}>
          Lake Orion &amp; Rochester Hills
        </p>
      </header>

      {/* Content */}
      <main style={{ flex: 1, padding: '16px 20px 32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '40px' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: '3px solid #E0D4B8',
                borderTopColor: '#D93025',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : deals.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <Tag size={36} color="#E0D4B8" />
            <p style={{ fontWeight: 600, color: '#3A3A3A', margin: 0 }}>No deals today</p>
            <p style={{ color: '#8A7A6A', fontSize: '0.875rem', margin: 0 }}>Check back tomorrow for fresh deals.</p>
          </div>
        ) : (
          deals.map((deal, i) => (
            <div
              key={deal.id}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <DealCard deal={deal} onCTAClick={handleDealClick} />
            </div>
          ))
        )}
      </main>

      {/* Back to battle CTA */}
      <footer style={{ padding: '16px 20px 28px', borderTop: '1px solid #E0D4B8' }}>
        <Link href="/battle" className="btn btn-primary" style={{ width: '100%', display: 'flex' }}>
          Back to Today&apos;s Battle
        </Link>
      </footer>
    </div>
  );
}
