import { MoodEntry } from '../lib/supabase';

interface TopMomentsProps {
  moods: MoodEntry[];
}

export default function TopMoments({ moods }: TopMomentsProps) {
  if (moods.length === 0) return null;

  const withText = moods.filter((m) => m.gratitude || m.rant);
  if (withText.length === 0) return null;

  const sorted = [...withText].sort((a, b) => b.score - a.score);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  function quote(m: MoodEntry) {
    return m.gratitude?.trim() || m.rant?.trim() || '';
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return (
    <div className="space-y-2">
      {best && (
        <div className="border border-[var(--chrome-dark)] p-2 bg-[var(--chrome)]"
          style={{
            borderTopColor: 'var(--chrome-light)',
            borderLeftColor: 'var(--chrome-light)',
            borderRightColor: 'var(--chrome-dark)',
            borderBottomColor: 'var(--chrome-dark)',
          }}>
          <p className="text-[11px] font-bold text-[var(--text)] mb-0.5">
            🌈 best day · {formatDate(best.date)} · {best.score}/10
          </p>
          <p className="text-[11px] text-[var(--text)] italic">"{quote(best)}"</p>
        </div>
      )}
      {worst && worst.date !== best?.date && (
        <div className="border border-[var(--chrome-dark)] p-2 bg-[var(--chrome)]"
          style={{
            borderTopColor: 'var(--chrome-light)',
            borderLeftColor: 'var(--chrome-light)',
            borderRightColor: 'var(--chrome-dark)',
            borderBottomColor: 'var(--chrome-dark)',
          }}>
          <p className="text-[11px] font-bold text-[var(--text)] mb-0.5">
            🌧️ toughest day · {formatDate(worst.date)} · {worst.score}/10
          </p>
          <p className="text-[11px] text-[var(--text)] italic">"{quote(worst)}"</p>
        </div>
      )}
    </div>
  );
}
