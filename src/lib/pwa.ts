/**
 * PWA groundwork — service worker registration, notification permission,
 * and a stub for server-push subscriptions (requires VAPID keys + back-end).
 */

/** Register the PWA service worker. */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register(
      import.meta.env.BASE_URL + 'sw.js',
      { scope: import.meta.env.BASE_URL },
    );

    // When a new SW takes control, reload so the user sees the fresh bundle
    // instead of the previously cached one.
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    });

    // Detect new SW becoming available and let it activate immediately.
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing;
      if (!nw) return;
      nw.addEventListener('statechange', () => {
        if (nw.state === 'installed' && navigator.serviceWorker.controller) {
          // a previous SW is in control — tell the new one to take over
          nw.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    });

    return reg;
  } catch (e) {
    console.warn('[pwa] service worker registration failed:', e);
    return null;
  }
}

/**
 * Request browser notification permission.
 * Must be called from a user-gesture handler (e.g. a button click).
 * Returns the resulting permission state.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission !== 'default') return Notification.permission;
  return Notification.requestPermission();
}

/**
 * Subscribe to server-push notifications (VAPID).
 *
 * Requires:
 *   - A VAPID public key (pass via VITE_VAPID_PUBLIC_KEY env var)
 *   - A server endpoint to store the PushSubscription
 *
 * Returns the PushSubscription, or null if unavailable / not supported.
 */
export async function subscribeToPush(
  registration: ServiceWorkerRegistration,
  vapidPublicKey: string,
): Promise<PushSubscription | null> {
  if (!('PushManager' in window)) return null;
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
    return subscription;
  } catch (e) {
    console.warn('[pwa] push subscription failed:', e);
    return null;
  }
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}
