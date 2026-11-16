// AP Plastic ERP: lets the app be installed, and opens it without internet from the last copy.
// Always asks the internet first, so everyone gets the newest version as soon as it is online.
// Only this app's own files are handled; the Supabase records are never stored here.
const CACHE = "ap-erp-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(r).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); }
      return res;
    }).catch(() => caches.match(r).then(m => m || (r.mode === "navigate" ? caches.match("./") : undefined))
      .then(m => m || new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } })))
  );
});
