import { useState, useEffect } from 'react';
import Desktop, { MobileShell } from './components/Desktop';
import Home from './pages/Home';
import { getDailyPalette } from './lib/palette';

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return mobile;
}

function useDailyTheme() {
  useEffect(() => {
    const { bg, accent, accentLight } = getDailyPalette();
    const root = document.documentElement;
    root.style.setProperty('--desktop-bg', bg);
    root.style.setProperty('--accent', accent);
    root.style.setProperty('--accent-light', accentLight);
  }, []);
}

export default function App() {
  useDailyTheme();
  const [userName, setUserName] = useState<string | null>(
    localStorage.getItem('shm-user')
  );
  const isMobile = useIsMobile();

  function handlePick(name: string) {
    localStorage.setItem('shm-user', name);
    setUserName(name);
  }

  function handleSwitchUser() {
    localStorage.removeItem('shm-user');
    setUserName(null);
  }

  if (!userName) {
    return <Home onPick={handlePick} />;
  }

  if (isMobile) {
    return <MobileShell userName={userName} onSwitchUser={handleSwitchUser} />;
  }

  return <Desktop userName={userName} onSwitchUser={handleSwitchUser} />;
}
