import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getMoodPreview, MOOD_PREVIEW_EVENT, MOOD_PREVIEW_KEY } from '../lib/moodSignal';
import PixelEmoji from './PixelEmoji';
import { PixelClippy } from './PixelClippy';

type MascotMode = 'idle' | 'neutral' | 'storm' | 'sunny';
const REACTION_DURATION_MS = 900;
const MOOD_BUBBLE_DURATION_MS = 4600;
const IDLE_BUBBLE_DURATION_MS = 3800;
const IDLE_BUBBLE_DELAY_MS = 6000;
const IDLE_BUBBLE_RANDOM_RANGE_MS = 5000;
type TimerId = ReturnType<typeof setTimeout>;

const commentaryByMode: Record<MascotMode, string[]> = {
  idle: [
    "it looks like you're having a day!",
    'mood.exe is standing by...',
    'desktop buddy reporting for duty.',
  ],
  neutral: [
    'steady vibes detected. very windows of you.',
    'looking balanced. i love that for this desktop.',
    'status: cruising through the day in style.',
  ],
  storm: [
    "rainy cloud mode activated. let's keep it cozy.",
    'storm alert: emotions are loading, and that is valid.',
    'gray skies on the desktop. i brought backup sparkle.',
  ],
  sunny: [
    'sunglasses sun engaged. certified main-character energy.',
    'high-vibe forecast: all sunshine, no reboot needed.',
    'desktop glow-up detected. please admire responsibly.',
  ],
};

function getMode(score: number | null): MascotMode {
  if (score === null) return 'idle';
  if (score < 4) return 'storm';
  if (score > 7) return 'sunny';
  return 'neutral';
}

function pickLine(lines: string[], current?: string | null) {
  if (lines.length <= 1) return lines[0] ?? '';
  const filtered = current ? lines.filter((line) => line !== current) : lines;
  const pool = filtered.length > 0 ? filtered : lines;
  return pool[Math.floor(Math.random() * pool.length)];
}

const emojiByMode: Record<MascotMode, string> = {
  idle: '❔',
  neutral: '⛅',
  storm: '🌧️',
  sunny: '☀️',
};



export default function MoodMascot() {
  const [score, setScore] = useState<number | null>(() => getMoodPreview());
  const [line, setLine] = useState(() => pickLine(commentaryByMode.idle));
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [reacting, setReacting] = useState(false);
  const mode = useMemo(() => getMode(score), [score]);
  const previousMode = useRef<MascotMode>(mode);
  const idleTimers = useRef(new Set<TimerId>());

  const clearIdleTimers = useCallback(() => {
    idleTimers.current.forEach((timerId) => clearTimeout(timerId));
    idleTimers.current.clear();
  }, []);

  const trackIdleTimer = useCallback((timerId: TimerId) => {
    idleTimers.current.add(timerId);
    return timerId;
  }, []);

  useEffect(() => {
    const syncScore = (nextScore: number | null) => {
      setScore(nextScore);
    };

    const handleMoodPreview = (event: Event) => {
      const customEvent = event as CustomEvent<{ score?: number | null }>;
      syncScore(customEvent.detail?.score ?? getMoodPreview());
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === MOOD_PREVIEW_KEY) {
        syncScore(getMoodPreview());
      }
    };

    window.addEventListener(MOOD_PREVIEW_EVENT, handleMoodPreview as EventListener);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(MOOD_PREVIEW_EVENT, handleMoodPreview as EventListener);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    if (previousMode.current === mode) return;

    previousMode.current = mode;
    setReacting(true);
    setLine((current) => pickLine(commentaryByMode[mode], current));
    setBubbleVisible(true);

    const reactTimer = setTimeout(() => setReacting(false), REACTION_DURATION_MS);
    const hideTimer = setTimeout(() => setBubbleVisible(false), MOOD_BUBBLE_DURATION_MS);

    return () => {
      clearTimeout(reactTimer);
      clearTimeout(hideTimer);
    };
  }, [mode]);

  useEffect(() => {
    clearIdleTimers();

    const schedule = () => {
      const showTimer = trackIdleTimer(
        setTimeout(() => {
          idleTimers.current.delete(showTimer);
          setLine((current) => pickLine(commentaryByMode[mode], current));
          setBubbleVisible(true);

          const hideTimer = trackIdleTimer(
            setTimeout(() => {
              idleTimers.current.delete(hideTimer);
              setBubbleVisible(false);
              schedule();
            }, IDLE_BUBBLE_DURATION_MS)
          );
        }, IDLE_BUBBLE_DELAY_MS + Math.random() * IDLE_BUBBLE_RANDOM_RANGE_MS)
      );
    };

    schedule();
    return clearIdleTimers;
  }, [clearIdleTimers, mode, trackIdleTimer]);

  return (
    <div
      className="pointer-events-none absolute z-40 flex items-end gap-3"
      style={{
        right: '20px',
        bottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div
        className={`mood-mascot__bubble ${bubbleVisible ? 'mood-mascot__bubble--visible' : ''}`}
        aria-live="polite"
      >
        {line}
      </div>

      <div className={`mood-mascot mood-mascot--${mode} ${reacting ? 'mood-mascot--reacting' : ''}`}>
        <div className="mood-mascot__status">
          {score === null ? 'mood buddy · idle' : `mood buddy · ${score}/10`}
        </div>
        <div className="mood-mascot__shadow" />

        <div className="mood-mascot__ghost-wrap">
          <PixelClippy mode={mode} reacting={reacting} />
          <div className="mood-mascot__weather-badge">
            <PixelEmoji emoji={emojiByMode[mode]} size={22} pixelSize={16} />
          </div>
        </div>
      </div>
    </div>
  );
}
