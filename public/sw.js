const CACHE = "fitforce-v2";
const STATIC = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
  "/favicon.svg",
  "/icons/icon.svg",
];
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(STATIC);
    })()
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (event.request.headers.get("Accept")?.includes("text/html")) {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(event.request);
          const cache = await caches.open(CACHE);
          cache.put(event.request, res.clone());
          return res;
        } catch {
          return caches.match(OFFLINE_URL);
        }
      })()
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);
      const isDev = event.request.url.includes("localhost") || event.request.url.includes("127.0.0.1");
      if (cached && !isDev) return cached;
      try {
        const res = await fetch(event.request);
        if (res.ok) {
          const cache = await caches.open(CACHE);
          cache.put(event.request, res.clone());
        }
        return res;
      } catch {
        return cached || caches.match(OFFLINE_URL);
      }
    })()
  );
});
