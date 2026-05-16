import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getMoodPreview, MOOD_PREVIEW_EVENT, MOOD_PREVIEW_KEY } from '../lib/moodSignal';

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

function getMouthPath(mode: MascotMode) {
  switch (mode) {
    case 'storm':
      return 'M70 66 Q77 63 84 66';
    case 'sunny':
      return 'M68 64 Q78 74 88 64';
    default:
      return 'M70 65 Q78 69 86 65';
  }
}

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
    <div className="pointer-events-none absolute bottom-5 right-5 z-40 flex items-end gap-3">
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

        <svg viewBox="0 0 140 140" className="mood-mascot__art" role="img" aria-label="Mood mascot">
          {mode === 'storm' && (
            <g className="mood-mascot__weather">
              <path
                className="mood-mascot__cloud"
                d="M34 18c2-8 8-12 16-12 8 0 15 4 18 11 9 0 16 6 16 14 0 9-8 16-18 16H36c-10 0-18-7-18-16 0-8 6-14 16-13z"
              />
              <path className="mood-mascot__raindrop mood-mascot__raindrop--1" d="M40 52l5 9a5 5 0 1 1-10 0z" />
              <path className="mood-mascot__raindrop mood-mascot__raindrop--2" d="M55 56l5 9a5 5 0 1 1-10 0z" />
              <path className="mood-mascot__raindrop mood-mascot__raindrop--3" d="M70 52l5 9a5 5 0 1 1-10 0z" />
            </g>
          )}

          {mode === 'sunny' && (
            <g className="mood-mascot__weather">
              <g className="mood-mascot__sun-rays">
                <line x1="103" y1="13" x2="103" y2="2" />
                <line x1="103" y1="45" x2="103" y2="56" />
                <line x1="87" y1="29" x2="76" y2="29" />
                <line x1="119" y1="29" x2="130" y2="29" />
                <line x1="91" y1="17" x2="83" y2="9" />
                <line x1="115" y1="41" x2="123" y2="49" />
                <line x1="91" y1="41" x2="83" y2="49" />
                <line x1="115" y1="17" x2="123" y2="9" />
              </g>
              <circle className="mood-mascot__sun-core" cx="103" cy="29" r="18" />
              <rect className="mood-mascot__sunglasses" x="90" y="24" width="11" height="8" rx="2" />
              <rect className="mood-mascot__sunglasses" x="105" y="24" width="11" height="8" rx="2" />
              <line className="mood-mascot__sunglasses-bridge" x1="101" y1="28" x2="105" y2="28" />
            </g>
          )}

          <path className="mood-mascot__arm mood-mascot__arm--left" d="M48 62c-8 2-14 8-16 18" vectorEffect="non-scaling-stroke" />
          <path className="mood-mascot__arm mood-mascot__arm--right" d="M88 62c10 1 16 8 20 18" vectorEffect="non-scaling-stroke" />
          <path
            className="mood-mascot__clip"
            d="M73 14c-21 0-34 15-34 37v29c0 21 13 34 30 34 18 0 29-12 29-30V49c0-12-8-20-20-20s-21 10-21 22v33c0 8 5 14 12 14s12-6 12-14V59"
            vectorEffect="non-scaling-stroke"
          />
          <path
            className="mood-mascot__clip-highlight"
            d="M73 21c-16 0-26 12-26 30v29c0 17 10 27 22 27 13 0 21-9 21-23V49c0-8-5-13-12-13-8 0-14 7-14 15v33"
            vectorEffect="non-scaling-stroke"
          />
          <ellipse className="mood-mascot__eye mood-mascot__eye--left" cx="67" cy="48" rx="4.5" ry="6.5" />
          <ellipse className="mood-mascot__eye mood-mascot__eye--right" cx="86" cy="48" rx="4.5" ry="6.5" />
          <path className="mood-mascot__mouth" d={getMouthPath(mode)} vectorEffect="non-scaling-stroke" />
          <circle className="mood-mascot__cheek" cx="61" cy="57" r="3" />
          <circle className="mood-mascot__cheek" cx="92" cy="57" r="3" />
          <path className="mood-mascot__base" d="M52 112c4 7 12 11 21 11 9 0 17-4 22-11" />
        </svg>
      </div>
    </div>
  );
}
