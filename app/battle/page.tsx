'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import type { Battle, Deal, VoteSelection } from '@/types';
import { getVoteForBattle, getOrCreateSessionId, saveVote } from '@/lib/session';
import { recordDailyVote } from '@/lib/streak';
import { logEvent } from '@/lib/analytics';
import { supabase } from '@/lib/supabase/client';
import BattleCard from '@/components/BattleCard';
import ResultsBar from '@/components/ResultsBar';
import SkeletonBattle from '@/components/SkeletonBattle';
import PizzaConfetti from '@/components/PizzaConfetti';

type Screen = 'battle' | 'results' | 'promo' | 'deal';

const TAGLINES: Record<string, string[]> = {
  round: ["You're a well-rounded person!", "Rolling with the classics!", "You're part of Team Round!", "Nice… keeping it classic!"],
  square: ["You're not a square!", "You like a square deal!", "You're part of Team Square!", "Corners > curves. Respect."],
  pepperoni: ["You're part of Team Pepperoni!", "Classic taste, no apologies.", "Pepperoni forever. End of debate."],
  cheese: ["You're a purist — and we love it.", "You're part of Team Cheese!", "Less is more. You get it."],
};

function getTagline(option: string): string {
  const key = option.toLowerCase().trim();
  const list = TAGLINES[key] ?? [`You're part of Team ${option}!`, `${option} all the way!`, `Team ${option} for the win!`];
  return list[Math.floor(Math.random() * list.length)];
}

