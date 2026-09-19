/* Extra SW script imported by Workbox — handles overdue notification clicks. */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/live-pm/';
  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });
      for (const client of allClients) {
        if ('focus' in client) {
          try {
            const url = new URL(client.url);
            if (url.pathname.startsWith('/live-pm')) {
              await client.focus();
              if ('navigate' in client) {
                try {
                  await client.navigate(targetUrl);
                } catch {
                  /* navigate may fail on some browsers; focus is enough */
                }
              }
              return;
            }
          } catch {
            /* ignore bad client urls */
          }
        }
      }
      if (self.clients.openWindow) {
        await self.clients.openWindow(targetUrl);
      }
    })(),
  );
});
