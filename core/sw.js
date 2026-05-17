const CACHE_NAME = 'diamond-ai-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/core/index.html',
  '/core/style.css?v=44',
  '/core/js/diamond-core.js?v=45',
  '/core/js/diamond-auth.js?v=45',
  '/core/js/diamond-chat.js?v=45',
  '/core/js/diamond-tools.js?v=45',
  '/core/js/diamond-ui.js?v=45',
  '/assets/logo.png',
  '/assets/fulco.ico',
  '/assets/bots.png',
  '/assets/master.png',
  '/assets/png.png',
  '/assets/jpg.png',
  '/assets/html.png',
  '/assets/js.png',
  '/assets/css.png',
  '/assets/docx.png',
  '/assets/bot-av.ico',
  // CDN-ресурсы тоже кэшируем
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

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.url.includes('supabase.co') || event.request.url.includes('api.mistral.ai')) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
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
