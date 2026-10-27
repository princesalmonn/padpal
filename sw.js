// =====================================================================
// PadPal · 📦 offline app cache (service worker)
// Keeps all of PadPal's own files ON THE PHONE, so pages open instantly,
// even with bad signal. Only the live data (posts, scores, chat…) comes from the internet.
//
// New version? Change VERSION (the deploy step does this): the phone downloads the new files
// quietly in the background, then the next time you open PadPal you get the new version.
// =====================================================================
var VERSION = 'padpal-v25';
var FILES = [
  './', 'index.html', 'login.html', 'feed.html', 'play.html', 'chat.html', 'ranks.html', 'profile.html',
  'notifications.html', 'road.html', 'tourney.html', 'admin.html',
  'styles.css', 'config.js', 'supabase-2.45.4.js', 'auth.js', 'levels.js', 'doodles.js', 'sessions.js',
  'share.js', 'rate.js', 'tracker.js',
  'logo-dark.svg', 'logo-light.svg', 'favicon.png', 'icon-180.png', 'icon-512.png'
];

// Install: download every file once (all or nothing, so a version is never half-updated)
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) {
    return c.addAll(FILES.map(function (f) { return new Request(f, { cache: 'reload' }); }));
  }).then(function () { return self.skipWaiting(); }));
});

// Activate: throw away older versions, start serving straight away
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('padpal-') === 0 && k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

// Fetch: PadPal's own files come from the phone (ignoring ?v=… and ?join=… parts);
// everything else (Supabase data, photos) goes to the internet as usual.
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(caches.open(VERSION).then(function (c) {
    return c.match(req, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res.ok && res.type === 'basic') c.put(req, res.clone());
        return res;
      }).catch(function () {
        // offline and not stored: for a page, show the Feed we have
        return req.mode === 'navigate' ? c.match('feed.html') : Response.error();
      });
    });
  }));
});
