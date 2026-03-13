// The Daily Slice — Service Worker
// Handles scheduled daily reminder notifications

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('message', (event) => {
  if (!event.data || event.data.type !== 'SCHEDULE_REMINDER') return;

  const { delay } = event.data; // ms until 6pm

  setTimeout(() => {
    self.registration.showNotification('Time to vote! 🍕', {
      body: "Today's pizza battle is live. Cast your slice.",
      icon: '/pizza-icon-192.png',
      badge: '/pizza-icon-192.png',
      tag: 'daily-reminder',
      requireInteraction: false,
    });
  }, Math.max(delay, 0));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      const existing = clients.find((c) => c.url.includes('/battle'));
      if (existing) return existing.focus();
      return self.clients.openWindow('/battle');
    })
  );
});
