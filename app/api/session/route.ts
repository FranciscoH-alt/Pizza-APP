import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { getClientIp } from '@/lib/ip';

/**
 * GET /api/session?sid=<client-uuid>
 *
 * Resolves the canonical session ID for the requesting IP.
 * - If IP is known and client has no UUID → restores the stored session_id
 * - If IP is known and client has a UUID → localStorage wins; updates mapping if different
 * - If IP is unknown → stores new mapping with client UUID (or generates one)
 *
 * Returns: { session_id: string }
 */
export async function GET(req: NextRequest) {
  const clientSid = req.nextUrl.searchParams.get('sid') ?? null;
  const ip = getClientIp(req);

  // Can't track without an IP (loopback in dev) — just return client's UUID or generate one
  const isLoopback = !ip || ip === '::1' || ip === '127.0.0.1';
  if (isLoopback) {
    const sid = clientSid ?? crypto.randomUUID();
    return NextResponse.json({ session_id: sid });
  }

  try {
    const { data: existing } = await supabaseService
      .from('ip_sessions')
      .select('session_id')
      .eq('ip_address', ip)
      .maybeSingle();

    if (existing) {
      // IP already known
      if (!clientSid) {
        // Client lost localStorage → restore the server-side UUID
        return NextResponse.json({ session_id: existing.session_id });
      }
      if (clientSid !== existing.session_id) {
        // localStorage UUID differs — localStorage wins; update server mapping
        await supabaseService
          .from('ip_sessions')
          .update({ session_id: clientSid, updated_at: new Date().toISOString() })
          .eq('ip_address', ip);
      }
      return NextResponse.json({ session_id: clientSid });
    }

    // New IP — create mapping
    const newSid = clientSid ?? crypto.randomUUID();
    await supabaseService
      .from('ip_sessions')
      .insert({ ip_address: ip, session_id: newSid });

    return NextResponse.json({ session_id: newSid });
  } catch {
    // On any DB error, fall back gracefully — don't break app startup
    const sid = clientSid ?? crypto.randomUUID();
    return NextResponse.json({ session_id: sid });
  }
}
