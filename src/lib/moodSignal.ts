export const MOOD_PREVIEW_KEY = 'shm-mood-preview';
export const MOOD_PREVIEW_EVENT = 'shm:mood-preview';
const MIN_MOOD_SCORE = 0;
const MAX_MOOD_SCORE = 10;

function clampMood(score: number) {
  return Math.max(MIN_MOOD_SCORE, Math.min(MAX_MOOD_SCORE, score));
}

export function getMoodPreview(): number | null {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(MOOD_PREVIEW_KEY);
  if (raw === null) return null;

  const parsed = Number(raw);
  return Number.isNaN(parsed) ? null : clampMood(parsed);
}

export function setMoodPreview(score: number | null) {
  if (typeof window === 'undefined') return;

  if (score === null || Number.isNaN(score)) {
    window.localStorage.removeItem(MOOD_PREVIEW_KEY);
  } else {
    window.localStorage.setItem(MOOD_PREVIEW_KEY, String(clampMood(score)));
  }

  window.dispatchEvent(new CustomEvent(MOOD_PREVIEW_EVENT, { detail: { score } }));
}

export function clearMoodPreview() {
  setMoodPreview(null);
}
