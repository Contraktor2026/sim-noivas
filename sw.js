self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',async e=>{e.waitUntil((async()=>{const k=await caches.keys();await Promise.all(k.map(x=>caches.delete(x)));await self.registration.unregister();const c=await self.clients.matchAll();c.forEach(cl=>cl.navigate(cl.url));})());});
