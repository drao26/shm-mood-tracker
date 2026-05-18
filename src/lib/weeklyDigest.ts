import { MoodEntry } from './supabase';
import { tokenize } from './tokenize';

/** Add `days` (can be negative) to an ISO date (YYYY-MM-DD) and return the resulting ISO date. */
function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

/** Day of week for an ISO date string in local time. 0 = Sunday … 6 = Saturday. */
export function getDayOfWeek(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
}

/** True if the given ISO date is a Sunday (local time). */
export function isSunday(iso: string): boolean {
  return getDayOfWeek(iso) === 0;
}

/**
 * Return the ISO date range (inclusive) for the Mon→Sun week that contains
 * `today`. When called on Sunday, `end` equals `today`, so this represents
 * the week that is just wrapping up.
 */
export function getLastWeekRange(today: string): { start: string; end: string } {
  const dow = getDayOfWeek(today); // 0 Sun … 6 Sat
  // Days from `today` back to the Monday that starts the current week
  const daysSinceMonday = (dow + 6) % 7; // Mon→0, Tue→1, …, Sun→6
  const start = addDays(today, -daysSinceMonday); // this week's Monday
  const end = addDays(start, 6); // this week's Sunday
  return { start, end };
}

export interface WeeklyDigest {
  weekStart: string;
  weekEnd: string;
  entryCount: number;
  groupAvg: number | null;
  bestDay: { name: string; date: string; score: number } | null;
  topWord: { word: string; count: number } | null;
  longestStreak: { name: string; length: number } | null;
}

/** Inclusive ISO date comparison: a <= b. */
function isoLte(a: string, b: string): boolean {
  return a <= b;
}

function isoGte(a: string, b: string): boolean {
  return a >= b;
}

/**
 * Compute the longest run of consecutive days within [start, end] for which
 * the user has any mood entry.
 */
function longestRunForUser(dates: Set<string>, start: string, end: string): number {
  let cursor = start;
  let best = 0;
  let current = 0;
  while (isoLte(cursor, end)) {
    if (dates.has(cursor)) {
      current += 1;
      if (current > best) best = current;
    } else {
      current = 0;
    }
    cursor = addDays(cursor, 1);
  }
  return best;
}

/**
 * Compute a weekly digest summary from all mood entries, looking at the
 * Mon–Sun week immediately preceding `today`.
 */
export function computeWeeklyDigest(moods: MoodEntry[], today: string): WeeklyDigest {
  const { start, end } = getLastWeekRange(today);
  const inWeek = moods.filter((m) => isoGte(m.date, start) && isoLte(m.date, end));

  const groupAvg =
    inWeek.length > 0
      ? Math.round((inWeek.reduce((s, m) => s + m.score, 0) / inWeek.length) * 10) / 10
      : null;

  let bestDay: WeeklyDigest['bestDay'] = null;
  for (const m of inWeek) {
    if (!bestDay || m.score > bestDay.score) {
      bestDay = { name: m.name, date: m.date, score: m.score };
    }
  }

  const gratitudes = inWeek.map((m) => m.gratitude ?? '').filter(Boolean);
  const words = tokenize(gratitudes);
  const topWord = words.length > 0 ? { word: words[0].text, count: words[0].value } : null;

  // Longest streak across all users within the week
  const datesByUser = new Map<string, Set<string>>();
  for (const m of inWeek) {
    const set = datesByUser.get(m.name) ?? new Set<string>();
    set.add(m.date);
    datesByUser.set(m.name, set);
  }
  let longestStreak: WeeklyDigest['longestStreak'] = null;
  for (const [name, dates] of datesByUser.entries()) {
    const len = longestRunForUser(dates, start, end);
    if (len > 0 && (!longestStreak || len > longestStreak.length)) {
      longestStreak = { name, length: len };
    }
  }

  return {
    weekStart: start,
    weekEnd: end,
    entryCount: inWeek.length,
    groupAvg,
    bestDay,
    topWord,
    longestStreak,
  };
}

const SHOWN_KEY_PREFIX = 'shm-weekly-digest-shown-';

/** localStorage key used to record that the digest popup has been shown for a given week. */
export function digestShownKey(weekStart: string): string {
  return `${SHOWN_KEY_PREFIX}${weekStart}`;
}
