/* AP Main on a phone (installed from Chrome): opens the newest version when there is internet, and the last copy
   without internet. Only AP Main's own page files are kept here; records always come from the cloud, never from here. */
const CACHE = "ap-main-v1";
const FILES = ["./", "./manifest.webmanifest", "./icon.png", "./icon-512.png", "./logo-mark.png"];
self.addEventListener("install", (e) => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).catch(() => {})); });
self.addEventListener("activate", (e) => e.waitUntil(
  caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  const path = "." + u.pathname.replace(/^.*\//, "/");
  if (!FILES.includes(path) && u.pathname !== "/") return;   // the cloud's records, photos and updates are never kept here
  e.respondWith(fetch(e.request).then((r) => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match(e.request).then((m) => m || caches.match("./"))));
});
