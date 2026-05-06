import { useEffect, useState } from 'react';
import Heatmap from '../components/Heatmap';
import { getMoodsForUser, isSupabaseConfigured, MoodEntry } from '../lib/supabase';

interface MyHeatmapsProps {
  overrideName?: string;
}

export default function MyHeatmaps({ overrideName }: MyHeatmapsProps) {
  const name = overrideName ?? localStorage.getItem('shm-user');
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMoods() {
      if (!name) {
        setLoading(false);
        return;
      }

      if (!isSupabaseConfigured) {
        setError('supabase is not configured');
        setLoading(false);
        return;
      }

      try {
        const data = await getMoodsForUser(name);
        if (!cancelled) {
          setMoods(data);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'failed to load moods');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMoods();

    return () => {
      cancelled = true;
    };
  }, [name]);

  if (loading) {
    return <p className="text-[11px] text-[var(--text)]">loading...</p>;
  }

  if (!name) {
    return <p className="text-[11px] text-[var(--text)]">please pick a user first</p>;
  }

  if (error) {
    return <p className="text-[11px] text-[var(--text)]">{error}</p>;
  }

  const heatmapEntries = moods.map((m) => ({ date: m.date, score: m.score }));
  const gratitudeTexts = moods.map((m) => m.gratitude).filter(Boolean) as string[];
  const rantTexts = moods.map((m) => m.rant).filter(Boolean) as string[];

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[11px] font-bold text-[var(--text)] mb-1">{name}'s mood heatmap</p>
        <Heatmap entries={heatmapEntries} />
      </div>
      {gratitudeTexts.length > 0 && (
        <div>
          <p className="text-[11px] font-bold text-[var(--text)] mb-1">{name}'s gratitudes</p>
          <ul className="space-y-1">
            {gratitudeTexts.map((text, i) => (
              <li key={i} className="text-[11px] text-[var(--text)] whitespace-pre-wrap">"{text}"</li>
            ))}
          </ul>
        </div>
      )}
      {rantTexts.length > 0 && (
        <div>
          <p className="text-[11px] font-bold text-[var(--text)] mb-1">{name}'s rants</p>
          <ul className="space-y-1">
            {rantTexts.map((text, i) => (
              <li key={i} className="text-[11px] text-[var(--text)] whitespace-pre-wrap">"{text}"</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
