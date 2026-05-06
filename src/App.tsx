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
  const today = new Date().toISOString().slice(0, 10);
  if (storedDate !== today) {
    localStorage.removeItem('shm-user');
    localStorage.removeItem('shm-user-date');
    return null;
  }
  return localStorage.getItem('shm-user');
}

export default function App() {
  useSessionTheme();
  const [userName, setUserName] = useState<string | null>(getStoredUser);
  const isMobile = useIsMobile();

  function handlePick(name: string) {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem('shm-user', name);
    localStorage.setItem('shm-user-date', today);
    setUserName(name);
  }

  function handleSwitchUser() {
    localStorage.removeItem('shm-user');
    localStorage.removeItem('shm-user-date');
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
