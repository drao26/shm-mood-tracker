import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Window from '../components/Window';
import Heatmap from '../components/Heatmap';
import WordCloud from '../components/WordCloud';
import { getMoodsForUser, MoodEntry } from '../lib/supabase';

export default function MyHeatmaps() {
  const navigate = useNavigate();
  const name = localStorage.getItem('shm-user');
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!name) {
      navigate('/');
      return;
    }
    getMoodsForUser(name).then((data) => {
      setMoods(data);
      setLoading(false);
    });
  }, [name, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-gray-400">loading...</p>
      </div>
    );
  }

  const heatmapEntries = moods.map((m) => ({ date: m.date, score: m.score }));
  const gratitudeTexts = moods.map((m) => m.gratitude).filter(Boolean) as string[];
  const rantTexts = moods.map((m) => m.rant).filter(Boolean) as string[];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <Window title={`${name}'s mood heatmap`} colorIndex={2}>
        <Heatmap entries={heatmapEntries} />
      </Window>

      <Window title={`${name}'s gratitude cloud`} colorIndex={3}>
        <WordCloud texts={gratitudeTexts} />
      </Window>

      <Window title={`${name}'s rant cloud`} colorIndex={4}>
        <WordCloud texts={rantTexts} />
      </Window>
    </div>
  );
}
