/* OpenFilament service worker — cache static shell only; documents stay network-first. */
const SHELL_CACHE = "of-shell-v2";
const SHELL = ["/", "/offline.html", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== SHELL_CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Never put API / auth responses in the shared shell cache.
  if (url.pathname.startsWith("/api/") || url.pathname.includes("openapi")) {
    return;
  }

  if (req.destination === "document") {
    event.respondWith(
      fetch(req).catch(async () => {
        const offline = await caches.match("/offline.html");
        return offline ?? new Response("Offline", { status: 503, statusText: "Offline" });
      }),
    );
    return;
  }

  event.respondWith(
    fetch(req).catch(async () => {
      const cached = await caches.match(req);
      return cached ?? new Response("Offline", { status: 503, statusText: "Offline" });
    }),
  );
});
