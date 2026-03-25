import { supabaseServer } from './supabase/server';
import type { AnalyticsEvent } from '@/types';

export async function logServerEvent(event: AnalyticsEvent): Promise<void> {
  try {
    await supabaseServer.from('events').insert({
      event_name: event.event_name,
      session_id: event.session_id ?? null,
      battle_id: event.battle_id ?? null,
      deal_id: event.deal_id ?? null,
      metadata: event.metadata ?? null,
    });
  } catch {
    // Analytics failures never break the app
  }
}
