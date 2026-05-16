import { useEffect, useState } from 'react';
import Window from './Window';
import Button95 from './Button95';
import { getLocalDate, formatDisplayDate } from '../lib/dateUtils';
import { getAllMoods, isSupabaseConfigured } from '../lib/supabase';
import {
  computeWeeklyDigest,
  digestShownKey,
  getLastWeekRange,
  isMonday,
  WeeklyDigest,
} from '../lib/weeklyDigest';

const base = import.meta.env.BASE_URL;

interface WeeklyDigestPopupProps {
  /** The currently logged-in user (used only to skip showing on the name picker screen). */
  userName: string | null;
}

/**
 * On Monday mornings, fetches all mood entries and shows a Win95-style popup
 * summarising the previous Mon–Sun week. Shown at most once per week; closing
 * the popup persists that fact in localStorage.
 */
export default function WeeklyDigestPopup({ userName }: WeeklyDigestPopupProps) {
  const [digest, setDigest] = useState<WeeklyDigest | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!userName) return;
    const today = getLocalDate();
    if (!isMonday(today)) return;

    const { start } = getLastWeekRange(today);
    const key = digestShownKey(start);

    let alreadyShown = false;
    try {
      alreadyShown = window.localStorage.getItem(key) === '1';
    } catch {
      // localStorage unavailable — fall through and just don't persist
    }
    if (alreadyShown) return;

    if (!isSupabaseConfigured) return;

    let cancelled = false;
    (async () => {
      try {
        const moods = await getAllMoods();
        if (cancelled) return;
        const result = computeWeeklyDigest(moods, today);
        if (result.entryCount === 0) {
          // Nothing to summarise — silently skip and don't mark as shown so
          // the popup can appear next Monday once data exists.
          return;
        }
        setDigest(result);
        setOpen(true);
      } catch {
        // Network/db errors — fail silently, this is an ambient feature.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userName]);

  function handleClose() {
    if (digest) {
      try {
        window.localStorage.setItem(digestShownKey(digest.weekStart), '1');
      } catch {
        // ignore
      }
    }
    setOpen(false);
  }

  if (!open || !digest) return null;

  const { groupAvg, bestDay, topWord, longestStreak, weekStart, weekEnd } = digest;

  return (
    <div
      role="dialog"
      aria-label="weekly wrap-up"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.25)',
      }}
      onMouseDown={(e) => {
        // click on backdrop dismisses the popup
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div style={{ width: 'min(420px, 92vw)', boxShadow: '4px 4px 0 #00000040' }}>
        <Window
          title="weekly wrap-up"
          tone="lavender"
          icon={`${base}images/sun.png`}
          onClose={handleClose}
        >
          <div className="flex flex-col gap-3 p-1 text-[var(--text)]">
            <div>
              <p className="text-[12px] font-bold">happy monday! ☀️</p>
              <p className="text-[11px]">
                here's how last week ({formatDisplayDate(weekStart)} – {formatDisplayDate(weekEnd)})
                went:
              </p>
            </div>

            <ul className="flex flex-col gap-2 text-[11px]">
              {groupAvg !== null && (
                <li>
                  <span className="font-bold">📊 group avg:</span> {groupAvg.toFixed(1)}/10
                </li>
              )}
              {bestDay && (
                <li>
                  <span className="font-bold">🌟 best day:</span> {bestDay.name} on{' '}
                  {formatDisplayDate(bestDay.date)} ({bestDay.score}/10)
                </li>
              )}
              {topWord && (
                <li>
                  <span className="font-bold">🙏 most-used gratitude word:</span> "{topWord.word}"
                  {topWord.count > 1 ? ` (×${topWord.count})` : ''}
                </li>
              )}
              {longestStreak && (
                <li>
                  <span className="font-bold">🔥 longest streak:</span> {longestStreak.name} —{' '}
                  {longestStreak.length} day{longestStreak.length === 1 ? '' : 's'}
                </li>
              )}
            </ul>

            <div className="flex justify-end pt-1">
              <Button95 onClick={handleClose}>OK</Button95>
            </div>
          </div>
        </Window>
      </div>
    </div>
  );
}
