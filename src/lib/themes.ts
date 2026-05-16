import { MoodEntry } from './supabase';

export interface ThemeSummary {
  key: string;
  emoji: string;
  count: number;
  avgMood: number;
  exampleQuote?: string;
}

const themeDict: Record<string, { emoji: string; keywords: string[] }> = {
  work: {
    emoji: '💼',
    keywords: ['work', 'meeting', 'meetings', 'boss', 'deadline', 'deadlines', 'office', 'job', 'project', 'projects', 'email', 'emails', 'monday', 'colleague', 'colleagues', 'client', 'clients', 'presentation', 'interview', 'salary', 'promotion'],
  },
  food: {
    emoji: '🧋',
    keywords: ['boba', 'coffee', 'lunch', 'dinner', 'breakfast', 'food', 'cooked', 'cooking', 'ate', 'restaurant', 'snack', 'snacks', 'eat', 'eating', 'meal', 'meals', 'drink', 'drinking', 'tea', 'cake', 'dessert', 'pizza', 'sushi'],
  },
  sleep: {
    emoji: '😴',
    keywords: ['tired', 'exhausted', 'sleep', 'sleeping', 'sleepy', 'nap', 'napping', 'insomnia', 'rest', 'resting', 'fatigue', 'drowsy', 'bed', 'woke', 'awake', 'oversleep', 'slept'],
  },
  friends: {
    emoji: '👯',
    keywords: ['friend', 'friends', 'hangout', 'hung', 'call', 'called', 'texted', 'visited', 'party', 'outing', 'plans', 'social', 'catch', 'vibe', 'bestie'],
  },
  family: {
    emoji: '🏠',
    keywords: ['mom', 'dad', 'sister', 'brother', 'family', 'parents', 'parent', 'aunt', 'uncle', 'cousin', 'home', 'grandma', 'grandpa', 'sibling'],
  },
  health: {
    emoji: '🏃',
    keywords: ['gym', 'run', 'running', 'walk', 'walking', 'workout', 'exercise', 'sick', 'doctor', 'period', 'cramps', 'headache', 'anxious', 'anxiety', 'stressed', 'therapy', 'yoga', 'meditation', 'mental', 'physical', 'pain', 'hurt'],
  },
  weather: {
    emoji: '🌧️',
    keywords: ['rain', 'raining', 'sunny', 'sunshine', 'cold', 'hot', 'snow', 'snowing', 'cloudy', 'clouds', 'humid', 'wind', 'windy', 'storm', 'weather'],
  },
  travel: {
    emoji: '✈️',
    keywords: ['travel', 'trip', 'flight', 'airport', 'hotel', 'vacation', 'holiday', 'road', 'drive', 'driving', 'train', 'commute', 'commuting', 'transit'],
  },
  creativity: {
    emoji: '🎨',
    keywords: ['art', 'draw', 'drawing', 'paint', 'painting', 'music', 'song', 'write', 'writing', 'read', 'reading', 'book', 'movie', 'film', 'show', 'watch', 'watching', 'podcast', 'creative', 'design', 'photo', 'photography'],
  },
  growth: {
    emoji: '🌱',
    keywords: ['learn', 'learning', 'study', 'studying', 'school', 'class', 'course', 'skill', 'goal', 'goals', 'progress', 'improve', 'improving', 'achievement', 'accomplished', 'proud', 'reflect', 'reflecting', 'gratitude', 'grateful'],
  },
};

export function extractThemes(moods: MoodEntry[]): ThemeSummary[] {
  if (moods.length === 0) return [];

  const themeCounts = new Map<string, { count: number; totalMood: number; quote?: string }>();

  for (const mood of moods) {
    const text = `${mood.gratitude ?? ''} ${mood.rant ?? ''}`.toLowerCase();
    if (!text.trim()) continue;

    const words = text
      .replace(/[^\w\s']/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1);

    for (const [themeKey, { keywords }] of Object.entries(themeDict)) {
      const matched = keywords.some((kw) => words.includes(kw));
      if (matched) {
        const current = themeCounts.get(themeKey) ?? { count: 0, totalMood: 0 };
        const quote =
          current.quote ??
          [mood.gratitude, mood.rant]
            .filter(Boolean)
            .map((t) => t!.trim())
            .find((t) => t.length <= 80);
        themeCounts.set(themeKey, {
          count: current.count + 1,
          totalMood: current.totalMood + mood.score,
          quote: quote ?? current.quote,
        });
      }
    }
  }

  return Array.from(themeCounts.entries())
    .filter(([, v]) => v.count >= 2)
    .map(([key, { count, totalMood, quote }]) => ({
      key,
      emoji: themeDict[key].emoji,
      count,
      avgMood: Math.round((totalMood / count) * 10) / 10,
      exampleQuote: quote,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Return the mood entries that mention a given theme.
 * Uses the keyword dictionary when the theme is a known rule-based key,
 * otherwise falls back to matching the words of the theme key/label
 * directly against the entry text (covers AI-generated theme keys).
 */
export function findEntriesForTheme(themeKey: string, moods: MoodEntry[]): MoodEntry[] {
  if (!themeKey) return [];

  const dictKeywords = themeDict[themeKey]?.keywords;
  const fallbackKeywords = themeKey
    .toLowerCase()
    .replace(/[^\w\s']/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
  const keywords = dictKeywords ?? fallbackKeywords;
  if (keywords.length === 0) return [];

  return moods.filter((mood) => {
    const text = `${mood.gratitude ?? ''} ${mood.rant ?? ''}`.toLowerCase();
    if (!text.trim()) return false;
    const words = text
      .replace(/[^\w\s']/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1);
    if (dictKeywords) {
      return keywords.some((kw) => words.includes(kw));
    }
    // For AI themes, allow substring match so multi-word keys like
    // "family conflict" still find entries containing "conflict".
    return keywords.some((kw) => words.includes(kw) || text.includes(kw));
  });
}
