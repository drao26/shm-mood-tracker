import { useState, useEffect, useCallback } from 'react';
import Desktop, { MobileShell } from './components/Desktop';
import Home from './pages/Home';
import { getDailyPalette } from './lib/palette';
import { getLocalDate } from './lib/dateUtils';

const BOOT_SEEN_KEY = 'shm-boot-seen-v1';
const BOOT_DURATION_MS = 3400;

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return mobile;
}

function useSessionTheme() {
  useEffect(() => {
    const { bg, accent, accentLight } = getDailyPalette();
    const root = document.documentElement;
    root.style.setProperty('--desktop-bg', bg);
    root.style.setProperty('--accent', accent);
    root.style.setProperty('--accent-light', accentLight);
  }, []);
}

function getStoredUser(): string | null {
  const storedDate = localStorage.getItem('shm-user-date');
  const today = getLocalDate();
  if (storedDate !== today) {
    localStorage.removeItem('shm-user');
    localStorage.removeItem('shm-user-date');
    return null;
  }
  return localStorage.getItem('shm-user');
}

function shouldShowBoot(): boolean {
  try {
    return localStorage.getItem(BOOT_SEEN_KEY) !== '1';
  } catch {
    return false;
  }
}

function BootScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setProgress((prev) => Math.min(prev + 3, 100));
    }, 100);
    const doneTimer = window.setTimeout(onDone, BOOT_DURATION_MS);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(doneTimer);
    };
  }, [onDone]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' || event.key === 'Enter') {
        onDone();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onDone]);

  return (
    <div className="boot95-screen">
      <div className="boot95-frame" role="region" aria-label="Boot animation">
        <p>C:\\&gt; boot shm.exe /safe</p>
        <p className="mt-3">Starting Windows 95...</p>
        <p className="boot95-loading mt-2">Loading shm.exe</p>
        <div
          className="boot95-progress mt-3"
          role="progressbar"
          aria-label="Boot progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div className="boot95-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <button type="button" className="boot95-skip mt-3" onClick={onDone}>
          skip boot
        </button>
      </div>
    </div>
  );
}

export default function App() {
  useSessionTheme();
  const [showBoot, setShowBoot] = useState(shouldShowBoot);
  const [userName, setUserName] = useState<string | null>(getStoredUser);
  const isMobile = useIsMobile();
  const handleBootDone = useCallback(() => {
    try {
      localStorage.setItem(BOOT_SEEN_KEY, '1');
    } catch {}
    setShowBoot(false);
  }, []);

  function handlePick(name: string) {
    localStorage.setItem('shm-user', name);
    localStorage.setItem('shm-user-date', getLocalDate());
    setUserName(name);
  }

  function handleSwitchUser() {
    localStorage.removeItem('shm-user');
    localStorage.removeItem('shm-user-date');
    setUserName(null);
  }

  if (showBoot) {
    return <BootScreen onDone={handleBootDone} />;
  }

  if (!userName) {
    return <Home onPick={handlePick} />;
  }

  if (isMobile) {
    return <MobileShell userName={userName} onSwitchUser={handleSwitchUser} />;
  }

  return <Desktop userName={userName} onSwitchUser={handleSwitchUser} />;
}
