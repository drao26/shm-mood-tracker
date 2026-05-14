import { useEffect, useRef } from 'react';

interface Toast95Props {
  /** Message text to display inside the toast. */
  message: string;
  /** Visual style — 'achievement' shows a trophy icon and richer title. */
  type?: 'info' | 'achievement';
  /** Called when the toast should be dismissed. */
  onDismiss: () => void;
  /** Auto-dismiss delay in milliseconds (default 3500). */
  duration?: number;
}

export default function Toast95({
  message,
  type = 'info',
  onDismiss,
  duration = 3500,
}: Toast95Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(onDismiss, duration);
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, [onDismiss, duration]);

  const titleText =
    type === 'achievement' ? '🏆  achievement unlocked!' : 'ℹ️  mood tracker';

  const titleBg =
    type === 'achievement'
      ? 'linear-gradient(to right, var(--accent), var(--accent-light))'
      : 'linear-gradient(to right, var(--title-inactive), var(--title-inactive))';

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        width: '240px',
        boxShadow: '3px 3px 0 #00000040',
        animation: 'toast95-in 0.15s ease-out',
      }}
      className="bg-[var(--chrome)] border-2 border-t-[var(--chrome-light)] border-l-[var(--chrome-light)] border-b-[var(--chrome-darker)] border-r-[var(--chrome-darker)]"
    >
      {/* title bar */}
      <div
        className="flex items-center justify-between h-[22px] px-1 select-none"
        style={{ background: titleBg }}
      >
        <span className="text-[11px] font-bold text-[var(--text-inverse)] truncate">
          {titleText}
        </span>
        <button
          onClick={onDismiss}
          aria-label="Close"
          className="w-[16px] h-[14px] border border-t-[var(--chrome-light)] border-l-[var(--chrome-light)] border-b-[var(--chrome-dark)] border-r-[var(--chrome-dark)] bg-[var(--chrome)] text-[10px] leading-none flex items-center justify-center shrink-0 ml-1"
        >
          ×
        </button>
      </div>

      {/* content */}
      <div className="border-2 border-t-[var(--chrome-dark)] border-l-[var(--chrome-dark)] border-b-[var(--chrome-light)] border-r-[var(--chrome-light)] m-[3px] p-2 bg-[var(--chrome)]">
        <p className="text-[11px] text-[var(--text)] leading-snug">{message}</p>
      </div>
    </div>
  );
}
