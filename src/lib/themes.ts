import { MoodEntry } from './supabase';

export interface Theme {
  emoji: string;
  keywords: string[];
}

export const themes: Record<string, Theme> = {
  work:     { emoji: '💼', keywords: ['work', 'meeting', 'meetings', 'boss', 'deadline', 'monday', 'office', 'job', 'project', 'coworker', 'manager', 'email', 'emails', 'slack', 'standup'] },
  food:     { emoji: '🧋', keywords: ['boba', 'coffee', 'lunch', 'dinner', 'breakfast', 'food', 'cooked', 'cooking', 'ate', 'restaurant', 'snack', 'pizza', 'sushi', 'matcha', 'tea'] },
  sleep:    { emoji: '😴', keywords: ['tired', 'exhausted', 'sleep', 'sleepy', 'nap', 'insomnia', 'rest', 'bed', 'awake', 'drained'] },
  friends:  { emoji: '👯', keywords: ['april', 'angie', 'deepthi', 'friend', 'friends', 'hangout', 'hang', 'call', 'group', 'shm'] },
  family:   { emoji: '🏠', keywords: ['mom', 'dad', 'sister', 'brother', 'family', 'parents', 'cousin', 'home', 'sibling'] },
  health:   { emoji: '🏃', keywords: ['gym', 'run', 'walk', 'workout', 'sick', 'doctor', 'period', 'cramps', 'yoga', 'pilates', 'stretching', 'sore'] },
  weather:  { emoji: '🌧️', keywords: ['rain', 'rainy', 'sunny', 'cold', 'hot', 'snow', 'cloudy', 'humid', 'gloomy'] },
  romance:  { emoji: '💖', keywords: ['date', 'crush', 'boyfriend', 'girlfriend', 'partner', 'bf', 'gf', 'ex', 'kiss', 'cuddle'] },
  travel:   { emoji: '✈️', keywords: ['flight', 'trip', 'travel', 'vacation', 'airport', 'beach', 'hotel', 'driving'] },
  pets:     { emoji: '🐈', keywords: ['mochi', 'cat', 'dog', 'pet', 'puppy', 'kitten'] },
  money:    { emoji: '💸', keywords: ['rent', 'bill', 'bills', 'money', 'broke', 'paycheck', 'salary', 'expensive', 'budget'] },
  selfcare: { emoji: '🛁', keywords: ['bath', 'shower', 'skincare', 'reading', 'book', 'movie', 'show', 'meditation', 'journaling'] },
};

export interface ThemeSummary {
  key: string;
  emoji: string;
  count: number;
  avgMood: number;
  exampleQuote?: string;
}

function normalizeText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s']/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

export function extractThemes(entries: MoodEntry[]): ThemeSummary[] {
  const results: ThemeSummary[] = [];

  for (const [key, theme] of Object.entries(themes)) {
    const keywordSet = new Set(theme.keywords);
    const matchingEntries: MoodEntry[] = [];

    for (const entry of entries) {
      const combined = `${entry.gratitude ?? ''} ${entry.rant ?? ''}`;
      const words = normalizeText(combined);
      if (words.some((w) => keywordSet.has(w))) {
        matchingEntries.push(entry);
      }
    }

    if (matchingEntries.length === 0) continue;

    const avgMood =
      Math.round(
        (matchingEntries.reduce((sum, e) => sum + e.score, 0) / matchingEntries.length) * 10
      ) / 10;

    // Pick the shortest non-empty gratitude or rant from a matching entry as example quote
    let exampleQuote: string | undefined;
    const candidates = matchingEntries
      .flatMap((e) => [e.gratitude, e.rant])
      .filter((s): s is string => Boolean(s));
    if (candidates.length > 0) {
      const shortest = candidates.reduce((a, b) => (a.length <= b.length ? a : b));
      exampleQuote = shortest.length > 80 ? shortest.slice(0, 77) + '…' : shortest;
    }

    results.push({ key, emoji: theme.emoji, count: matchingEntries.length, avgMood, exampleQuote });
  }

  return results.sort((a, b) => b.count - a.count).slice(0, 8);
}
