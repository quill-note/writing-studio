const CACHE_NAME = 'sosaku-v6';
const urlsToCache = ['./', './index.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(urlsToCache)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(names => Promise.all(
      // 同じ quill-note.github.io のほかのアプリ（あみものノートなど）のキャッシュは消さない。
      // 自分の古いキャッシュ（sosaku-…）だけを片付ける
      names.filter(n => n.startsWith('sosaku-') && n !== CACHE_NAME).map(n => caches.delete(n))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('api.github.com')) {
    return;
  }
  e.respondWith(
    // ブラウザのHTTPキャッシュ（GitHub Pagesは最大10分）を通さず、毎回サーバーに最新か確認する
    fetch(e.request, { cache: 'no-cache' }).then(res => {
      const clone = res.clone();
      caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
      return res;
    }).catch(() => caches.match(e.request))
  );
});
