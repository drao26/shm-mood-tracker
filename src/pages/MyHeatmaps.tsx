import { useEffect, useState } from 'react';
import Heatmap from '../components/Heatmap';
import ThemeChips from '../components/ThemeChips';
import TopMoments from '../components/TopMoments';
import { getMoodsForUser, isSupabaseConfigured, MoodEntry } from '../lib/supabase';
import { extractThemes } from '../lib/themes';

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

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[11px] font-bold text-[var(--text)] mb-1">{name}'s mood heatmap</p>
        <Heatmap entries={heatmapEntries} />
      </div>
      <div>
        <p className="text-[11px] font-bold text-[var(--text)] mb-1">{name}'s themes</p>
        <ThemeChips themes={extractThemes(moods)} />
      </div>
      {moods.length >= 2 && (
        <div>
          <p className="text-[11px] font-bold text-[var(--text)] mb-1">{name}'s top moments</p>
          <TopMoments entries={moods} />
        </div>
      )}
    </div>
  );
}
