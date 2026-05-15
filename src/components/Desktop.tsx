import { useState, useEffect, useCallback, useRef } from 'react';
import DesktopIcon from './DesktopIcon';
import Taskbar from './Taskbar';
import Window, { WindowTone } from './Window';
import MoodMascot from './MoodMascot';
import { useDesktop } from '../hooks/useDesktop';
import { useNudge } from '../hooks/useNudge';
import Today from '../pages/Today';
import MyHeatmaps from '../pages/MyHeatmaps';
import MoodMap from '../pages/MoodMap';
import Calendar from '../pages/Calendar';
import Minesweeper from '../pages/Minesweeper';

interface DesktopProps {
  userName: string | null;
  onSwitchUser: () => void;
}

interface IconDef {
  id: string;
  label: string;
  iconSrc: string;
  tone: WindowTone;
  title: string;
}

const base = import.meta.env.BASE_URL;

const icons: IconDef[] = [
  { id: 'today', label: 'today', iconSrc: `${base}images/mail.png`, tone: 'mint', title: "today's check-in" },
  { id: 'calendar', label: 'calendar', iconSrc: 'https://cdn.pixabay.com/photo/2023/06/22/09/19/calendar-8081009_960_720.png', tone: 'butter', title: 'mood calendar' },
  { id: 'april', label: 'april', iconSrc: `${base}images/pompompurin-sanrio.gif`, tone: 'lavender', title: "april's profile" },
  { id: 'angie', label: 'angie', iconSrc: `${base}images/200.gif`, tone: 'lavender', title: "angie's profile" },
  { id: 'deepthi', label: 'deepthi', iconSrc: `${base}images/deq6tia-a79fea75-f6a5-43d7-a783-c8fb175f7922.gif`, tone: 'lavender', title: "deepthi's profile" },
  { id: 'moodmap', label: 'mood map', iconSrc: `${base}images/star.gif`, tone: 'peach', title: 'swedish house mafia mood map' },
  { id: 'minesweeper', label: 'minesweeper', iconSrc: `${base}images/minesweeper-icon.svg`, tone: 'butter', title: 'minesweeper' },
];

function WindowContent({ id, userName }: { id: string; userName: string | null }) {
  switch (id) {
    case 'welcome':
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-8">
          <img src={`${base}images/sun.png`} alt="" className="w-12 h-12" />
          <p className="text-[13px] text-[var(--text)] font-bold">hi {userName}!</p>
          <p className="text-[11px] text-[var(--text)]">ready to check in today?</p>
        </div>
      );
    case 'today':
      return <Today />;
    case 'calendar':
      return <Calendar />;
    case 'april':
      return <MyHeatmaps overrideName="april" />;
    case 'angie':
      return <MyHeatmaps overrideName="angie" />;
    case 'deepthi':
      return <MyHeatmaps overrideName="deepthi" />;
    case 'moodmap':
      return <MoodMap />;
    case 'minesweeper':
      return <Minesweeper />;
    case 'settings':
      return (
        <div className="text-[12px] text-[var(--text)] p-2">
          <p className="font-bold mb-2">about</p>
          <p>made with love for three friends</p>
        </div>
      );
    default:
      return null;
  }
}

