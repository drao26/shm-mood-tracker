import { stopwords } from './stopwords';

export interface WordFrequency {
  text: string;
  value: number;
}

export function tokenize(texts: string[]): WordFrequency[] {
  const freq = new Map<string, number>();

  for (const text of texts) {
    if (!text) continue;
    const words = text
      .toLowerCase()
      .replace(/[^\w\s']/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 1 && !stopwords.has(w));

    for (const word of words) {
      freq.set(word, (freq.get(word) ?? 0) + 1);
    }
  }

  return Array.from(freq.entries())
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 100);
}
