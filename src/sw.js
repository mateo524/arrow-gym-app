import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// SPA fallback
registerRoute(
  new NavigationRoute(
    new NetworkFirst({ networkTimeoutSeconds: 3, cacheName: 'navigation' }),
    { denylist: [/^\/api\//] }
  )
);

// Skip waiting
self.skipWaiting();
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

// ── Rest Timer ──────────────────────────────────────────────────────────────
const pendingTimers = new Map();

self.addEventListener('message', event => {
  const { type, id, delayMs, label } = event.data || {};

  if (type === 'SKIP_WAITING') { self.skipWaiting(); return; }

  if (type === 'SCHEDULE_TIMER') {
    if (pendingTimers.has(id)) clearTimeout(pendingTimers.get(id));
    const tid = setTimeout(() => {
      pendingTimers.delete(id);
      self.registration.showNotification('Loop — Descanso terminado', {
        body: label ? `Siguiente: ${label}` : 'Listo para la próxima serie.',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'rest-timer',
        renotify: true,
        vibrate: [200, 100, 200],
      });
    }, delayMs);
    pendingTimers.set(id, tid);
    return;
  }

  if (type === 'CANCEL_TIMER') {
    if (pendingTimers.has(id)) { clearTimeout(pendingTimers.get(id)); pendingTimers.delete(id); }
    return;
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) if (c.focus) return c.focus();
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
