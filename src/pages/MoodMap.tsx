import { useEffect, useState } from 'react';
import Heatmap from '../components/Heatmap';
import { getAllMoods, isSupabaseConfigured, MoodEntry } from '../lib/supabase';

export default function MoodMap() {
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAllMoods() {
      if (!isSupabaseConfigured) {
        setError('supabase is not configured');
        setLoading(false);
        return;
      }

      try {
        const data = await getAllMoods();
        if (!cancelled) {
          setMoods(data);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'failed to load mood map');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAllMoods();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-[11px] text-[var(--text)]">loading...</p>;
  }

  if (error) {
    return <p className="text-[11px] text-[var(--text)]">{error}</p>;
  }

  const dateScores = new Map<string, number[]>();
  for (const m of moods) {
    const arr = dateScores.get(m.date) ?? [];
    arr.push(m.score);
    dateScores.set(m.date, arr);
  }
  const combinedEntries = Array.from(dateScores.entries()).map(([date, scores]) => ({
    date,
    score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
  }));

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-bold text-[var(--text)]">swedish house mafia mood map</p>
      <Heatmap entries={combinedEntries} label="group average" />
    </div>
  );
}
