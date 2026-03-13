'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import type { Battle, VoteSelection } from '@/types';
import { getOrCreateSessionId, saveVote } from '@/lib/session';
import { logEvent } from '@/lib/analytics';
import { supabase } from '@/lib/supabase/client';

interface VoteButtonsProps {
  battle: Battle;
  initialVote: VoteSelection;
  onVoted: (selected: 'a' | 'b', updatedBattle: Battle) => void;
}

export default function VoteButtons({ battle, initialVote, onVoted }: VoteButtonsProps) {
  const [voted, setVoted] = useState<VoteSelection>(initialVote);
  const [loading, setLoading] = useState(false);

  async function handleVote(selected: 'a' | 'b') {
    if (voted || loading) return;
    setLoading(true);

    const sessionId = getOrCreateSessionId();

    try {
      const { error } = await supabase.rpc('cast_vote', {
        p_battle_id: battle.id,
        p_session_id: sessionId,
        p_selected: selected,
      });

      if (error) {
        // Likely a duplicate vote constraint — treat as already voted
        console.error('Vote error:', error.message);
      }

      // Save locally regardless (prevents redundant calls)
      saveVote(battle.id, selected);
      setVoted(selected);

      // Optimistically update vote counts for immediate UI feedback
      const updatedBattle: Battle = {
        ...battle,
        votes_a: selected === 'a' ? battle.votes_a + 1 : battle.votes_a,
        votes_b: selected === 'b' ? battle.votes_b + 1 : battle.votes_b,
      };

      await logEvent({
        event_name: 'vote_cast',
        session_id: sessionId,
        battle_id: battle.id,
        metadata: { selected },
      });

      onVoted(selected, updatedBattle);
    } catch (err) {
      console.error('Unexpected vote error:', err);
      // Still allow local experience
      saveVote(battle.id, selected);
      setVoted(selected);
      const updatedBattle: Battle = {
        ...battle,
        votes_a: selected === 'a' ? battle.votes_a + 1 : battle.votes_a,
        votes_b: selected === 'b' ? battle.votes_b + 1 : battle.votes_b,
      };
      onVoted(selected, updatedBattle);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
      <button
        onClick={() => handleVote('a')}
        disabled={!!voted || loading}
        className={`vote-btn vote-btn-a ${voted === 'a' ? 'vote-btn-selected' : ''} ${voted && voted !== 'a' ? 'vote-btn-dim' : ''}`}
        style={{ position: 'relative' }}
      >
        {voted === 'a' && (
          <Check size={18} style={{ marginRight: 6 }} />
        )}
        Vote {battle.option_a}
      </button>

      <button
        onClick={() => handleVote('b')}
        disabled={!!voted || loading}
        className={`vote-btn vote-btn-b ${voted === 'b' ? 'vote-btn-selected' : ''} ${voted && voted !== 'b' ? 'vote-btn-dim' : ''}`}
      >
        {voted === 'b' && (
          <Check size={18} style={{ marginRight: 6 }} />
        )}
        Vote {battle.option_b}
      </button>
    </div>
  );
}
