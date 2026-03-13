import { supabase } from './supabase/client';
import type { AnalyticsEvent } from '@/types';

export async function logEvent(event: AnalyticsEvent): Promise<void> {
  try {
    await supabase.from('events').insert({
      event_name: event.event_name,
      session_id: event.session_id,
      battle_id: event.battle_id,
      deal_id: event.deal_id,
      metadata: event.metadata,
    });
  } catch {
    // Analytics failures should never break the app
  }
}
