import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { logServerEvent } from '@/lib/analytics-server';
import { getClientGeo } from '@/lib/ip';

export async function GET(req: NextRequest) {
  const { data, error } = await supabaseServer
    .from('deals')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  void getClientGeo(req).then(geo =>
    logServerEvent({ event_name: 'deals_viewed', metadata: geo })
  );
  return NextResponse.json(data ?? []);
}
