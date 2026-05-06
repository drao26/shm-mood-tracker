import { useEffect, useState } from 'react';
import Heatmap from '../components/Heatmap';
import WordCloud from '../components/WordCloud';
import { getMoodsForUser, MoodEntry } from '../lib/supabase';

interface MyHeatmapsProps {
  overrideName?: string;
}

export default function MyHeatmaps({ overrideName }: MyHeatmapsProps) {
  const name = overrideName ?? localStorage.getItem('shm-user');
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!name) { setLoading(false); return; }
    getMoodsForUser(name).then((data) => {
      setMoods(data);
      setLoading(false);
    });
  }, [name]);

  if (loading) {
    return <p className="text-[11px] text-[var(--text)]">loading...</p>;
  }

  if (!name) {
    return <p className="text-[11px] text-[var(--text)]">please pick a user first</p>;
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
      <div>
        <p className="text-[11px] font-bold text-[var(--text)] mb-1">{name}'s gratitude cloud</p>
        <WordCloud texts={gratitudeTexts} />
      </div>
      <div>
        <p className="text-[11px] font-bold text-[var(--text)] mb-1">{name}'s rant cloud</p>
        <WordCloud texts={rantTexts} />
      </div>
    </div>
  );
}
