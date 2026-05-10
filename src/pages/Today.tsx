import { useEffect, useState } from 'react';
import Trackbar from '../components/Trackbar';
import Textarea95 from '../components/Textarea95';
import Button95 from '../components/Button95';
import { getTodayMood, isSupabaseConfigured, upsertMood } from '../lib/supabase';
import { moodScale } from '../lib/palette';
import { getAESTDate, getAESTDisplayDate, formatDisplayDate } from '../lib/dateUtils';

export default function Today() {
  const name = localStorage.getItem('shm-user');
  const today = getAESTDate();

  const [selectedDate, setSelectedDate] = useState(today);
  const [score, setScore] = useState(5);
  const [gratitude, setGratitude] = useState('');
  const [rant, setRant] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [existingEntry, setExistingEntry] = useState(false);

  const isToday = selectedDate === today;
  const displayDate = isToday ? getAESTDisplayDate() : formatDisplayDate(selectedDate);
  // Past entries that already exist cannot be overwritten
  const isLocked = !isToday && existingEntry;

  useEffect(() => {
    let cancelled = false;

    async function loadMood() {
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
        const existing = await getTodayMood(name, selectedDate);
        if (cancelled) return;
        if (existing) {
          setScore(existing.score);
          setGratitude(existing.gratitude ?? '');
          setRant(existing.rant ?? '');
          setExistingEntry(true);
        } else {
          setScore(5);
          setGratitude('');
          setRant('');
          setExistingEntry(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'failed to load mood');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    setLoading(true);
    setSaved(false);
    setError(null);
    loadMood();

    return () => {
      cancelled = true;
    };
  }, [name, selectedDate]);

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSelectedDate(e.target.value);
  }

  async function handleSave() {
    if (!name || isLocked) return;
    await upsertMood({
      name,
      date: selectedDate,
      score,
      gratitude: gratitude.trim() || null,
      rant: rant.trim() || null,
    });
    setSaved(true);
    setExistingEntry(true);
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
        hey {name} · {displayDate}
      </p>

      <div>
        <label className="block text-[11px] text-[var(--text)] mb-1">
          date:
        </label>
        <input
          type="date"
          value={selectedDate}
          max={today}
          onChange={handleDateChange}
          className="border-2 border-t-[var(--chrome-dark)] border-l-[var(--chrome-dark)] border-b-[var(--chrome-light)] border-r-[var(--chrome-light)] bg-white text-[11px] px-1 py-[2px] outline-none"
          style={{ fontFamily: 'inherit' }}
        />
      </div>

      {isLocked && (
        <p className="text-[11px] text-[var(--accent)]">
          entry already exists for {displayDate} — previous entries can't be overwritten
        </p>
      )}

      <div>
        <label className="block text-[11px] text-[var(--text)] mb-1">
          how are you feeling{isToday ? ' today' : ''}?
        </label>
        <Trackbar value={score} onChange={isLocked ? () => {} : setScore} />
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
          what were you grateful for{isToday ? ' today' : ''}?
        </label>
        <Textarea95
          value={gratitude}
          onChange={(e) => setGratitude(e.target.value)}
          placeholder="optional"
          disabled={isLocked}
        />
      </div>

      <div>
        <label className="block text-[11px] text-[var(--text)] mb-1">
          anything you want to rant about{isToday ? ' today' : ''}?
        </label>
        <Textarea95
          value={rant}
          onChange={(e) => setRant(e.target.value)}
          placeholder="optional"
          disabled={isLocked}
        />
      </div>

      <div className="flex justify-end">
        {isLocked ? (
          <p className="text-[11px] text-[var(--text)]">logged for {displayDate} ✓</p>
        ) : !saved ? (
          <Button95 onClick={handleSave} className="w-[75px]">save</Button95>
        ) : (
          <p className="text-[11px] text-[var(--text)]">logged for {displayDate} ✓</p>
        )}
      </div>
    </div>
  );
}