export default function Desktop({ userName, onSwitchUser }: DesktopProps) {
  const desktop = useDesktop();
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const shouldNudge = useNudge(userName);
  const desktopAreaRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{
    iconId: string;
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  // Show welcome window first, then auto-open today after 2s
  useEffect(() => {
    desktop.open('welcome', `welcome, ${userName}`, 'pink', `${base}images/sun.png`);
    const timer = setTimeout(() => {
      desktop.close('welcome');
      const todayIcon = icons.find((i) => i.id === 'today')!;
      desktop.open('today', todayIcon.title, todayIcon.tone, todayIcon.iconSrc);
    }, 2000);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleIconOpen(icon: IconDef) {
    desktop.open(icon.id, icon.title, icon.tone, icon.iconSrc);
  }

  function getDefaultIconPosition(index: number) {
    return { x: 16, y: 16 + index * 88 };
  }

  const handleIconPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>, iconId: string, index: number) => {
    const area = desktopAreaRef.current;
    if (!area) return;
    const current = desktop.iconPositions[iconId] ?? getDefaultIconPosition(index);
    dragStateRef.current = {
      iconId,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: current.x,
      originY: current.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    setSelectedIcon(iconId);
    e.stopPropagation();
  }, [desktop.iconPositions]);

  const handleIconPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    const area = desktopAreaRef.current;
    if (!dragState || !area || dragState.pointerId !== e.pointerId) return;

    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    const maxX = Math.max(0, area.clientWidth - 68);
    const maxY = Math.max(0, area.clientHeight - 88);
    const x = Math.max(0, Math.min(maxX, dragState.originX + dx));
    const y = Math.max(0, Math.min(maxY, dragState.originY + dy));
    desktop.setIconPosition(dragState.iconId, { x, y });
  }, [desktop]);

  const handleIconPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current?.pointerId === e.pointerId) {
      dragStateRef.current = null;
    }
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[var(--desktop-bg)]">
      {/* desktop area */}
      <div
        ref={desktopAreaRef}
        className="flex-1 relative overflow-hidden"
        onClick={() => setSelectedIcon(null)}
      >
        {/* draggable icons */}
        {icons.map((icon, index) => {
          const position = desktop.iconPositions[icon.id] ?? getDefaultIconPosition(index);
          return (
            <div
              key={icon.id}
              className="absolute z-[1]"
              style={{ left: position.x, top: position.y }}
              onPointerDown={(e) => handleIconPointerDown(e, icon.id, index)}
              onPointerMove={handleIconPointerMove}
              onPointerUp={handleIconPointerUp}
              onClick={(e) => e.stopPropagation()}
            >
              <DesktopIcon
                label={icon.label}
                iconSrc={icon.iconSrc}
                selected={selectedIcon === icon.id}
                nudge={icon.id === 'today' && shouldNudge}
                onSelect={() => setSelectedIcon(icon.id)}
                onOpen={() => handleIconOpen(icon)}
              />
            </div>
          );
        })}

        {/* windows */}
        {desktop.windows.map((w) => {
          if (w.minimised) return null;
          const offset = desktop.getCascadeOffset(w.id);
          return (
            <Window
              key={w.id}
              id={w.id}
              title={w.title}
              tone={w.tone}
              icon={w.iconSrc}
              active={w.id === desktop.activeId}
              maximised={w.maximised}
              draggable
              resizable
              initialPosition={desktop.windowPositions[w.id]}
              onPositionChange={(position) => desktop.setWindowPosition(w.id, position)}
              onClose={() => desktop.close(w.id)}
              onMinimise={() => desktop.minimise(w.id)}
              onMaximise={() => desktop.maximise(w.id)}
              onFocus={() => desktop.focus(w.id)}
              style={{
                position: 'absolute',
                top: `calc(50% - 200px + ${offset}px)`,
                left: `calc(50% - 220px + ${offset}px)`,
                width: w.maximised ? '100%' : '460px',
                maxHeight: w.maximised ? '100%' : '80vh',
                zIndex: desktop.getZIndex(w.id),
              }}
            >
              <WindowContent id={w.id} userName={userName} />
            </Window>
          );
        })}

        <MoodMascot />
      </div>

      {/* taskbar */}
      <Taskbar
        windows={desktop.windows}
        activeId={desktop.activeId}
        onTaskClick={desktop.toggleMinimise}
        userName={userName}
        onSwitchUser={onSwitchUser}
      />
    </div>
  );
}

