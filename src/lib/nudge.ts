import { getLocalDate } from './dateUtils';

/** localStorage key that records whether the user has logged today's mood. */
export function getTodayLoggedKey(userName: string): string {
  return `shm-logged-${userName}-${getLocalDate()}`;
}

/** Mark that the user has logged their mood for today. */
export function markTodayLogged(userName: string): void {
  localStorage.setItem(getTodayLoggedKey(userName), 'true');
}

/** Return true if the user has already logged their mood today. */
export function hasTodayLogged(userName: string): boolean {
  return localStorage.getItem(getTodayLoggedKey(userName)) === 'true';
}

/** localStorage key that records whether a nudge notification has been shown today. */
function getTodayNotifiedKey(userName: string): string {
  return `shm-notified-${userName}-${getLocalDate()}`;
}

/**
 * Show a one-shot local reminder notification (if permission is granted).
 * Only fires once per day per user to avoid being annoying.
 */
export function maybeShowReminder(userName: string): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const key = getTodayNotifiedKey(userName);
  if (localStorage.getItem(key) === 'true') return;
  localStorage.setItem(key, 'true');
  new Notification('shm mood tracker', {
    body: "it's past 9pm — don't forget to log your mood today! 🌙",
    icon: import.meta.env.BASE_URL + 'images/sun.png',
    tag: 'mood-reminder',
  });
}
