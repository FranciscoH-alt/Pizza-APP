import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { logServerEvent } from '@/lib/analytics-server';
import { getClientIp } from '@/lib/ip';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { battle_id, session_id, selected } = body;

    if (!battle_id || !session_id || !['a', 'b'].includes(selected)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { error } = await supabaseServer.rpc('cast_vote', {
      p_battle_id: battle_id,
      p_session_id: session_id,
      p_selected: selected,
    });

    if (error) {
      // UNIQUE constraint violation = already voted
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Already voted', code: 'DUPLICATE' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logServerEvent({ event_name: 'vote_cast', session_id, battle_id, metadata: { ip: getClientIp(req), selected } });

    // Return updated battle
    const { data: battle } = await supabaseServer
      .from('battles')
      .select('votes_a, votes_b')
      .eq('id', battle_id)
      .single();

    return NextResponse.json({ ok: true, votes: battle });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
