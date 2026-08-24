const CACHE_NAME = 'jar-black-hole-v11.6';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './jarBlackHole192icon.png',
  './jarBlackHole512icon.png',
  './js/i18n.js',
  './js/physics.js',
  './js/audio.js',
  './js/narrative.js',
  './js/evolution.js',
  './js/shaders.js',
  './js/probe.js',
  './js/scene.js',
  './js/particles.js',
  './js/main.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/controls/OrbitControls.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/postprocessing/EffectComposer.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/postprocessing/RenderPass.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/postprocessing/ShaderPass.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/shaders/CopyShader.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/shaders/LuminosityHighPassShader.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/postprocessing/UnrealBloomPass.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of ASSETS_TO_CACHE) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn(`[SW] 快取跳過: ${asset}`, err);
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log(`[SW] 清理舊快取: ${key}`);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && e.request.method === 'GET') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(e.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return caches.match('./index.html');
        });
      })
  );
});
