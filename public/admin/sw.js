// Service worker mínimo del panel de administración (alcance: /admin/).
// No guarda datos en caché: el panel siempre muestra información actual.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))
self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return
  event.respondWith(
    fetch(event.request).catch(
      () =>
        new Response('Sin conexión. Conéctate a internet para usar el panel de DON PABON.', {
          status: 503,
          headers: { 'content-type': 'text/plain; charset=utf-8' },
        }),
    ),
  )
})
