import { useState } from 'react';
import { ThemeSummary, findEntriesForTheme } from '../lib/themes';
import { MoodEntry } from '../lib/supabase';

interface ThemeChipsProps {
  themes: ThemeSummary[];
  moods?: MoodEntry[];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ThemeChips({ themes, moods = [] }: ThemeChipsProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  if (themes.length === 0) {
    return (
      <p className="text-[11px] text-[var(--accent)]">no themes found yet — keep logging!</p>
    );
  }

  const selectedTheme = selectedKey ? themes.find((t) => t.key === selectedKey) ?? null : null;
  const selectedEntries = selectedTheme
    ? findEntriesForTheme(selectedTheme.key, moods).sort((a, b) => b.date.localeCompare(a.date))
    : [];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {themes.map((t) => {
          const isActive = selectedKey === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setSelectedKey(isActive ? null : t.key)}
              title={t.exampleQuote ? `"${t.exampleQuote}"` : undefined}
              aria-pressed={isActive}
              className="flex items-center gap-1 px-2 py-1 bg-[var(--chrome)] border border-[var(--chrome-dark)] text-[11px] text-[var(--text)] select-none cursor-pointer hover:brightness-105 focus:outline-none"
              style={{
                borderStyle: 'solid',
                borderTopColor: isActive ? 'var(--chrome-dark)' : 'var(--chrome-light)',
                borderLeftColor: isActive ? 'var(--chrome-dark)' : 'var(--chrome-light)',
                borderRightColor: isActive ? 'var(--chrome-light)' : 'var(--chrome-dark)',
                borderBottomColor: isActive ? 'var(--chrome-light)' : 'var(--chrome-dark)',
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
            </button>
          );
        })}
      </div>

      {selectedTheme && (
        <div
          className="border border-[var(--chrome-dark)] p-2 bg-[var(--chrome)]"
          style={{
            borderTopColor: 'var(--chrome-light)',
            borderLeftColor: 'var(--chrome-light)',
            borderRightColor: 'var(--chrome-dark)',
            borderBottomColor: 'var(--chrome-dark)',
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-[11px] font-bold text-[var(--text)]">
              {selectedTheme.emoji} entries mentioning "{selectedTheme.key}"
              <span className="ml-1 text-[var(--accent)] font-normal">
                ({selectedEntries.length})
              </span>
            </p>
            <button
              type="button"
              onClick={() => setSelectedKey(null)}
              className="text-[11px] text-[var(--accent)] underline cursor-pointer"
              aria-label="close entries"
            >
              close
            </button>
          </div>
          {selectedEntries.length === 0 ? (
            <p className="text-[11px] text-[var(--accent)] italic">
              no matching entries found
            </p>
          ) : (
            <ul className="space-y-1 max-h-48 overflow-auto">
              {selectedEntries.map((m) => (
                <li
                  key={m.id ?? `${m.name}-${m.date}`}
                  className="text-[11px] text-[var(--text)] border-b border-dotted border-[var(--chrome-dark)] last:border-b-0 pb-1"
                >
                  <span className="font-bold">{formatDate(m.date)}</span>
                  <span className="text-[var(--accent)]"> · {m.score}/10</span>
                  {m.gratitude?.trim() && (
                    <p className="italic">🙏 "{m.gratitude.trim()}"</p>
                  )}
                  {m.rant?.trim() && (
                    <p className="italic">💢 "{m.rant.trim()}"</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
