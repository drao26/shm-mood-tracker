import { useEffect, useState } from 'react';
import Window from '../components/Window';
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
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-gray-400">loading...</p>
      </div>
    );
  }

  // compute average scores per date
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

  // individual entries per user
  const userEntries = (name: string) =>
    moods.filter((m) => m.name === name).map((m) => ({ date: m.date, score: m.score }));

  const allGratitude = moods.map((m) => m.gratitude).filter(Boolean) as string[];
  const allRants = moods.map((m) => m.rant).filter(Boolean) as string[];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="font-pixel text-sm text-center text-gray-700">
        swedish house mafia mood map
      </h1>

      {/* individual heatmaps */}
      {names.map((name, i) => (
        <Window key={name} title={`${name}'s moods`} colorIndex={i}>
          <Heatmap entries={userEntries(name)} />
        </Window>
      ))}

      {/* combined */}
      <Window title="us" colorIndex={3}>
        <Heatmap entries={combinedEntries} label="average of everyone's scores" />
      </Window>

      <Window title="our gratitude cloud" colorIndex={4}>
        <WordCloud texts={allGratitude} />
      </Window>

      <Window title="our rant cloud" colorIndex={5}>
        <WordCloud texts={allRants} />
      </Window>
    </div>
  );
}
