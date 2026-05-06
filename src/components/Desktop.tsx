import { useState, useEffect } from 'react';
import DesktopIcon from './DesktopIcon';
import Taskbar from './Taskbar';
import Window, { WindowTone } from './Window';
import { useDesktop } from '../hooks/useDesktop';
import Today from '../pages/Today';
import MyHeatmaps from '../pages/MyHeatmaps';
import MoodMap from '../pages/MoodMap';

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
  { id: 'today', label: 'today', iconSrc: `${base}images/source.gif`, tone: 'mint', title: "today's check-in" },
  { id: 'april', label: 'april', iconSrc: `${base}images/pompompurin-sanrio.gif`, tone: 'lavender', title: "april's profile" },
  { id: 'angie', label: 'angie', iconSrc: `${base}images/200.gif`, tone: 'lavender', title: "angie's profile" },
  { id: 'deepthi', label: 'deepthi', iconSrc: `${base}images/deq6tia-a79fea75-f6a5-43d7-a783-c8fb175f7922.gif`, tone: 'lavender', title: "deepthi's profile" },
  { id: 'moodmap', label: 'mood map', iconSrc: `${base}images/star.gif`, tone: 'peach', title: 'swedish house mafia mood map' },
];

function WindowContent({ id }: { id: string; userName: string | null }) {
  switch (id) {
    case 'today':
      return <Today />;
    case 'april':
      return <MyHeatmaps overrideName="april" />;
    case 'angie':
      return <MyHeatmaps overrideName="angie" />;
    case 'deepthi':
      return <MyHeatmaps overrideName="deepthi" />;
    case 'moodmap':
      return <MoodMap />;
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

  // Auto-open today's check-in on first load
  useEffect(() => {
    desktop.open('today', "today's check-in", 'mint');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleIconOpen(icon: IconDef) {
    desktop.open(icon.id, icon.title, icon.tone);
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[var(--desktop-bg)]">
      {/* desktop area */}
      <div
        className="flex-1 relative overflow-hidden"
        onClick={() => setSelectedIcon(null)}
      >
        {/* icon column */}
        <div className="absolute top-4 left-4 flex flex-col gap-4 z-[1]">
          {icons.map((icon) => (
            <DesktopIcon
              key={icon.id}
              label={icon.label}
              iconSrc={icon.iconSrc}
              selected={selectedIcon === icon.id}
              onSelect={() => setSelectedIcon(icon.id)}
              onOpen={() => handleIconOpen(icon)}
            />
          ))}
        </div>

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
              active={w.id === desktop.activeId}
              maximised={w.maximised}
              draggable
              resizable
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
export function MobileShell({ onSwitchUser }: DesktopProps) {
  const tabs = ['today', 'april', 'angie', 'deepthi', 'mood map'] as const;
  const [active, setActive] = useState<string>('today');

  const toneMap: Record<string, WindowTone> = {
    today: 'mint',
    april: 'lavender',
    angie: 'lavender',
    deepthi: 'lavender',
    'mood map': 'peach',
  };

  const titleMap: Record<string, string> = {
    today: "today's check-in",
    april: "april's profile",
    angie: "angie's profile",
    deepthi: "deepthi's profile",
    'mood map': 'mood map',
  };

  const iconMap: Record<string, string> = {
    today: `${base}images/source.gif`,
    april: `${base}images/pompompurin-sanrio.gif`,
    angie: `${base}images/200.gif`,
    deepthi: `${base}images/deq6tia-a79fea75-f6a5-43d7-a783-c8fb175f7922.gif`,
    'mood map': `${base}images/star.gif`,
  };

  function renderContent() {
    switch (active) {
      case 'today': return <Today />;
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
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={`px-3 py-[6px] text-[11px] whitespace-nowrap border-r border-r-[var(--chrome-dark)] flex items-center gap-1 ${
              active === t ? 'bg-white font-bold' : 'text-[var(--text)]'
            }`}
          >
            <img src={iconMap[t]} alt="" className="w-[16px] h-[16px] object-contain" />
            {t}
          </button>
        ))}
        <button
          onClick={onSwitchUser}
          className="px-3 py-[6px] text-[11px] whitespace-nowrap text-[var(--text)] ml-auto"
        >
          switch
        </button>
      </div>
      {/* window */}
      <div className="flex-1 overflow-auto p-2">
        <Window title={titleMap[active]} tone={toneMap[active]} onClose={() => setActive('today')}>
          {renderContent()}
        </Window>
      </div>
    </div>
  );
}
