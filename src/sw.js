import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || '정원 손님의 쪽지가 도착했어요';
  const options = {
    body: data.body || '오늘의 마음 곁에 남긴 작은 쪽지를 확인해볼까요?',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = new URL(event.notification.data?.url || '/', self.location.origin);

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        const existingClient = clients.find((client) => {
          try {
            return new URL(client.url).origin === url.origin;
          } catch {
            return false;
          }
        });

        if (existingClient) {
          return existingClient.focus().then((client) => client.navigate?.(url.href) || client);
        }

        return self.clients.openWindow(url.href);
      }),
  );
});
