const CACHE_NAME = 'jar-black-hole-v2';
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
  './js/shaders.js',
  './js/probe.js',
  './js/scene.js',
  './js/particles.js',
  './js/main.js',
  // CDN 核心依賴離線快取
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/controls/OrbitControls.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/postprocessing/EffectComposer.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/postprocessing/RenderPass.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/postprocessing/ShaderPass.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/shaders/CopyShader.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/shaders/LuminosityHighPassShader.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/postprocessing/UnrealBloomPass.js'
];

// 安裝階段：個別快取防護（避免單一資源 404 導致整體失敗）
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of ASSETS_TO_CACHE) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn(`[SW] 快取跳過/失敗: ${asset}`, err);
        }
      }
    })
  );
  self.skipWaiting();
});

// 啟用階段：清除舊版本快取
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log(`[SW] 清理過期快取: ${key}`);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 請求攔截：Cache First 策略
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).catch(() => {
        // 離線回退
        return caches.match('./index.html');
      });
    })
  );
});
