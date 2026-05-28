const BASE = self.location.pathname.replace(/\/sw\.js$/,"");
const CACHE = "arrow-gym-v5";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll([BASE+"/", BASE+"/index.html", BASE+"/manifest.json", BASE+"/icon.svg"])));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then((cached) => cached || fetch(e.request).then((res) => { const c = res.clone(); caches.open(CACHE).then((cache) => cache.put(e.request, c)); return res; }).catch(() => caches.match(BASE+"/index.html"))));
});