export default function BattlePage() {
  const [battle, setBattle] = useState<Battle | null>(null);
  const [voted, setVoted] = useState<VoteSelection>(null);
  const [tagline, setTagline] = useState('');
  const [screen, setScreen] = useState<Screen>('battle');
  const [voting, setVoting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bounceSide, setBounceSide] = useState<'a' | 'b' | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [shareCopied, setShareCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [featuredCodeCopied, setFeaturedCodeCopied] = useState(false);
  const [promoLocation, setPromoLocation] = useState<'guidos' | 'jets' | null>(null);
  const [generatedPromoCode, setGeneratedPromoCode] = useState<string | null>(null);
  const [promoCopied, setPromoCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [battleRes, dealsRes] = await Promise.all([
          fetch('/api/battle'),
          fetch('/api/deals'),
        ]);

        if (!battleRes.ok) throw new Error('No battle today');
        const data: Battle = await battleRes.json();
        setBattle(data);

        if (dealsRes.ok) {
          const allDeals: Deal[] = await dealsRes.json();
          setDeals(allDeals);
        }

        const existingVote = getVoteForBattle(data.id);
        if (existingVote) {
          setVoted(existingVote);
          setTagline(getTagline(existingVote === 'a' ? data.option_a : data.option_b));
          setScreen('results');
        }

        const sessionId = getOrCreateSessionId();
        logEvent({ event_name: 'battle_viewed', session_id: sessionId, battle_id: data.id });
      } catch {
        setError('No battle found for today. Check back soon!');
      } finally {
        setLoading(false);
      }
    }
    load();

    const sessionId = getOrCreateSessionId();
    logEvent({ event_name: 'app_open', session_id: sessionId, metadata: { referrer: document.referrer } });
  }, []);

  const refreshBattle = useCallback(async () => {
    try {
      const res = await fetch('/api/battle');
      if (res.ok) setBattle(await res.json());
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (screen !== 'results') return;
    const interval = setInterval(refreshBattle, 15000);
    return () => clearInterval(interval);
  }, [screen, refreshBattle]);

  async function handleCardVote(side: 'a' | 'b') {
    if (voted || voting || !battle) return;
    setVoting(true);

    if (navigator.vibrate) navigator.vibrate(25);
    setBounceSide(side);
    setTimeout(() => setBounceSide(null), 320);

    const sessionId = getOrCreateSessionId();

    try {
      await supabase.rpc('cast_vote', {
        p_battle_id: battle.id,
        p_session_id: sessionId,
        p_selected: side,
      });
    } catch { /* swallow */ }

    saveVote(battle.id, side);
    recordDailyVote(new Date().toISOString().slice(0, 10));

    const updated: Battle = {
      ...battle,
      votes_a: side === 'a' ? battle.votes_a + 1 : battle.votes_a,
      votes_b: side === 'b' ? battle.votes_b + 1 : battle.votes_b,
    };

    logEvent({ event_name: 'vote_cast', session_id: sessionId, battle_id: battle.id, metadata: { selected: side } });

    const votedOption = side === 'a' ? battle.option_a : battle.option_b;
    setBattle(updated);
    setVoted(side);
    setTagline(getTagline(votedOption));
    setScreen('results');
    setVoting(false);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);

    logEvent({ event_name: 'results_viewed', session_id: sessionId, battle_id: battle.id });
  }

  async function handleShare() {
    if (!battle) return;
    const sessionId = getOrCreateSessionId();
    logEvent({ event_name: 'share_initiated', session_id: sessionId, battle_id: battle.id });

    const votedName = voted === 'a' ? battle.option_a : voted === 'b' ? battle.option_b : null;
    const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://thedailyslice.app';
    const shareText = votedName
      ? `I voted ${votedName} in today's pizza battle! 🍕\n${battle.option_a} vs ${battle.option_b}\nVote at ${appUrl}`
      : `Today's battle: ${battle.title}\nVote at ${appUrl}`;

    if (navigator.share) {
      try { await navigator.share({ text: shareText, url: appUrl }); return; } catch { /* dismissed */ }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch { /* ignore */ }
  }

  if (loading) return <SkeletonBattle />;

  if (error || !battle) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', padding: '24px', textAlign: 'center' }}>
        <span style={{ fontSize: '3rem' }}>🍕</span>
        <p style={{ color: '#3A3A3A', fontWeight: 600 }}>{error ?? 'Something went wrong'}</p>
        <Link href="/deals" className="btn btn-primary">See Today&apos;s Deals</Link>
      </div>
    );
  }

  function generatePromoCode(location: 'guidos' | 'jets'): string {
    const prefix = location === 'guidos' ? 'GUIDO' : 'JETS';
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `${prefix}-${suffix}`;
  }

  function pickDeal(vote: VoteSelection): Deal | null {
    if (!vote || deals.length === 0) return null;
    const optionName = (vote === 'a' ? battle!.option_a : battle!.option_b).toLowerCase().trim();

    // Curated deal title lists per style — rotates daily
    const STYLE_DEALS: Record<string, string[]> = {
      square: [
        'Large 1-Topping Pizza — $14.99',       // Jet's Detroit-Style
        'Detroit Style — $12.99',                // Hungry Howie's
        'Old World Pepperoni L Deep Dish — $24.95', // Guido's
        'Small 1-Topping Pizza — $10.99',        // Jet's Detroit-Style small
        'Slice Combo — $6.49',                   // Jet's deep dish slices
      ],
      round: [
        'Large Hand Tossed Pizza — $13.99',      // Chicago Brothers
        '$8.99 Large 1-Topping Pizza',           // Hungry Howie's round
        'Medium 1-Topping Pizza — $7.99',        // Jet's hand tossed
        '$11.99 Large 2-Topping Pizza',          // Hungry Howie's round
        '$7.99 Small 2-Topping Pizza',           // Hungry Howie's round
      ],
      pepperoni: ['Large Pepperoni Duo — $11', 'Old World Pepperoni L Deep Dish — $24.95'],
      cheese: ['Large Combo — $25.99', 'Manager\'s Special — $21.99'],
    };

    const titleList = STYLE_DEALS[optionName];
    if (titleList?.length) {
      const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
      const targetTitle = titleList[dayIndex % titleList.length];
      const found = deals.find(d => d.title === targetTitle);
      if (found) return found;
    }

    // Fallback: keyword match across title + description
    const KEYWORD_MAP: Record<string, string[]> = {
      square: ['detroit', 'deep dish', 'square'],
      round: ['round', 'hand tossed'],
      pepperoni: ['pepperoni'],
      cheese: ['cheese'],
    };
    const searchTerms = KEYWORD_MAP[optionName] ?? optionName.split(/\s+/);
    return deals.find(d =>
      searchTerms.some(kw => d.title.toLowerCase().includes(kw) || d.description?.toLowerCase().includes(kw))
    ) ?? deals[0];
  }

  const featuredDeal = pickDeal(voted);
  const featuredPromoCode = featuredDeal?.description?.match(/(?:use\s+)?code[:\s]+([A-Z0-9_-]+)/i)?.[1] ?? null;

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {showConfetti && <PizzaConfetti />}

      <main style={{ flex: 1, padding: 'clamp(24px, 4vh, 56px) clamp(16px, 4vw, 48px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '28px', minHeight: 0 }}>

        {/* ── SCREEN 1: Battle ── */}
        {screen === 'battle' && (
          <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-evenly' }}>
            <div style={{ textAlign: 'center', padding: '0 8px' }}>
              <h2 style={{ fontFamily: 'var(--font-playfair, "Playfair Display", serif)', fontWeight: 700, fontSize: 'clamp(2.5rem, 6vw, 4rem)', color: '#1C1C1C', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                Which style owns your heart?
              </h2>
            </div>

            <div className="animate-fade-up delay-100" style={{ display: 'flex', gap: 'clamp(12px, 2vw, 24px)', alignItems: 'stretch' }}>
              <BattleCard
                name={battle.option_a}
                image={battle.image_a}
                side="a"
                onClick={() => handleCardVote('a')}
                disabled={voting}
                bounce={bounceSide === 'a'}
              />
              <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, width: 'clamp(44px, 6vw, 64px)' }}>
                <span className="vs-divider">VS</span>
              </div>
              <BattleCard
                name={battle.option_b}
                image={battle.image_b}
                side="b"
                onClick={() => handleCardVote('b')}
                disabled={voting}
                bounce={bounceSide === 'b'}
              />
            </div>
          </div>
        )}

        {/* ── SCREEN 2: Results ── */}
        {screen === 'results' && (
          <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-evenly' }}>
            <div style={{ textAlign: 'center', padding: '0 8px' }}>
              <h2 style={{ fontFamily: 'var(--font-playfair, "Playfair Display", serif)', fontWeight: 700, fontSize: 'clamp(2.5rem, 6vw, 4rem)', color: '#1C1C1C', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                {tagline}
              </h2>
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: 24, padding: '20px', boxShadow: '0 2px 16px rgba(28,28,28,0.08)' }}>
              <ResultsBar battle={battle} voted={voted} hideTagline />
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
              <button
                onClick={() => {
                  setScreen('promo');
                  if (featuredDeal) logEvent({ event_name: 'deal_clicked', session_id: getOrCreateSessionId(), deal_id: featuredDeal.id, metadata: { cta_type: 'reveal', restaurant: featuredDeal.restaurant_name, source: 'battle_results' } });
                }}
                style={{ flex: 1, background: '#D93025', color: '#FFF8E7', border: 'none', borderRadius: '20px', padding: '22px 12px', fontWeight: 800, fontSize: 'clamp(0.9375rem, 2.4vw, 1.125rem)', cursor: 'pointer', letterSpacing: '0.04em', WebkitTapHighlightColor: 'transparent', textAlign: 'center', lineHeight: 1.25 }}
              >
                DEAL FOR YOUR STYLE
              </button>

              <button
                onClick={handleShare}
                style={{ flex: 1, background: '#1C1C1C', color: '#FFF8E7', border: 'none', borderRadius: '20px', padding: '22px 12px', fontWeight: 800, fontSize: 'clamp(0.9375rem, 2.4vw, 1.125rem)', cursor: 'pointer', letterSpacing: '0.04em', WebkitTapHighlightColor: 'transparent', textAlign: 'center', lineHeight: 1.25 }}
              >
                {shareCopied ? '✓ LINK COPIED!' : 'SHARE YOUR PICK'}
              </button>
            </div>
          </div>
        )}

        {/* ── SCREEN 3: Promo ── */}
        {screen === 'promo' && (
          <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Back */}
            <button
              onClick={() => setScreen('results')}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#8A7A6A', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', padding: 0, alignSelf: 'flex-start' }}
            >
              <ChevronLeft size={16} />
              Your results
            </button>

            {/* Heading */}
            <div style={{ textAlign: 'center', padding: '0 4px' }}>
              <p style={{ margin: 0, fontSize: '0.6875rem', fontWeight: 700, color: '#D93025', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Exclusive offer</p>
              <h2 style={{ margin: '6px 0 8px', fontFamily: 'var(--font-playfair, "Playfair Display", serif)', fontWeight: 700, fontSize: 'clamp(1.625rem, 5vw, 2.25rem)', color: '#1C1C1C', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                Grab a promo code
              </h2>
              <p style={{ margin: 0, fontSize: '0.9375rem', color: '#8A7A6A', lineHeight: 1.5 }}>Pick your spot and get an exclusive code.</p>
            </div>

            {!promoLocation ? (
              /* Location picker — side by side */
              <div style={{ display: 'flex', gap: '12px' }}>
                {(['guidos', 'jets'] as const).map((loc) => {
                  const name = loc === 'guidos' ? "Guido's Pizza" : "Jet's Pizza";
                  return (
                    <button
                      key={loc}
                      onClick={() => {
                        const code = generatePromoCode(loc);
                        setPromoLocation(loc);
                        setGeneratedPromoCode(code);
                        logEvent({ event_name: 'deal_clicked', session_id: getOrCreateSessionId(), metadata: { cta_type: 'promo_selected', restaurant: name, source: 'promo_screen' } });
                      }}
                      style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#FFFFFF', border: '2px solid #F2E8D0', borderRadius: 16, padding: '24px 12px', cursor: 'pointer', WebkitTapHighlightColor: 'transparent', boxShadow: '0 2px 12px rgba(28,28,28,0.06)', transition: 'border-color 0.15s' }}
                    >
                      <span style={{ fontFamily: 'var(--font-playfair, "Playfair Display", serif)', fontWeight: 700, fontSize: '1rem', color: '#1C1C1C', textAlign: 'center', lineHeight: 1.3 }}>{name}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#D93025', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Get code</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Code reveal */
              <div style={{ background: '#FFFFFF', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 20px rgba(28,28,28,0.08)' }}>
                {/* Selected restaurant label */}
                <div style={{ background: '#F2E8D0', padding: '10px 20px', borderBottom: '1px solid rgba(28,28,28,0.06)' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: '#8A7A6A', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    {promoLocation === 'guidos' ? "Guido's Pizza" : "Jet's Pizza"}
                  </p>
                </div>

                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Code badge */}
                  <div style={{ background: '#FFF8E7', border: '1.5px dashed #E8A020', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.625rem', fontWeight: 700, color: '#8A7A6A', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Your promo code</p>
                      <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-ibm-mono, monospace)', fontWeight: 700, fontSize: '1.375rem', color: '#1C1C1C', letterSpacing: '0.12em' }}>{generatedPromoCode}</p>
                    </div>
                    <button
                      onClick={async () => {
                        if (!generatedPromoCode) return;
                        await navigator.clipboard.writeText(generatedPromoCode);
                        setPromoCopied(true);
                        setTimeout(() => setPromoCopied(false), 2000);
                      }}
                      style={{ flexShrink: 0, background: promoCopied ? '#2D6A4F' : '#1C1C1C', color: '#FFF8E7', border: 'none', borderRadius: 9999, padding: '10px 20px', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer', transition: 'background 0.2s', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}
                    >
                      {promoCopied ? '✓ Copied!' : 'Copy'}
                    </button>
                  </div>

                  {/* Claim CTA */}
                  <a
                    href={promoLocation === 'guidos' ? 'https://www.guidospizzabrighton.com/promo_code' : 'https://www.jetspizza.com/deals/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'block', background: '#D93025', color: '#FFF8E7', borderRadius: 9999, padding: '16px 0', fontWeight: 800, fontSize: '0.9375rem', textAlign: 'center', textDecoration: 'none', letterSpacing: '0.04em' }}
                  >
                    Claim at {promoLocation === 'guidos' ? "Guido's" : "Jet's"} →
                  </a>

                  {/* Switch */}
                  <button
                    onClick={() => { setPromoLocation(null); setGeneratedPromoCode(null); setPromoCopied(false); }}
                    style={{ background: 'none', border: 'none', color: '#8A7A6A', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', padding: 0, textAlign: 'center' }}
                  >
                    Pick a different location
                  </button>
                </div>
              </div>
            )}

            {/* Skip link */}
            <button
              onClick={() => setScreen('deal')}
              style={{ background: 'none', border: 'none', color: '#8A7A6A', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', padding: '4px 0', textAlign: 'center', textDecoration: 'underline', textDecorationColor: 'rgba(138,122,106,0.4)' }}
            >
              Skip, see my deal →
            </button>
          </div>
        )}

        {/* ── SCREEN 4: Deal ── */}
        {screen === 'deal' && featuredDeal && (
          <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Back */}
            <button
              onClick={() => setScreen('results')}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#8A7A6A', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', padding: 0, alignSelf: 'flex-start' }}
            >
              <ChevronLeft size={16} />
              Your results
            </button>

            {/* Deal card */}
            <div style={{ background: '#FFFFFF', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 20px rgba(28,28,28,0.10)' }}>
              <div style={{ background: '#D93025', padding: '16px 20px' }}>
                <p style={{ margin: 0, fontSize: '0.625rem', fontWeight: 700, color: 'rgba(255,248,231,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your style deal</p>
                <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-playfair, "Playfair Display", serif)', fontWeight: 700, fontSize: '1.5rem', color: '#FFF8E7', lineHeight: 1.2 }}>{featuredDeal.restaurant_name}</p>
              </div>

              <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700, color: '#1C1C1C', lineHeight: 1.3 }}>{featuredDeal.title}</p>
                  {featuredDeal.description && (
                    <p style={{ margin: '6px 0 0', fontSize: '0.875rem', color: '#8A7A6A', lineHeight: 1.5 }}>{featuredDeal.description}</p>
                  )}
                </div>

                {featuredPromoCode && (
                  <div style={{ background: '#F2E8D0', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.625rem', fontWeight: 700, color: '#8A7A6A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Promo code</p>
                      <p style={{ margin: '2px 0 0', fontFamily: 'var(--font-ibm-mono, monospace)', fontWeight: 700, fontSize: '1.25rem', color: '#1C1C1C', letterSpacing: '0.1em' }}>{featuredPromoCode}</p>
                    </div>
                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(featuredPromoCode);
                        setFeaturedCodeCopied(true);
                        setTimeout(() => setFeaturedCodeCopied(false), 2000);
                        logEvent({ event_name: 'deal_clicked', session_id: getOrCreateSessionId(), deal_id: featuredDeal.id, metadata: { cta_type: 'copy_code', restaurant: featuredDeal.restaurant_name, source: 'deal_screen' } });
                      }}
                      style={{ background: featuredCodeCopied ? '#2D6A4F' : '#1C1C1C', color: '#FFF8E7', border: 'none', borderRadius: 9999, padding: '8px 18px', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer', transition: 'background 0.2s', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}
                    >
                      {featuredCodeCopied ? '✓ Copied!' : 'Copy'}
                    </button>
                  </div>
                )}

                {featuredDeal.link && (
                  <a
                    href={featuredDeal.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'block', background: '#D93025', color: '#FFF8E7', borderRadius: 9999, padding: '15px 0', fontWeight: 700, fontSize: '0.9375rem', textAlign: 'center', textDecoration: 'none', letterSpacing: '0.04em' }}
                    onClick={() => logEvent({ event_name: 'deal_clicked', session_id: getOrCreateSessionId(), deal_id: featuredDeal.id, metadata: { cta_type: 'order', restaurant: featuredDeal.restaurant_name, source: 'deal_screen' } })}
                  >
                    Order Now →
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
