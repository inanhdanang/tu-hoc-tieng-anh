// ── Service Worker – Tự Học Tiếng Anh ──
const CACHE_NAME  = 'tieng-anh-v1';
const STATIC_URLS = [
  './',
  './index.html',
  './manifest.json',
  // Tất cả 30 bài học
  './Day1.html',  './Day2.html',  './Day3.html',  './Day4.html',  './Day5.html',
  './Day6.html',  './Day7.html',  './Day8.html',  './Day9.html',  './Day10.html',
  './Day11.html', './Day12.html', './Day13.html', './Day14.html', './Day15.html',
  './Day16.html', './Day17.html', './Day18.html', './Day19.html', './Day20.html',
  './Day21.html', './Day22.html', './Day23.html', './Day24.html', './Day25.html',
  './Day26.html', './Day27.html', './Day28.html', './Day29.html', './Day30.html',
];

// ── Install: cache tất cả file tĩnh ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_URLS);
    })
  );
  self.skipWaiting();
});

// ── Activate: xoá cache cũ ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: Cache First → Network fallback ──
self.addEventListener('fetch', event => {
  // Chỉ xử lý GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      // Không có cache → thử network
      return fetch(event.request).then(response => {
        // Lưu response mới vào cache
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline hoàn toàn — trả về index
        return caches.match('./index.html');
      });
    })
  );
});
