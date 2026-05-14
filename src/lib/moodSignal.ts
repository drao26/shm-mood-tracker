export const MOOD_PREVIEW_KEY = 'shm-mood-preview';
export const MOOD_PREVIEW_EVENT = 'shm:mood-preview';

function clampMood(score: number) {
  return Math.max(0, Math.min(10, score));
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
