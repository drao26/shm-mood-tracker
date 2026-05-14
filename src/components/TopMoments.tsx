import { MoodEntry } from '../lib/supabase';
import { formatDisplayDate } from '../lib/dateUtils';

interface TopMomentsProps {
  entries: MoodEntry[];
}

export default function TopMoments({ entries }: TopMomentsProps) {
  if (entries.length < 2) return null;

  // Best day: highest score, prefer entries with gratitude; tie-break by most recent
  const withGratitude = entries.filter((e) => e.gratitude);
  const bestPool = withGratitude.length > 0 ? withGratitude : entries;
  const best = bestPool.reduce((a, b) => {
    if (b.score !== a.score) return b.score > a.score ? b : a;
    return b.date > a.date ? b : a;
  }, bestPool[0]);

  // Worst day: lowest score, prefer entries with rant; tie-break by most recent
  const withRant = entries.filter((e) => e.rant);
  const worstPool = withRant.length > 0 ? withRant : entries;
  const worst = worstPool.reduce((a, b) => {
    if (b.score !== a.score) return b.score < a.score ? b : a;
    return b.date > a.date ? b : a;
  }, worstPool[0]);

  return (
    <div className="space-y-2">
      <div className="border-2 border-t-[var(--chrome-light)] border-l-[var(--chrome-light)] border-b-[var(--chrome-dark)] border-r-[var(--chrome-dark)] bg-[var(--chrome)] p-2">
        <p className="text-[11px] font-bold text-[var(--text)] mb-0.5">
          🌈 best day · {formatDisplayDate(best.date)} · {best.score}/10
        </p>
        {best.gratitude && (
          <p className="text-[11px] text-[var(--text)] italic">"{best.gratitude}"</p>
        )}
      </div>
      <div className="border-2 border-t-[var(--chrome-light)] border-l-[var(--chrome-light)] border-b-[var(--chrome-dark)] border-r-[var(--chrome-dark)] bg-[var(--chrome)] p-2">
        <p className="text-[11px] font-bold text-[var(--text)] mb-0.5">
          🌧️ worst day · {formatDisplayDate(worst.date)} · {worst.score}/10
        </p>
        {worst.rant && (
          <p className="text-[11px] text-[var(--text)] italic">"{worst.rant}"</p>
        )}
      </div>
    </div>
  );
}
