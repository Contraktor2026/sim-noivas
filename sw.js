/* SIM. service worker — sempre busca da rede, nunca serve versão velha */
const SW_VERSION='sim-v3';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', (e) => { e.respondWith(fetch(e.request).catch(()=>caches.match(e.request))); });
