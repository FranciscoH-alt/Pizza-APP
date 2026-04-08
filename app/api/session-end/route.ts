import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { getClientIp, getClientGeo } from '@/lib/ip';
import { parseUA } from '@/lib/ua';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, duration_ms, page_url } = body ?? {};

    const ua = req.headers.get('user-agent') ?? '';
    const parsed = parseUA(ua);
    const geo = await getClientGeo(req);
    const ip = getClientIp(req);

    await supabaseServer.from('events').insert({
      event_name: 'session_end',
      session_id: session_id ?? null,
      metadata: {
        duration_ms: typeof duration_ms === 'number' ? duration_ms : null,
        duration_s: typeof duration_ms === 'number' ? Math.round(duration_ms / 1000) : null,
        page_url: page_url ?? null,
        ...parsed,
        ...geo,
        ip,
        user_agent: ua,
      },
    });
  } catch {
    // Never break on analytics failure
  }
  return NextResponse.json({ ok: true });
}
