import { useEffect, useState } from 'react';
import Trackbar from '../components/Trackbar';
import Textarea95 from '../components/Textarea95';
import Button95 from '../components/Button95';
import { getTodayMood, upsertMood } from '../lib/supabase';

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

  useEffect(() => {
    if (!name) { setLoading(false); return; }
    getTodayMood(name, today).then((existing) => {
      if (existing) {
        setScore(existing.score);
        setGratitude(existing.gratitude ?? '');
        setRant(existing.rant ?? '');
      }
      setLoading(false);
    });
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
