import { supabase } from './supabase/client';
import type { AnalyticsEvent } from '@/types';

function getDeviceMetadata(): Record<string, unknown> {
  try {
    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { effectiveType?: string; downlink?: number; rtt?: number; saveData?: boolean };
    };
    const conn = nav.connection;
    return {
      screen_w: screen.width,
      screen_h: screen.height,
      viewport_w: window.innerWidth,
      viewport_h: window.innerHeight,
      dpr: window.devicePixelRatio ?? null,
      color_depth: screen.colorDepth ?? null,
      language: navigator.language ?? null,
      languages: navigator.languages ? [...navigator.languages] : null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
      cpu_cores: navigator.hardwareConcurrency ?? null,
      device_memory_gb: nav.deviceMemory ?? null,
      connection_type: conn?.effectiveType ?? null,
      connection_downlink: conn?.downlink ?? null,
      connection_rtt: conn?.rtt ?? null,
      save_data: conn?.saveData ?? null,
      touch_points: navigator.maxTouchPoints ?? 0,
      referrer: document.referrer || null,
      page_url: window.location.href,
      is_standalone: window.matchMedia('(display-mode: standalone)').matches,
      user_agent: navigator.userAgent,
    };
  } catch {
    return {};
  }
}

export async function logEvent(event: AnalyticsEvent): Promise<void> {
  try {
    await supabase.from('events').insert({
      event_name: event.event_name,
      session_id: event.session_id,
      battle_id: event.battle_id,
      deal_id: event.deal_id,
      metadata: { ...getDeviceMetadata(), ...event.metadata },
    });
  } catch {
    // Analytics failures should never break the app
  }
}
