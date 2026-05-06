import { useEffect, useState } from 'react';
import Heatmap from '../components/Heatmap';
import WordCloud from '../components/WordCloud';
import { getAllMoods, MoodEntry } from '../lib/supabase';

const names = ['april', 'angie', 'deepthi'] as const;

export default function MoodMap() {
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllMoods().then((data) => {
      setMoods(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <p className="text-[11px] text-[var(--text)]">loading...</p>;
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

  const userEntries = (name: string) =>
    moods.filter((m) => m.name === name).map((m) => ({ date: m.date, score: m.score }));

  const allGratitude = moods.map((m) => m.gratitude).filter(Boolean) as string[];
  const allRants = moods.map((m) => m.rant).filter(Boolean) as string[];

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-bold text-[var(--text)]">swedish house mafia mood map</p>

      {names.map((name) => (
        <div key={name}>
          <p className="text-[11px] font-bold text-[var(--text)] mb-1">{name}'s moods</p>
          <Heatmap entries={userEntries(name)} />
        </div>
      ))}

      <div>
        <p className="text-[11px] font-bold text-[var(--text)] mb-1">us (average)</p>
        <Heatmap entries={combinedEntries} label="average of everyone's scores" />
      </div>

      <div>
        <p className="text-[11px] font-bold text-[var(--text)] mb-1">our gratitude cloud</p>
        <WordCloud texts={allGratitude} />
      </div>

      <div>
        <p className="text-[11px] font-bold text-[var(--text)] mb-1">our rant cloud</p>
        <WordCloud texts={allRants} />
      </div>
    </div>
  );
}
