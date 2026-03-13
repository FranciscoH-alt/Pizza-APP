'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { MapPin, ChevronRight, Bell } from 'lucide-react';
import type { Battle, VoteSelection, StreakData } from '@/types';
import { getVoteForBattle, getOrCreateSessionId, saveVote } from '@/lib/session';
import { getStreak, recordDailyVote } from '@/lib/streak';
import { logEvent } from '@/lib/analytics';
import { supabase } from '@/lib/supabase/client';
import BattleCard from '@/components/BattleCard';
import ResultsBar from '@/components/ResultsBar';
import ShareCard from '@/components/ShareCard';
import Countdown from '@/components/Countdown';
import SkeletonBattle from '@/components/SkeletonBattle';
import StreakBadge from '@/components/StreakBadge';

type Screen = 'battle' | 'results';
type NotifStatus = 'idle' | 'granted' | 'denied' | 'unsupported';

export default function BattlePage() {
  const [battle, setBattle] = useState<Battle | null>(null);
  const [voted, setVoted] = useState<VoteSelection>(null);
  const [screen, setScreen] = useState<Screen>('battle');
  const [voting, setVoting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [newMilestone, setNewMilestone] = useState<number | null>(null);
  const [notifStatus, setNotifStatus] = useState<NotifStatus>('idle');

  // Load battle + existing vote + streak on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/battle');
        if (!res.ok) throw new Error('No battle today');
        const data: Battle = await res.json();
        setBattle(data);

        const existingVote = getVoteForBattle(data.id);
        if (existingVote) {
          setVoted(existingVote);
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

    setStreak(getStreak());

    // Check notification support/permission
    if (typeof Notification === 'undefined' || !('serviceWorker' in navigator)) {
      setNotifStatus('unsupported');
    } else if (Notification.permission === 'granted') {
      setNotifStatus('granted');
    } else if (Notification.permission === 'denied') {
      setNotifStatus('denied');
    }

    const sessionId = getOrCreateSessionId();
    logEvent({ event_name: 'app_open', session_id: sessionId, metadata: { referrer: document.referrer } });
  }, []);

  // Live vote polling while on results screen
  const refreshBattle = useCallback(async () => {
    try {
      const res = await fetch('/api/battle');
      if (res.ok) {
        const data: Battle = await res.json();
        setBattle(data);
      }
    } catch {
      // Silent — don't disrupt UX
    }
  }, []);

  useEffect(() => {
    if (screen !== 'results') return;
    const interval = setInterval(refreshBattle, 15000);
    return () => clearInterval(interval);
  }, [screen, refreshBattle]);

  async function handleCardVote(side: 'a' | 'b') {
    if (voted || voting || !battle) return;
    setVoting(true);

    const sessionId = getOrCreateSessionId();

    try {
      await supabase.rpc('cast_vote', {
        p_battle_id: battle.id,
        p_session_id: sessionId,
        p_selected: side,
      });
    } catch {
      // Swallow — local state still advances
    }

    saveVote(battle.id, side);

    const today = new Date().toISOString().slice(0, 10);
    const { streak: updatedStreak, newMilestone: milestone } = recordDailyVote(today);
    setStreak(updatedStreak);
    if (milestone) {
      setNewMilestone(milestone);
      logEvent({
        event_name: 'streak_milestone_reached',
        session_id: sessionId,
        battle_id: battle.id,
        metadata: { milestone, streak: updatedStreak.current },
      });
    }

    const updated: Battle = {
      ...battle,
      votes_a: side === 'a' ? battle.votes_a + 1 : battle.votes_a,
      votes_b: side === 'b' ? battle.votes_b + 1 : battle.votes_b,
    };

    logEvent({ event_name: 'vote_cast', session_id: sessionId, battle_id: battle.id, metadata: { selected: side } });

    setBattle(updated);
    setVoted(side);
    setScreen('results');
    setVoting(false);

    logEvent({ event_name: 'results_viewed', session_id: sessionId, battle_id: battle.id });
  }

  async function handleEnableNotifications() {
    if (typeof Notification === 'undefined') return;

    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      setNotifStatus('granted');
      const sessionId = getOrCreateSessionId();
      logEvent({
        event_name: 'notification_enabled',
        session_id: sessionId,
        metadata: { streak: streak?.current },
      });

      if ('serviceWorker' in navigator) {
        try {
          await navigator.serviceWorker.register('/sw.js');
          const reg = await navigator.serviceWorker.ready;
          const now = new Date();
          const target = new Date(now);
          target.setHours(18, 0, 0, 0);
          if (target <= now) target.setDate(target.getDate() + 1);
          const delay = target.getTime() - now.getTime();
          reg.active?.postMessage({ type: 'SCHEDULE_REMINDER', delay });
        } catch {
          // SW registration not critical
        }
      }
    } else {
      setNotifStatus('denied');
    }
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

  const aIsLeading = battle.votes_a >= battle.votes_b;

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-playfair, "Playfair Display", serif)', fontWeight: 700, fontSize: '1.5rem', margin: '0 0 4px', color: '#1C1C1C', letterSpacing: '-0.02em' }}>
            The Daily Slice
          </h1>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8125rem', color: '#8A7A6A' }}>
            <MapPin size={12} />
            {battle.location}
          </span>
        </div>
        <Countdown />
      </header>

      {/* Main content */}
      <main style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {screen === 'battle' ? (
          <>
            {/* Battle title */}
            <div className="animate-fade-up" style={{ textAlign: 'center' }}>
              <span className="badge badge-tomato" style={{ marginBottom: '10px' }}>Today&apos;s Battle</span>
              <h2 style={{ fontFamily: 'var(--font-playfair, "Playfair Display", serif)', fontWeight: 700, fontSize: '1.375rem', color: '#1C1C1C', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.25 }}>
                {battle.title}
              </h2>
              {battle.description && (
                <p style={{ margin: '8px 0 0', fontSize: '0.875rem', color: '#8A7A6A', lineHeight: 1.5 }}>
                  {battle.description}
                </p>
              )}
            </div>

            {/* Tap-to-vote instruction */}
            <p className="animate-fade-up delay-50" style={{ textAlign: 'center', margin: '-8px 0', fontSize: '0.8125rem', color: '#8A7A6A', fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              Tap your pick
            </p>

            {/* Battle cards */}
            <div className="animate-fade-up delay-100" style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>
              <BattleCard
                name={battle.option_a}
                image={battle.image_a}
                side="a"
                onClick={() => handleCardVote('a')}
                disabled={voting}
              />
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="vs-divider">VS</span>
              </div>
              <BattleCard
                name={battle.option_b}
                image={battle.image_b}
                side="b"
                onClick={() => handleCardVote('b')}
                disabled={voting}
              />
            </div>
          </>
        ) : (
          <div className="animate-slide-in">
            {/* Results header */}
            <div style={{ textAlign: 'center', marginBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-basil">You voted!</span>
              {streak && streak.current >= 1 && (
                <StreakBadge streak={streak.current} isMilestone={!!newMilestone} />
              )}
              {newMilestone && (
                <div
                  className="animate-milestone"
                  style={{ fontSize: '0.875rem', fontWeight: 700, color: '#C07800', padding: '6px 14px', background: '#FFF0C8', borderRadius: 9999, border: '1px solid rgba(232,160,32,0.4)' }}
                >
                  🎉 {newMilestone}-day milestone unlocked!
                </div>
              )}
              <h2 style={{ fontFamily: 'var(--font-playfair, "Playfair Display", serif)', fontWeight: 700, fontSize: '1.375rem', color: '#1C1C1C', margin: 0, letterSpacing: '-0.02em' }}>
                {battle.title}
              </h2>
            </div>

            {/* Voted cards with leading glow */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch', marginBottom: '16px' }}>
              <BattleCard
                name={battle.option_a}
                image={battle.image_a}
                side="a"
                selected={voted === 'a'}
                dimmed={voted === 'b'}
                disabled
                isLeading={aIsLeading}
              />
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="vs-divider">VS</span>
              </div>
              <BattleCard
                name={battle.option_b}
                image={battle.image_b}
                side="b"
                selected={voted === 'b'}
                dimmed={voted === 'a'}
                disabled
                isLeading={!aIsLeading}
              />
            </div>

            {/* Results bar */}
            <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
              <ResultsBar battle={battle} voted={voted} />
            </div>

            {/* Come back tomorrow + notification CTA */}
            <div style={{ background: '#F2E8D0', borderRadius: 14, padding: '16px 20px', marginBottom: '16px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-playfair, "Playfair Display", serif)', fontWeight: 700, fontSize: '1rem', color: '#1C1C1C', margin: '0 0 8px' }}>
                New battle at midnight 🍕
              </p>
              <Countdown />
              <p style={{ fontSize: '0.8125rem', color: '#8A7A6A', margin: '8px 0 12px' }}>
                Come back tomorrow to keep your streak alive
              </p>
              {notifStatus === 'idle' && (
                <button
                  onClick={handleEnableNotifications}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#1C1C1C', color: '#FFF8E7', border: 'none', borderRadius: 9999, padding: '10px 18px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}
                >
                  <Bell size={14} />
                  Remind me at 6pm
                </button>
              )}
              {notifStatus === 'granted' && (
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2D6A4F', margin: 0 }}>
                  ✓ Reminder set for 6pm
                </p>
              )}
              {notifStatus === 'denied' && (
                <p style={{ fontSize: '0.8125rem', color: '#8A7A6A', margin: 0 }}>
                  Enable notifications in your browser settings
                </p>
              )}
            </div>

            {/* Share card */}
            <ShareCard
              battle={battle}
              voted={voted}
              onShare={() => {
                const sessionId = getOrCreateSessionId();
                logEvent({ event_name: 'share_initiated', session_id: sessionId, battle_id: battle.id });
              }}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ padding: '16px 20px 24px', borderTop: '1px solid #E0D4B8', background: '#FFF8E7' }}>
        <Link
          href="/deals"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#D93025', fontWeight: 700, fontSize: '0.9375rem', textDecoration: 'none' }}
          onClick={() => logEvent({ event_name: 'deals_viewed', session_id: getOrCreateSessionId() })}
        >
          See Today&apos;s Deals
          <ChevronRight size={16} />
        </Link>
      </footer>
    </div>
  );
}
