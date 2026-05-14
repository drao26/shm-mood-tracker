import { getMoodColor } from '../lib/palette';
import { ThemeSummary } from '../lib/themes';

interface ThemeChipsProps {
  themes: ThemeSummary[];
}

export default function ThemeChips({ themes }: ThemeChipsProps) {
  if (themes.length === 0) {
    return (
      <p className="text-[11px] text-[var(--text)]">
        no themes yet — log a few entries to see patterns
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {themes.map((t) => {
        const dotColor = getMoodColor(t.avgMood);
        const tooltip = t.exampleQuote ? `"${t.exampleQuote}" · avg mood ${t.avgMood}/10` : `avg mood ${t.avgMood}/10`;
        return (
          <div
            key={t.key}
            title={tooltip}
            className="flex items-center gap-1 px-2 py-1 border-2 border-t-[var(--chrome-light)] border-l-[var(--chrome-light)] border-b-[var(--chrome-dark)] border-r-[var(--chrome-dark)] bg-[var(--chrome)] cursor-default select-none"
          >
            <span className="text-[13px] leading-none">{t.emoji}</span>
            <span className="text-[11px] text-[var(--text)]">{t.key}</span>
            <span className="text-[11px] text-[var(--text)] opacity-60">{t.count}x</span>
            <span
              className="w-2 h-2 rounded-full inline-block ml-0.5"
              style={{ backgroundColor: dotColor }}
            />
          </div>
        );
      })}
    </div>
  );
}
