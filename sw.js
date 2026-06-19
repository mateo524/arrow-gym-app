const CACHE = "arrow-gym-v17";
const BASE = "/arrow-gym-app";
self.addEventListener("install", event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll([BASE + "/", BASE + "/index.html"]))); self.skipWaiting(); });
self.addEventListener("activate", event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
const fetchWithTimeout = (req) => Promise.race([
  fetch(req),
  new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000))
]);

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  // Don't cache cross-origin requests (Supabase auth, CDN, etc.)
  if (!event.request.url.startsWith(self.location.origin)) return;
  event.respondWith(
    fetchWithTimeout(event.request).then(res => {
      if (res.ok && res.type === 'basic') {
        caches.open(CACHE).then(cache => cache.put(event.request, res.clone()));
      }
      return res;
    }).catch(() => caches.match(event.request).then(cached => cached || caches.match(BASE + "/index.html")))
  );
});
