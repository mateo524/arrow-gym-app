const CACHE = "arrow-gym-v12";
const BASE = "/arrow-gym-app";
self.addEventListener("install", event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll([BASE + "/", BASE + "/index.html"]))); self.skipWaiting(); });
self.addEventListener("activate", event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  // Don't cache cross-origin requests (Supabase auth, CDN, etc.)
  if (!event.request.url.startsWith(self.location.origin)) return;
  event.respondWith(
    fetch(event.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
      return res;
    }).catch(() => caches.match(event.request).then(cached => cached || caches.match(BASE + "/index.html")))
  );
});
