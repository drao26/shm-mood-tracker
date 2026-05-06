import { getSliderGradient } from '../lib/palette';

interface MoodSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const emojis = ['🌧️', '🌧️', '🌧️', '☁️', '☁️', '🌤️', '🌤️', '☀️', '☀️', '🌈', '🌈'];

export default function MoodSlider({ value, onChange }: MoodSliderProps) {
  return (
    <div className="w-full space-y-3">
      <div className="relative">
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-3 rounded-full cursor-pointer"
          style={{ background: getSliderGradient() }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">0</span>
        <div className="flex flex-col items-center">
          <span className="text-3xl">{emojis[value]}</span>
          <span className="text-sm font-medium text-gray-600 mt-1">{value}</span>
        </div>
        <span className="text-xs text-gray-400">10</span>
      </div>
    </div>
  );
}
