const CACHE_NAME = 'anka-portfolio-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/script.js',
  'splash.jpeg',
  'login.jpeg',
  'dashboard.jpeg',
  'anka.jpeg'
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Fetch dari cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
