// Kairo Service Worker — enables install-to-desktop/home-screen.
// Network-first so users always get fresh data; cache is an offline fallback.
const CACHE_NAME = 'kairo-v1';
const STATIC_ASSETS = [
  '/login',
  '/icon-192.png',
  '/icon-512.png',
  '/icon.svg',
];

// Install — pre-cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Silently fail if offline during install
      });
    })
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names
          .filter((name) => name.startsWith('kairo-') && !name.startsWith('kairo-admin-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch — network-first; never touch API or admin-scope requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/')) return;
  if (url.pathname.startsWith('/super-admin')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok && (url.pathname === '/login' || url.pathname.startsWith('/icon'))) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || Response.error();
        });
      })
  );
});
