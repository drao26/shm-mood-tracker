import { useEffect, useState, useMemo } from 'react';
import { getMoodsForMonth, isSupabaseConfigured, MoodEntry } from '../lib/supabase';
import { getMoodColor, emptyColor } from '../lib/palette';
import Button95 from '../components/Button95';

const USERS = ['deepthi', 'april', 'angie'] as const;

export default function Calendar() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMonth() {
      if (!isSupabaseConfigured) {
        setError('supabase is not configured');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await getMoodsForMonth(year, month);
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

    loadMonth();
    return () => { cancelled = true; };
  }, [year, month]);

  // Build a lookup: date -> { user -> MoodEntry }
  const moodMap = useMemo(() => {
    const map = new Map<string, Map<string, MoodEntry>>();
    for (const m of moods) {
      if (!map.has(m.date)) map.set(m.date, new Map());
      map.get(m.date)!.set(m.name, m);
    }
    return map;
  }, [moods]);

  // Calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = (firstDay.getDay() + 6) % 7; // Monday=0
    const daysInMonth = lastDay.getDate();

    const cells: (number | null)[] = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [year, month]);

  const monthName = new Date(year, month).toLocaleString('en', { month: 'long' }).toLowerCase();

  function prevMonth() {
    setSelectedDate(null);
    setSelectedUser(null);
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else setMonth(month - 1);
  }

  function nextMonth() {
    setSelectedDate(null);
    setSelectedUser(null);
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else setMonth(month + 1);
  }

  function getDateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function getDayColor(day: number): string {
    const dateStr = getDateStr(day);
    const entries = moodMap.get(dateStr);
    if (!entries || entries.size === 0) return emptyColor;
    // Average score across all users who logged
    const scores = Array.from(entries.values()).map(e => e.score);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return getMoodColor(avg);
  }

  function hasEntryForDate(day: number): boolean {
    const dateStr = getDateStr(day);
    return moodMap.has(dateStr) && moodMap.get(dateStr)!.size > 0;
  }

  function handleDateClick(day: number) {
    const dateStr = getDateStr(day);
    if (!hasEntryForDate(day)) return;
    setSelectedDate(dateStr);
    setSelectedUser(null);
  }

  function handleUserClick(user: string) {
    if (!selectedDate) return;
    const entries = moodMap.get(selectedDate);
    if (!entries || !entries.has(user)) return;
    setSelectedUser(user);
  }

  function handleBack() {
    if (selectedUser) { setSelectedUser(null); }
    else if (selectedDate) { setSelectedDate(null); }
  }

  // Render mood entry detail
  function renderMoodDetail() {
    if (!selectedDate || !selectedUser) return null;
    const entries = moodMap.get(selectedDate);
    if (!entries) return null;
    const entry = entries.get(selectedUser);
    if (!entry) return null;

    const displayDate = `${selectedDate.slice(8, 10)}-${selectedDate.slice(5, 7)}-${selectedDate.slice(0, 4)}`;

    return (
      <div className="space-y-2">
        <button onClick={handleBack} className="text-[11px] text-[var(--accent)] hover:underline">← back</button>
        <p className="text-[12px] font-bold text-[var(--text)]">{selectedUser}'s entry — {displayDate}</p>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[var(--text)]">mood:</span>
          <span
            className="inline-block w-4 h-4 rounded"
            style={{ backgroundColor: getMoodColor(entry.score) }}
          />
          <span className="text-[11px] text-[var(--text)] font-bold">{entry.score}/10</span>
        </div>
        {entry.gratitude && (
          <div>
            <p className="text-[11px] font-bold text-[var(--text)]">grateful for:</p>
            <p className="text-[11px] text-[var(--text)] whitespace-pre-wrap">"{entry.gratitude}"</p>
          </div>
        )}
        {entry.rant && (
          <div>
            <p className="text-[11px] font-bold text-[var(--text)]">rant:</p>
            <p className="text-[11px] text-[var(--text)] whitespace-pre-wrap">"{entry.rant}"</p>
          </div>
        )}
      </div>
    );
  }

  // Render user selection
  function renderUserSelect() {
    if (!selectedDate) return null;
    const entries = moodMap.get(selectedDate);
    const displayDate = `${selectedDate.slice(8, 10)}-${selectedDate.slice(5, 7)}-${selectedDate.slice(0, 4)}`;

    return (
      <div className="space-y-2">
        <button onClick={handleBack} className="text-[11px] text-[var(--accent)] hover:underline">← back</button>
        <p className="text-[12px] font-bold text-[var(--text)]">{displayDate}</p>
        <p className="text-[11px] text-[var(--text)]">select a person:</p>
        <div className="flex flex-col gap-1">
          {USERS.map((user) => {
            const hasEntry = entries?.has(user);
            return (
              <button
                key={user}
                onClick={() => handleUserClick(user)}
                disabled={!hasEntry}
                className={`text-left px-2 py-1 text-[11px] border border-[var(--chrome-dark)] ${
                  hasEntry
                    ? 'bg-[var(--chrome)] hover:bg-[var(--accent-light)] hover:text-white cursor-pointer text-[var(--text)]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {user}{!hasEntry ? ' (no entry)' : ''}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="text-[11px] text-[var(--text)]">{error}</p>;
  }

  // Show detail view
  if (selectedUser && selectedDate) return renderMoodDetail();
  // Show user selection
  if (selectedDate) return renderUserSelect();

  // Main calendar view
  return (
    <div className="space-y-2">
      {/* header navigation */}
      <div className="flex items-center justify-between">
        <Button95 onClick={prevMonth} className="text-[11px] px-2">◀</Button95>
        <p className="text-[12px] font-bold text-[var(--text)]">{monthName} {year}</p>
        <Button95 onClick={nextMonth} className="text-[11px] px-2">▶</Button95>
      </div>

      {loading ? (
        <p className="text-[11px] text-[var(--text)]">loading...</p>
      ) : (
        <>
          {/* day headers */}
          <div className="grid grid-cols-7 gap-[2px]">
            {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((d) => (
              <div key={d} className="text-center text-[10px] text-gray-400 font-bold py-[2px]">{d}</div>
            ))}
          </div>

          {/* day cells */}
          <div className="grid grid-cols-7 gap-[2px]">
            {calendarDays.map((day, i) => {
              if (day === null) {
                return <div key={`empty-${i}`} className="aspect-square" />;
              }
              const hasEntry = hasEntryForDate(day);
              const color = getDayColor(day);
              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  disabled={!hasEntry}
                  className={`aspect-square rounded text-[10px] flex items-center justify-center border ${
                    hasEntry
                      ? 'border-[var(--chrome-dark)] cursor-pointer hover:opacity-80'
                      : 'border-transparent text-gray-400 cursor-not-allowed'
                  }`}
                  style={{ backgroundColor: hasEntry ? color : emptyColor }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* legend */}
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[9px] text-gray-400">low</span>
            <div className="flex gap-[1px]">
              {[0, 2, 4, 6, 8, 10].map((s) => (
                <div key={s} className="w-3 h-3 rounded-sm" style={{ backgroundColor: getMoodColor(s) }} />
              ))}
            </div>
            <span className="text-[9px] text-gray-400">high</span>
          </div>
        </>
      )}
    </div>
  );
}
