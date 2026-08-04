import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// SPA fallback — NetworkFirst so stale index.html referencing purged JS chunks
// doesn't cause white screens; falls back to cached shell when offline.
registerRoute(
  new NavigationRoute(
    new NetworkFirst({
      cacheName: 'navigation',
      networkTimeoutSeconds: 3,
    }),
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
    // SW setTimeout is unreliable; rest timer pushes are handled by Supabase Edge Function
    console.log('[SW] SCHEDULE_TIMER received but ignored — handled by Supabase Edge Function', { id, delayMs, label });
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
      for (const c of list) {
        if (c.url.includes(self.location.origin) && 'focus' in c) return c.focus();
      }
      return clients.openWindow(event.notification.data?.url || '/');
    })
  );
});

// ── Background Sync handler ─────────────────────────────────────────────────
// Fired by the browser when connectivity is restored (even if the app is closed).
self.addEventListener('sync', event => {
  if (event.tag === 'sync-gym-data') {
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'BACKGROUND_SYNC_REQUESTED' });
        });
      })
    );
  }
});

// ── Web Push handler (background / locked screen) ──────────────────────────
// El servidor (Supabase Edge Function) envía el push; el browser push service
// (FCM / APNs) reactiva este SW aunque esté muerto.
self.addEventListener('push', event => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'Loop', {
      body: data.body || 'Es hora de la próxima serie',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: data.tag || 'loop-notification',
      renotify: true,
      vibrate: [200, 100, 200],
      data: { url: data.url || '/' }
    })
  );
});

self.addEventListener('pushsubscriptionchange', async (event) => {
  event.waitUntil((async () => {
    try {
      const reg = await self.registration;
      const vapidKey = self.VAPID_PUBLIC_KEY || '';
      // Re-subscribe with same key
      const newSub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });
      // Notify the client so it can update Supabase
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach(c => c.postMessage({ type: 'PUSH_SUBSCRIPTION_CHANGED', subscription: JSON.stringify(newSub) }));
    } catch (e) {
      console.warn('pushsubscriptionchange resubscribe failed:', e);
    }
  })());
});
