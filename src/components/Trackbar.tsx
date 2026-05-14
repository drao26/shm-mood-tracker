import { useCallback, useRef } from 'react';
import { getSliderGradient } from '../lib/palette';
import { moodFaces } from '../lib/moodFaces';

interface TrackbarProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export default function Trackbar({ value, min = 0, max = 10, onChange }: TrackbarProps) {
  const steps = max - min;
  const pct = ((value - min) / steps) * 100;
  const trackRef = useRef<HTMLDivElement>(null);

  const computeValue = useCallback((clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    onChange(Math.round(ratio * steps + min));
  }, [steps, min, onChange]);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    computeValue(e.clientX);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.buttons === 0) return;
    computeValue(e.clientX);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      onChange(Math.min(max, value + 1));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      onChange(Math.max(min, value - 1));
    }
  }

  return (
    <div className="w-full select-none">
      {/* track area */}
      <div
        ref={trackRef}
        className="relative h-[20px] flex items-center cursor-pointer touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        role="slider"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {/* rainbow gradient under the track */}
        <div
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[4px]"
          style={{ background: getSliderGradient() }}
        />
        {/* sunken bevel track */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[4px] border border-t-[var(--chrome-dark)] border-l-[var(--chrome-dark)] border-b-[var(--chrome-light)] border-r-[var(--chrome-light)] bg-transparent" />
        {/* thumb */}
        <div
          className="absolute top-0 w-[12px] h-[20px] border-2 border-t-[var(--chrome-light)] border-l-[var(--chrome-light)] border-b-[var(--chrome-dark)] border-r-[var(--chrome-dark)] bg-[var(--chrome)]"
          style={{ left: `calc(${pct}% - 6px)` }}
        />
      </div>
      {/* tick marks */}
      <div className="flex justify-between px-[5px] mt-[2px]">
        {Array.from({ length: steps + 1 }, (_, i) => (
          <div key={i} className="w-px h-[6px] bg-[var(--chrome-darker)]" />
        ))}
      </div>
      {/* emoji + number readout */}
      <div className="flex items-center justify-center gap-2 mt-2">
        <span key={value} className="mood-bounce text-5xl">{moodFaces[value]}</span>
        <span className="text-[12px] text-[var(--text)]">{value}</span>
      </div>
    </div>
  );
}
