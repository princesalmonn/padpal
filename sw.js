// =====================================================================
// PadPal · 📦 offline app cache (service worker)
// Keeps all of PadPal's own files ON THE PHONE, so pages open instantly,
// even with bad signal. Only the live data (posts, scores, chat…) comes from the internet.
//
// New version? Change VERSION (the deploy step does this): the phone downloads the new files
// quietly in the background, then the next time you open PadPal you get the new version.
// =====================================================================
var VERSION = 'padpal-v33';
var FILES = [
  './', 'index.html', 'login.html', 'feed.html', 'play.html', 'chat.html', 'ranks.html', 'profile.html',
  'notifications.html', 'road.html', 'tourney.html', 'admin.html',
  'styles.css', 'config.js', 'supabase-2.45.4.js', 'auth.js', 'levels.js', 'doodles.js', 'sessions.js',
  'share.js', 'rate.js', 'tracker.js', 'rackets.js', 'racket-list.js',
  'logo-dark.svg', 'logo-light.svg', 'favicon.png', 'icon-180.png', 'icon-512.png', 'manifest.json'
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

// 📲 A pop-up notification arrived (sent by the "push" messenger in Supabase), even if PadPal is closed
self.addEventListener('push', function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { body: e.data ? e.data.text() : '' }; }
  var jobs = [self.registration.showNotification(d.title || 'PadPal', {
    body: d.body || '', tag: d.tag || undefined, icon: 'icon-512.png', badge: 'favicon.png',
    data: { link: d.link || 'notifications.html' }
  })];
  // the red number on the PadPal icon = unread notifications
  if (d.badge != null && self.navigator.setAppBadge) jobs.push(self.navigator.setAppBadge(d.badge).catch(function () {}));
  e.waitUntil(Promise.all(jobs));
});

// Tap on the pop-up → open PadPal on the right page
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var url = new URL((e.notification.data && e.notification.data.link) || 'notifications.html', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    var open = list[0];
    if (open && open.navigate) {
      return open.focus().then(function (c) { return (c || open).navigate(url); }).catch(function () { return self.clients.openWindow(url); });
    }
    return self.clients.openWindow(url);
  }));
});
