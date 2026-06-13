/* SIM. — service worker de auto-remoção (resolve cache preso) */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', async (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll();
    clients.forEach(c => c.navigate(c.url));
  })());
});
/* não intercepta mais nada: tudo vai direto à rede */
