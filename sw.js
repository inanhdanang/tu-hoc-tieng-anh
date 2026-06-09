// ============================================================
// Service Worker – Tự Học Tiếng Anh
// Version: 1.0 – cập nhật số version khi thay đổi nội dung
// ============================================================

const CACHE_NAME = 'tieng-anh-v1';

// Các file cần cache để dùng offline
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  // Thêm các file Day*.html của bạn vào đây để dùng offline hoàn toàn:
  // './Day1.html', './Day2.html', ... './Day30.html',
];

// ── CÀI ĐẶT: Cache các file quan trọng ──
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('[SW] Pre-caching files');
      return cache.addAll(PRECACHE_URLS);
    }).then(function() {
      return self.skipWaiting(); // Kích hoạt SW ngay lập tức
    })
  );
});

// ── KÍCH HOẠT: Xóa cache cũ ──
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function(name) { return name !== CACHE_NAME; })
          .map(function(name) {
            console.log('[SW] Xóa cache cũ:', name);
            return caches.delete(name);
          })
      );
    }).then(function() {
      return self.clients.claim(); // Kiểm soát tất cả tab ngay lập tức
    })
  );
});

// ── FETCH: Cache-first cho file tĩnh, Network-first cho API ──
self.addEventListener('fetch', function(event) {
  // Chỉ xử lý GET requests
  if (event.request.method !== 'GET') return;

  // Bỏ qua các request không phải HTTP/HTTPS
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then(function(cachedResponse) {
      if (cachedResponse) {
        // Có trong cache → trả về ngay, đồng thời cập nhật ngầm
        fetch(event.request).then(function(networkResponse) {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(event.request, networkResponse.clone());
            });
          }
        }).catch(function() {}); // Không có mạng thì thôi
        return cachedResponse;
      }

      // Không có cache → lấy từ mạng rồi lưu lại
      return fetch(event.request).then(function(networkResponse) {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        var responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(function() {
        // Offline và không có cache: trả về trang chủ nếu là HTML
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
