'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Tag } from 'lucide-react';
import type { Deal, Battle } from '@/types';
import { getOrCreateSessionId, getVoteForBattle } from '@/lib/session';
import { logEvent } from '@/lib/analytics';
import DealCard from '@/components/DealCard';

// Build keyword list from the voted option name, with style synonyms
function getStyleKeywords(optionName: string): string[] {
  const name = optionName.toLowerCase();
  const words = name.split(/\s+/).filter((w) => w.length > 2);
  if (name.includes('detroit') || name.includes('square')) {
    words.push('deep dish', 'detroit');
  }
  if (name.includes('round') || name.includes('new york')) {
    words.push('round', 'hand tossed');
  }
  if (name.includes('pepperoni')) words.push('pepperoni');
  if (name.includes('cheese')) words.push('cheese', 'mozzarella');
  if (name.includes('thin')) words.push('thin');
  if (name.includes('deep') || name.includes('dish')) words.push('deep dish');
  return [...new Set(words)];
}

function dealMatchesStyle(deal: Deal, keywords: string[]): boolean {
  const text = `${deal.title} ${deal.description ?? ''}`.toLowerCase();
  return keywords.some((kw) => text.includes(kw));
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [battle, setBattle] = useState<Battle | null>(null);
  const [userVote, setUserVote] = useState<'a' | 'b' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dealsRes, battleRes] = await Promise.all([
          fetch('/api/deals'),
          fetch('/api/battle'),
        ]);
        if (dealsRes.ok) setDeals(await dealsRes.json());
        if (battleRes.ok) {
          const battleData: Battle = await battleRes.json();
          setBattle(battleData);
          setUserVote(getVoteForBattle(battleData.id));
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

  // Personalization
  const votedOption =
    userVote && battle ? (userVote === 'a' ? battle.option_a : battle.option_b) : null;
  const styleKeywords = votedOption ? getStyleKeywords(votedOption) : [];

  // Group deals by restaurant, sort matching restaurants + deals first
  const groups = (() => {
    const grouped = deals.reduce<Record<string, Deal[]>>((acc, deal) => {
      (acc[deal.restaurant_name] ??= []).push(deal);
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([restaurant, restaurantDeals]) => {
        const sorted =
          styleKeywords.length > 0
            ? [
                ...restaurantDeals.filter((d) => dealMatchesStyle(d, styleKeywords)),
                ...restaurantDeals.filter((d) => !dealMatchesStyle(d, styleKeywords)),
              ]
            : restaurantDeals;
        const hasMatch =
          styleKeywords.length > 0 &&
          restaurantDeals.some((d) => dealMatchesStyle(d, styleKeywords));
        return { restaurant, deals: sorted, hasMatch, area: restaurantDeals[0].area };
      })
      .sort((a, b) => {
        if (a.hasMatch && !b.hasMatch) return -1;
        if (!a.hasMatch && b.hasMatch) return 1;
        return 0;
      });
  })();

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
          Lake Orion · Rochester Hills · Auburn Hills
        </p>
      </header>

      {/* Personalization banner — shown after voting */}
      {votedOption && (
        <div
          style={{
            background: '#D93025',
            color: '#FFF8E7',
            padding: '10px 20px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>🍕</span>
          <span>Deals picked for {votedOption} fans</span>
        </div>
      )}

      {/* Content */}
      <main style={{ flex: 1, padding: '16px 20px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
            <p style={{ color: '#8A7A6A', fontSize: '0.875rem', margin: 0 }}>
              Check back tomorrow for fresh deals.
            </p>
          </div>
        ) : (
          groups.map(({ restaurant, deals: restaurantDeals, hasMatch, area }, groupIndex) => (
            <div
              key={restaurant}
              className="animate-fade-up"
              style={{ animationDelay: `${groupIndex * 0.07}s` }}
            >
              {/* Restaurant section header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '8px',
                  marginBottom: '8px',
                  paddingBottom: '6px',
                  borderBottom: `2px solid ${hasMatch ? '#E8A020' : '#E0D4B8'}`,
                }}
              >
                <h2
                  style={{
                    fontFamily: 'var(--font-playfair, "Playfair Display", serif)',
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    color: '#1C1C1C',
                    margin: 0,
                  }}
                >
                  {restaurant}
                </h2>
                {area && (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      fontSize: '0.75rem',
                      color: '#8A7A6A',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <MapPin size={10} />
                    {area}
                  </span>
                )}
                {hasMatch && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: '0.6563rem',
                      fontWeight: 700,
                      color: '#C07800',
                      background: '#FFF3D0',
                      border: '1px solid #E8A020',
                      borderRadius: '4px',
                      padding: '2px 7px',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    Matches your pick
                  </span>
                )}
              </div>

              {/* Deal cards for this restaurant */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {restaurantDeals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    showRestaurant={false}
                    highlight={styleKeywords.length > 0 && dealMatchesStyle(deal, styleKeywords)}
                    onCTAClick={handleDealClick}
                  />
                ))}
              </div>
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
