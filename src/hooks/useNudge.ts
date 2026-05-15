import { useState, useEffect } from 'react';
import { hasTodayLogged, maybeShowReminder } from '../lib/nudge';

/**
 * Returns `true` when:
 *   - it is past 9 pm in the user's local timezone, AND
 *   - the user has not yet logged their mood for today.
 *
 * Re-evaluates every 60 seconds so the icon stops wiggling as soon
 * as the user saves their entry.
 */
export function useNudge(userName: string | null): boolean {
  const [shouldNudge, setShouldNudge] = useState(false);

  useEffect(() => {
    function check() {
      if (!userName) {
        setShouldNudge(false);
        return;
      }
      const now = new Date();
      const isPastNine = now.getHours() >= 21;
      const notLogged = !hasTodayLogged(userName);
      const nudge = isPastNine && notLogged;
      setShouldNudge(nudge);
      if (nudge) {
        maybeShowReminder(userName);
      }
    }

    check();
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, [userName]);

  return shouldNudge;
}
