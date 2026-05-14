import { useState, useEffect } from 'react';
import Button95 from './Button95';
import StartMenu from './StartMenu';
import { DesktopWindow } from '../hooks/useDesktop';

interface TaskbarProps {
  windows: DesktopWindow[];
  activeId: string | null;
  onTaskClick: (id: string) => void;
  userName: string | null;
  onSwitchUser: () => void;
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

      {/* clock + user */}
      <div className="border border95-inset flex items-center h-[22px] px-1">
        <Clock />
        {userName && <span className="text-[11px] text-[var(--text)] border-l border-l-[var(--chrome-dark)] pl-1 ml-1">{userName}</span>}
      </div>
    </div>
  );
}
