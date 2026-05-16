import { useState, useEffect } from 'react';
import Button95 from './Button95';
import StartMenu from './StartMenu';
import { DesktopWindow } from '../hooks/useDesktop';
import { getAllMoods, isSupabaseConfigured, MoodEntry } from '../lib/supabase';
import { currentStreak } from '../lib/streak';
import { getLocalDate } from '../lib/dateUtils';

interface TaskbarProps {
  windows: DesktopWindow[];
  activeId: string | null;
  onTaskClick: (id: string) => void;
  userName: string | null;
  onSwitchUser: () => void;
}

const FRIENDS = ['april', 'angie', 'deepthi'] as const;
type Friend = (typeof FRIENDS)[number];

function FriendStreaks() {
  const [streaks, setStreaks] = useState<Record<Friend, number>>({ april: 0, angie: 0, deepthi: 0 });

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    async function load() {
      try {
        const moods = await getAllMoods();
        if (cancelled) return;
        const today = getLocalDate();
        const next: Record<Friend, number> = { april: 0, angie: 0, deepthi: 0 };
        for (const friend of FRIENDS) {
          const dates = moods
            .filter((m: MoodEntry) => m.name === friend)
            .map((m: MoodEntry) => m.date);
          next[friend] = currentStreak(dates, today);
        }
        setStreaks(next);
      } catch {
        // silently ignore — scoreboard is best-effort
      }
    }

    load();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') load();
    };
    document.addEventListener('visibilitychange', onVisibility);
    // refresh periodically in case a friend logs while window stays open
    const id = setInterval(load, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      clearInterval(id);
    };
  }, []);

  return (
    <div className="border border95-inset flex items-center h-[22px] px-1 gap-2">
      {FRIENDS.map((friend) => (
        <span
          key={friend}
          className="text-[11px] text-[var(--text)] flex items-center gap-[2px]"
          title={`${friend}'s current check-in streak: ${streaks[friend]} day${streaks[friend] === 1 ? '' : 's'}`}
        >
          <span className="capitalize">{friend[0]}</span>
          <span aria-hidden="true">🔥</span>
          <span>{streaks[friend]}</span>
        </span>
      ))}
    </div>
  );
}

function Clock() {
  const [time, setTime] = useState(formatTime());
  useEffect(() => {
    const id = setInterval(() => setTime(formatTime()), 10000);
    return () => clearInterval(id);
  }, []);
  return <span className="text-[11px] text-[var(--text)] px-2">{time}</span>;
}

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function Taskbar({ windows, activeId, onTaskClick, userName, onSwitchUser }: TaskbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="h-[30px] bg-[var(--chrome)] border-t-2 border-t-[var(--chrome-light)] flex items-center px-1 gap-1 shrink-0 relative">
      {/* start button */}
      <div className="relative">
        <Button95
          pressed={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
          className="font-bold flex items-center gap-1 h-[24px]"
        >
          <img src={`${import.meta.env.BASE_URL}images/pixel-heart-love-valentine-romance-romantic-wedding-game-interface-icon-symbol-cursor-arrow-sign-png.webp`} alt="" className="w-[14px] h-[14px] object-contain" />
          start
        </Button95>
        {menuOpen && (
          <StartMenu
            onClose={() => setMenuOpen(false)}
            onSwitchUser={() => { setMenuOpen(false); onSwitchUser(); }}
          />
        )}
      </div>

      {/* divider */}
      <div className="w-px h-[20px] border-l border-l-[var(--chrome-dark)] border-r border-r-[var(--chrome-light)]" />

      {/* window buttons */}
      <div className="flex-1 flex gap-[2px] overflow-hidden">
        {windows.map((w) => (
          <Button95
            key={w.id}
            pressed={w.id === activeId}
            onClick={() => onTaskClick(w.id)}
            className="max-w-[160px] truncate text-[11px] h-[22px]"
          >
            {w.title}
          </Button95>
        ))}
      </div>

      {/* friends' streaks scoreboard */}
      <FriendStreaks />

      {/* clock + user */}
      <div className="border border95-inset flex items-center h-[22px] px-1">
        <Clock />
        {userName && <span className="text-[11px] text-[var(--text)] border-l border-l-[var(--chrome-dark)] pl-1 ml-1">{userName}</span>}
      </div>
    </div>
  );
}
