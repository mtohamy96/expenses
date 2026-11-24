const CACHE = 'exp-v2';
const SDK = ['app', 'auth', 'firestore'].map(x => 'https://www.gstatic.com/firebasejs/10.12.2/firebase-' + x + '-compat.js');
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './firebase-config.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(async c => {
    await Promise.all(FILES.map(f => c.add(f).catch(() => {})));
    await Promise.all(SDK.map(u => fetch(u, { mode: 'cors' }).then(r => r.ok && c.put(u, r)).catch(() => {})));
  }).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || (u.origin !== location.origin && u.hostname !== 'www.gstatic.com')) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => {
    const net = fetch(e.request).then(r => {
      if (r && r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); }
      return r;
    }).catch(() => hit || caches.match('./index.html'));
    return hit || net;
  }));
});
