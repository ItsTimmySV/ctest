// service-worker.js
// This Service Worker is primarily registered to enable future Web Push capabilities
// and other PWA features, as requested by the user.
// For the current "no backend" scenario, it does not actively receive or send server-pushed notifications.
// Client-side notifications are handled directly by the Notification API in script.js.

self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    self.skipWaiting(); // Force the waiting service worker to become the active service worker.
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    // Clean up old caches if necessary
    event.waitUntil(clients.claim()); // Become active client
});

self.addEventListener('fetch', (event) => {
    // This is typically used for caching assets or handling network requests.
    // For this app, we're not implementing offline caching, but it's where you would.
    // event.respondWith(caches.match(event.request).then(response => {
    //     return response || fetch(event.request);
    // }));
});

// A 'push' event listener would go here if server-sent push notifications were implemented.
// self.addEventListener('push', (event) => {
//     const data = event.data.json();
//     console.log('Push received:', data);
//     const title = data.title || 'Credit Tracker Notification';
//     const options = {
//         body: data.body,
//         icon: data.icon || '/icon-cards.png',
//         tag: data.tag,
//         data: data.data // additional data for click event
//     };
//     event.waitUntil(self.registration.showNotification(title, options));
// });

// A 'notificationclick' event listener would go here if server-sent push notifications were implemented.
// self.addEventListener('notificationclick', (event) => {
//     console.log('Notification clicked', event.notification.tag);
//     event.notification.close();
//     event.waitUntil(
//         clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
//             if (clientList.length > 0) {
//                 let client = clientList[0];
//                 for (let i = 0; i < clientList.length; i++) {
//                     if (clientList[i].focused) {
//                         client = clientList[i];
//                     }
//                 }
//                 return client.focus();
//             }
//             return clients.openWindow('/'); // Open a new window if no clients are available
//         })
//     );
// });