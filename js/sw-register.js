/**
 * J.A.R. Enterprise Service Worker Register & Security Monitor
 */
'use strict';

(function () {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker
        .register('./sw.js')
        .then(function (registration) {
          // 定期檢查快取更新
          registration.onupdatefound = function () {
            const installingWorker = registration.installing;
            if (installingWorker == null) return;
            installingWorker.onstatechange = function () {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.info('[SecOps] New security patch / version available.');
                }
              }
            };
          };
        })
        .catch(function (error) {
          console.warn('[SecOps] ServiceWorker registration bypassed:', error);
        });
    });
  }
})();
