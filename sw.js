const CACHE_VERSION = "webar-pwa-v1";
const APP_CACHE = `${CACHE_VERSION}-app`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./targets.mind",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon-180.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(APP_CACHE)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => ![APP_CACHE, RUNTIME_CACHE].includes(key))
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request, fallbackRequest = request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (response && (response.ok || response.type === "opaque")) {
      await cache.put(fallbackRequest, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await cache.match(fallbackRequest);
    if (cached) return cached;
    throw err;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const update = fetch(request)
    .then(response => {
      if (response && (response.ok || response.type === "opaque")) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  return cached || update;
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // 頁面：優先拿最新版，離線時回到已快取的 index.html
  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        const cache = await caches.open(APP_CACHE);
        cache.put("./index.html", response.clone());
        return response;
      } catch (err) {
        return (await caches.match("./index.html")) || Response.error();
      }
    })());
    return;
  }

  // data.txt 原始程式每次都帶 ?time=...，離線時統一回退到同一份快取。
  if (url.origin === self.location.origin && url.pathname.endsWith("/data.txt")) {
    const canonical = new Request(new URL("./data.txt", self.registration.scope).href);
    event.respondWith(networkFirst(request, canonical));
    return;
  }

  // 其餘本機素材與 CDN 函式庫採 stale-while-revalidate。
  event.respondWith(staleWhileRevalidate(request));
});
