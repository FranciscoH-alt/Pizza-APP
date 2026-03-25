import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { logServerEvent } from '@/lib/analytics-server';
import { getClientGeo } from '@/lib/ip';

export async function GET(req: NextRequest) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const { data, error } = await supabaseServer
    .from('battles')
    .select('*')
    .eq('status', 'active')
    .lte('start_date', today)
    .gte('end_date', today)
    .order('start_date', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    // Fallback: return most recent battle regardless of date
    const { data: fallback } = await supabaseServer
      .from('battles')
      .select('*')
      .order('start_date', { ascending: false })
      .limit(1)
      .single();

    if (!fallback) {
      return NextResponse.json({ error: 'No battle found' }, { status: 404 });
    }
    void getClientGeo(req).then(geo =>
      logServerEvent({ event_name: 'battle_viewed', battle_id: fallback.id, metadata: geo })
    );
    return NextResponse.json(fallback);
  }

  void getClientGeo(req).then(geo =>
    logServerEvent({ event_name: 'battle_viewed', battle_id: data.id, metadata: geo })
  );
  return NextResponse.json(data);
}
