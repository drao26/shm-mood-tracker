// dark rainbow scale for mood scores 0–10 (navy → yellow/orange)
export const moodScale: string[] = [
  '#030B2E', // 0 - dark dark dark navy
  '#0A1F54', // 1 - deep indigo-blue
  '#0B3B7A', // 2 - deep blue
  '#0A5A8A', // 3 - blue-cyan
  '#0A7A6A', // 4 - deep teal
  '#2C8A35', // 5 - deep green
  '#5A8F1A', // 6 - olive green
  '#8C8410', // 7 - yellow-olive
  '#AD6B0A', // 8 - dark amber
  '#C45A06', // 9 - deep orange
  '#C77A00', // 10 - dark yellow/orange
];

// empty day color
export const emptyColor = '#EDEDEB';

// window title bar colors (rotate through these)
export const titleBarColors: string[] = [
  '#D8C8F0', // lavender
  '#B8E8D0', // mint
  '#FFF5B8', // butter yellow
  '#FFD8C0', // peach
  '#FFD0E0', // soft pink
  '#B8D8F0', // baby blue
];

// pastel accents for word cloud text (no near-white)
export const wordCloudColors: string[] = [
  '#9B7FC4', // deeper lavender
  '#5BAD8A', // deeper mint
  '#C4A635', // deeper butter
  '#D4845A', // deeper peach
  '#D46A8A', // deeper pink
  '#5A9AC4', // deeper blue
  '#7BAD5B', // deeper green
  '#C47F5A', // deeper orange
];

export function getMoodColor(score: number): string {
  const clamped = Math.max(0, Math.min(10, Math.round(score)));
  return moodScale[clamped];
}

export function getTitleBarColor(index: number): string {
  return titleBarColors[index % titleBarColors.length];
}

export function getSliderGradient(): string {
  return `linear-gradient(to right, ${moodScale.join(', ')})`;
}

const dailyBackgrounds: string[] = [
  '#f5d0e0', // pink
  '#d0f0e0', // mint
  '#e0d8f5', // lavender
  '#f5e0d0', // peach
  '#f5f0d0', // butter
  '#d0e8f5', // baby blue
  '#f5d0d0', // coral
];

function darkenHex(hex: string, factor: number): string {
  const r = Math.round(parseInt(hex.slice(1, 3), 16) * factor);
  const g = Math.round(parseInt(hex.slice(3, 5), 16) * factor);
  const b = Math.round(parseInt(hex.slice(5, 7), 16) * factor);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function getDailyPalette() {
  const idx = Math.floor(Math.random() * dailyBackgrounds.length);
  const bg = dailyBackgrounds[idx];
  const accent = darkenHex(bg, 0.72);
  const accentLight = darkenHex(bg, 0.85);
  return { bg, accent, accentLight };
}
