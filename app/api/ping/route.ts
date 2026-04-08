import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { getClientIp } from '@/lib/ip';

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const isLoopback = !ip || ip === '::1' || ip === '127.0.0.1';
  if (!isLoopback) {
    try {
      await supabaseService
        .from('ip_sessions')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('ip_address', ip);
    } catch {
      // Heartbeat failures never break the app
    }
  }
  return NextResponse.json({ ok: true });
}
