import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Window from '../components/Window';
import MoodSlider from '../components/MoodSlider';
import { getTodayMood, upsertMood } from '../lib/supabase';

export default function Today() {
  const navigate = useNavigate();
  const name = localStorage.getItem('shm-user');
  const today = new Date().toISOString().slice(0, 10);

  const [score, setScore] = useState(5);
  const [gratitude, setGratitude] = useState('');
  const [rant, setRant] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!name) {
      navigate('/');
      return;
    }
    getTodayMood(name, today).then((existing) => {
      if (existing) {
        setScore(existing.score);
        setGratitude(existing.gratitude ?? '');
        setRant(existing.rant ?? '');
      }
      setLoading(false);
    });
  }, [name, today, navigate]);

  async function handleSave() {
    if (!name) return;
    await upsertMood({
      name,
      date: today,
      score,
      gratitude: gratitude.trim() || null,
      rant: rant.trim() || null,
    });
    setSaved(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-gray-400">loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      <Window title="today's check-in" colorIndex={1}>
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-500">
              hey {name} · {today}
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              how are you feeling today?
            </label>
            <MoodSlider value={score} onChange={setScore} />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              what were you grateful for today?
            </label>
            <textarea
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 text-sm resize-y min-h-[80px] focus:outline-none focus:ring-1 focus:ring-gray-400"
              placeholder="optional"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              anything you want to rant about today?
            </label>
            <textarea
              value={rant}
              onChange={(e) => setRant(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 text-sm resize-y min-h-[80px] focus:outline-none focus:ring-1 focus:ring-gray-400"
              placeholder="optional"
            />
          </div>

          {!saved ? (
            <button
              onClick={handleSave}
              className="w-full px-4 py-2 border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080] bg-[#c0c0c0] hover:bg-[#d0d0d0] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white font-pixel text-xs"
            >
              save
            </button>
          ) : (
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                logged for {today} ✓
              </p>
              <Link
                to="/my-heatmaps"
                className="text-sm text-blue-500 hover:text-blue-700 underline"
              >
                view your heatmaps →
              </Link>
            </div>
          )}
        </div>
      </Window>
    </div>
  );
}
