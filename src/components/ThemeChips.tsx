import { ThemeSummary } from '../lib/themes';

interface ThemeChipsProps {
  themes: ThemeSummary[];
}

export default function ThemeChips({ themes }: ThemeChipsProps) {
  if (themes.length === 0) {
    return (
      <p className="text-[11px] text-[var(--accent)]">no themes found yet — keep logging!</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {themes.map((t) => (
        <div
          key={t.key}
          title={t.exampleQuote ? `"${t.exampleQuote}"` : undefined}
          className="flex items-center gap-1 px-2 py-1 bg-[var(--chrome)] border border-[var(--chrome-dark)] text-[11px] text-[var(--text)] cursor-default select-none"
          style={{
            borderStyle: 'solid',
            borderTopColor: 'var(--chrome-light)',
            borderLeftColor: 'var(--chrome-light)',
            borderRightColor: 'var(--chrome-dark)',
            borderBottomColor: 'var(--chrome-dark)',
          }}
        >
          <span>{t.emoji}</span>
          <span className="font-bold">{t.key}</span>
          <span className="text-[var(--accent)]">×{t.count}</span>
          <span
            className="ml-1 inline-block w-8 h-2 align-middle"
            style={{ background: `linear-gradient(to right, var(--title-active) ${t.avgMood * 10}%, var(--chrome-dark) ${t.avgMood * 10}%)` }}
            title={`avg mood ${t.avgMood}`}
          />
          <span className="text-[var(--accent)]">{t.avgMood}</span>
        </div>
      ))}
    </div>
  );
}
