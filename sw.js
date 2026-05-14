const CACHE_NAME = 'diamond-ai-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css?v=39',
  '/app.js?v=39',
  '/logo.png',
  '/fulco.ico',
  '/bots.png',
  '/master.png',
  '/png.png',
  '/jpg.png',
  '/html.png',
  '/js.png',
  '/css.png',
  '/docx.png',
  // CDN-ресурсы тоже кэшируем (добавь актуальные ссылки)
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css',
  'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js',
  'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js',
  'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/mhchem.min.js',
  'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/copy-tex.min.js',
  'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
  'https://cdn.jsdelivr.net/npm/dompurify@3.0.11/dist/purify.min.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// Установка: предварительное кэширование
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Активация: удаляем старые кэши
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

// Стратегия: Cache First, затем Network (для обновления)
self.addEventListener('fetch', event => {
  // Не кэшируем запросы к Supabase и Mistral API
  if (event.request.url.includes('supabase.co') || event.request.url.includes('api.mistral.ai')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // Обновляем кэш в фоне
        fetch(event.request).then(response => {
          if (response.ok) {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, response));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200) return response;
        const clonedResponse = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clonedResponse));
        return response;
      });
    })
  );
});
