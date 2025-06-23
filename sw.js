self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const urlToOpen = self.registration.scope;

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true,
        }).then((clientList) => {
            // 如果已经有一个窗口打开，则聚焦它
            if (clientList.length > 0) {
                let client = clientList[0];
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].focused) {
                        client = clientList[i];
                    }
                }
                if (client) {
                    return client.focus();
                }
            }

            // 否则，打开一个新窗口
            return clients.openWindow(urlToOpen);
        })
    );
}); 