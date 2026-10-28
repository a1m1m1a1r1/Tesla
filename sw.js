/* TeslaSound service worker: caches the whole app so it runs offline after the first visit.
 * To force an update for everyone after you change files, bump CACHE. */
var CACHE = 'teslasound-v6';
var FILES = ['./', 'index.html', 'manifest.webmanifest', 'js/cars.js', 'js/engine-dsp.js', 'js/audio.js', 'js/vehicle.js', 'js/gps.js', 'js/thruster-fx.js', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'LICENSE', 'cars/audi-rs6.svg', 'cars/city-shifter.svg', 'cars/electric-zen.svg', 'cars/ferrari-enzo.svg', 'cars/ferrari-v12.svg', 'cars/gt3.webp', 'cars/haunted-hearse.webp', 'cars/hellcat.webp', 'cars/lamborghini-urus.svg', 'cars/lamborghini-veneno.svg', 'cars/nissan-gtr-nismo-r35.svg', 'cars/slipstream.svg', 'cars/tesla-roadster-thrust.webp', 'cars/v8-muscle.webp'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
// Cache first (instant, works offline); refresh the cached copy in the background when online.
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(caches.open(CACHE).then(function (cache) {
    return cache.match(req, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      }).catch(function () { return hit || (req.mode === 'navigate' ? cache.match('index.html') : Response.error()); });
      return hit || net;
    });
  }));
});