/* Mobile shell — shown below md breakpoint */
export function MobileShell({ userName, onSwitchUser }: DesktopProps) {
  const tabs = ['home', 'today', 'calendar', 'april', 'angie', 'deepthi', 'mood map'] as const;
  const [active, setActive] = useState<string>('home');
  const shouldNudge = useNudge(userName);

  const goToToday = useCallback(() => setActive('today'), []);

  // Auto-navigate from landing page to today
  useEffect(() => {
    if (active !== 'home') return;
    const timer = setTimeout(goToToday, 2000);
    return () => clearTimeout(timer);
  }, [active, goToToday]);

  const toneMap: Record<string, WindowTone> = {
    home: 'pink',
    today: 'mint',
    calendar: 'butter',
    april: 'lavender',
    angie: 'lavender',
    deepthi: 'lavender',
    'mood map': 'peach',
  };

  const titleMap: Record<string, string> = {
    home: `welcome, ${userName}`,
    today: "today's check-in",
    calendar: 'mood calendar',
    april: "april's profile",
    angie: "angie's profile",
    deepthi: "deepthi's profile",
    'mood map': 'mood map',
  };

  const iconMap: Record<string, string> = {
    home: `${base}images/sun.png`,
    today: `${base}images/mail.png`,
    calendar: 'https://cdn.pixabay.com/photo/2023/06/22/09/19/calendar-8081009_960_720.png',
    april: `${base}images/pompompurin-sanrio.gif`,
    angie: `${base}images/200.gif`,
    deepthi: `${base}images/deq6tia-a79fea75-f6a5-43d7-a783-c8fb175f7922.gif`,
    'mood map': `${base}images/star.gif`,
  };

  function renderContent() {
    switch (active) {
      case 'home': return (
        <div className="flex flex-col items-center justify-center gap-3 py-8">
          <img src={`${base}images/sun.png`} alt="" className="w-12 h-12" />
          <p className="text-[13px] text-[var(--text)] font-bold">hi {userName}!</p>
          <p className="text-[11px] text-[var(--text)]">ready to check in today?</p>
          <button
            onClick={goToToday}
            className="mt-2 px-4 py-1 text-[11px] bg-[var(--chrome)] border-2 border-[var(--chrome-dark)] active:border-inset"
          >
            let's go
          </button>
        </div>
      );
      case 'today': return <Today />;
      case 'calendar': return <Calendar />;
      case 'april': return <MyHeatmaps overrideName="april" />;
      case 'angie': return <MyHeatmaps overrideName="angie" />;
      case 'deepthi': return <MyHeatmaps overrideName="deepthi" />;
      case 'mood map': return <MoodMap />;
      default: return null;
    }
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[var(--desktop-bg)]">
      {/* tab bar */}
      <div className="flex bg-[var(--chrome)] border-b-2 border-b-[var(--chrome-dark)] overflow-x-auto shrink-0">
        {tabs.map((t) => {
          const isNudgeTab = t === 'today' && shouldNudge;
          return (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={`px-1 py-1 text-[9px] whitespace-nowrap border-r border-r-[var(--chrome-dark)] flex items-center gap-[2px] relative ${
                active === t ? 'bg-white font-bold' : 'text-[var(--text)]'
              }`}
            >
              <img
                src={iconMap[t]}
                alt=""
                className={`w-[12px] h-[12px] object-contain${isNudgeTab ? ' nudge-icon' : ''}`}
              />
              {t}
              {isNudgeTab && (
                <span className="absolute top-0 right-0 w-[6px] h-[6px] rounded-full bg-[var(--title-active)] border border-white" />
              )}
            </button>
          );
        })}
        <button
          onClick={onSwitchUser}
          className="px-1 py-1 text-[9px] whitespace-nowrap text-[var(--text)] ml-auto"
        >
          switch
        </button>
      </div>
      {/* window */}
      <div className="flex-1 overflow-auto p-2">
        <Window title={titleMap[active]} tone={toneMap[active]} icon={iconMap[active]} onClose={goToToday}>
          {renderContent()}
        </Window>
      </div>
    </div>
  );
}
