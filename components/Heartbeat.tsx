'use client';
import { useEffect } from 'react';

export default function Heartbeat() {
  useEffect(() => {
    const startTime = Date.now();

    const ping = () => fetch('/api/ping').catch(() => {});
    ping();
    const id = setInterval(ping, 5_000);

    const sendExit = () => {
      const duration_ms = Date.now() - startTime;
      const payload = JSON.stringify({
        session_id: (() => {
          try { return localStorage.getItem('daily-slice-session'); } catch { return null; }
        })(),
        duration_ms,
        page_url: window.location.href,
      });
      navigator.sendBeacon('/api/session-end', new Blob([payload], { type: 'application/json' }));
    };

    // pagehide fires reliably on tab close, navigation, and mobile backgrounding
    window.addEventListener('pagehide', sendExit);
    // visibilitychange:hidden catches cases pagehide misses (some Android browsers)
    const onVisibility = () => { if (document.visibilityState === 'hidden') sendExit(); };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearInterval(id);
      window.removeEventListener('pagehide', sendExit);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);
  return null;
}
