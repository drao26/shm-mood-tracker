import { useCallback, useEffect, useState } from 'react';
import Trackbar from '../components/Trackbar';
import Textarea95 from '../components/Textarea95';
import Button95 from '../components/Button95';
import Bsod, { BSOD_PROBABILITY } from '../components/Bsod';
import { getTodayMood, isSupabaseConfigured, upsertMood } from '../lib/supabase';
import { moodScale } from '../lib/palette';
import { getLocalDate, getLocalDisplayDate, formatDisplayDate } from '../lib/dateUtils';

const OFFLINE_SAVE_QUEUE_KEY = 'shm-offline-mood-save-queue';
type MoodSavePayload = Parameters<typeof upsertMood>[0];

function readOfflineSaveQueue(): MoodSavePayload[] {
  try {
    const raw = localStorage.getItem(OFFLINE_SAVE_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as MoodSavePayload[];
  } catch {
    return [];
  }
}

function writeOfflineSaveQueue(queue: MoodSavePayload[]) {
  if (queue.length === 0) {
    localStorage.removeItem(OFFLINE_SAVE_QUEUE_KEY);
    return;
  }
  localStorage.setItem(OFFLINE_SAVE_QUEUE_KEY, JSON.stringify(queue));
}

function queueOfflineSave(entry: MoodSavePayload) {
  const queue = readOfflineSaveQueue().filter(
    (queued) => !(queued.name === entry.name && queued.date === entry.date),
  );
  queue.push(entry);
  writeOfflineSaveQueue(queue);
}

async function flushOfflineSaveQueue() {
  const queue = readOfflineSaveQueue();
  if (queue.length === 0) return;

  const remaining: MoodSavePayload[] = [];
  for (const entry of queue) {
    try {
      await upsertMood(entry);
    } catch {
      remaining.push(entry);
    }
  }
  writeOfflineSaveQueue(remaining);
}

export default function Today() {
  const name = localStorage.getItem('shm-user');
  const today = getLocalDate();

  const [selectedDate, setSelectedDate] = useState(today);
  const [score, setScore] = useState(5);
  const [gratitude, setGratitude] = useState('');
  const [rant, setRant] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [existingEntry, setExistingEntry] = useState(false);
  const [showBsod, setShowBsod] = useState(false);

  const isToday = selectedDate === today;
  const displayDate = isToday ? getLocalDisplayDate() : formatDisplayDate(selectedDate);
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

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const handleOnline = () => {
      void flushOfflineSaveQueue();
    };

    if (navigator.onLine) {
      void flushOfflineSaveQueue();
    }

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSelectedDate(e.target.value);
  }

  async function handleSave() {
    if (!name || isLocked) return;
    const entry: MoodSavePayload = {
      name,
      date: selectedDate,
      score,
      gratitude: gratitude.trim() || null,
      rant: rant.trim() || null,
    };

    setExistingEntry(true);
    if (Math.random() < BSOD_PROBABILITY) {
      setShowBsod(true);
    } else {
      setSaved(true);
    }

    try {
      await upsertMood(entry);
    } catch {
      queueOfflineSave(entry);
    }
  }

  const handleBsodDismiss = useCallback(() => {
    setShowBsod(false);
    setSaved(true);
  }, []);

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
    <>
      {showBsod && <Bsod onDismiss={handleBsodDismiss} />}
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
          className="border-2 border95-inset bg-white text-[11px] px-1 py-[2px] outline-none"
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
    </>
  );
}
