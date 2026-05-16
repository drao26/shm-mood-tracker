// Service worker for SHM Mood Tracker PWA
// Handles server push notifications and notification clicks.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Handle server-push notification
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title ?? 'shm mood tracker';
  const body = data.body ?? "don't forget to log your mood today! 🌙";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: self.location.origin + (data.icon ?? '/shm-mood-tracker/images/sun.png'),
      badge: self.location.origin + '/shm-mood-tracker/images/sun.png',
      tag: 'mood-reminder',
    }),
  );
});

// Open or focus the app when the user taps a notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow(self.location.origin + '/shm-mood-tracker/');
    }),
  );
});
