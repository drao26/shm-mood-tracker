import { useEffect, useState } from 'react';
import Trackbar from '../components/Trackbar';
import Textarea95 from '../components/Textarea95';
import Button95 from '../components/Button95';
import { getTodayMood, isSupabaseConfigured, upsertMood } from '../lib/supabase';
import { moodScale } from '../lib/palette';

export default function Today() {
  const name = localStorage.getItem('shm-user');
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const todayDisplay = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;

  const [score, setScore] = useState(5);
  const [gratitude, setGratitude] = useState('');
  const [rant, setRant] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTodayMood() {
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
        const existing = await getTodayMood(name, today);
        if (cancelled) return;
        if (existing) {
          setScore(existing.score);
          setGratitude(existing.gratitude ?? '');
          setRant(existing.rant ?? '');
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'failed to load today\'s mood');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTodayMood();

    return () => {
      cancelled = true;
    };
  }, [name, today]);

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
    return <p className="text-[11px] text-[var(--text)]">loading...</p>;
  }

  if (!name) {
    return <p className="text-[11px] text-[var(--text)]">please pick a user first</p>;
  }

  if (error) {
    return <p className="text-[11px] text-[var(--text)]">{error}</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-[var(--text)]">
        hey {name} · {todayDisplay}
      </p>

      <div>
        <label className="block text-[11px] text-[var(--text)] mb-1">
          how are you feeling today?
        </label>
        <Trackbar value={score} onChange={setScore} />
        <div className="flex items-center gap-1 mt-1">
          <span className="text-[9px] text-gray-400">0</span>
          {moodScale.map((color, i) => (
            <div
              key={i}
              className="w-[10px] h-[10px] rounded-sm"
              style={{ backgroundColor: color }}
            />
          ))}
          <span className="text-[9px] text-gray-400">10</span>
        </div>
      </div>

      <div>
        <label className="block text-[11px] text-[var(--text)] mb-1">
          what were you grateful for today?
        </label>
        <Textarea95
          value={gratitude}
          onChange={(e) => setGratitude(e.target.value)}
          placeholder="optional"
        />
      </div>

      <div>
        <label className="block text-[11px] text-[var(--text)] mb-1">
          anything you want to rant about today?
        </label>
        <Textarea95
          value={rant}
          onChange={(e) => setRant(e.target.value)}
          placeholder="optional"
        />
      </div>

      <div className="flex justify-end">
        {!saved ? (
          <Button95 onClick={handleSave} className="w-[75px]">save</Button95>
        ) : (
          <p className="text-[11px] text-[var(--text)]">logged for {todayDisplay} ✓</p>
        )}
      </div>
    </div>
  );
}
