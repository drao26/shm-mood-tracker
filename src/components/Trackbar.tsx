import { getSliderGradient } from '../lib/palette';

interface TrackbarProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

const emojis = ['🌧️', '🌧️', '🌧️', '☁️', '☁️', '🌤️', '🌤️', '☀️', '☀️', '🌈', '🌈'];

export default function Trackbar({ value, min = 0, max = 10, onChange }: TrackbarProps) {
  const steps = max - min;
  const pct = ((value - min) / steps) * 100;

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    onChange(Math.round(ratio * steps + min));
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
        className="relative h-[20px] flex items-center cursor-pointer"
        onClick={handleClick}
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
      <div className="flex items-center justify-center gap-2 mt-1">
        <span className="text-xl">{emojis[value]}</span>
        <span className="text-[12px] text-[var(--text)]">{value}</span>
      </div>
    </div>
  );
}
