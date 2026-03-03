// Kairo Admin Service Worker
const CACHE_NAME = 'kairo-admin-v1';
const STATIC_ASSETS = [
  '/super-admin/dashboard',
  '/super-admin/login',
  '/admin-icon-192.png',
  '/admin-icon-512.png',
  '/admin-icon.svg',
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
          .filter((name) => name.startsWith('kairo-admin-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch — network-first for API, cache-first for static
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // API requests — network only (always fresh data)
  if (url.pathname.startsWith('/api/')) return;

  // Navigation and static assets — network first, fall back to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.ok && url.pathname.startsWith('/super-admin')) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Offline — try cache
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // For navigation, return the cached dashboard shell
          if (event.request.mode === 'navigate') {
            return caches.match('/super-admin/dashboard');
          }
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        });
      })
  );
});
