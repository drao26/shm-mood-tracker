import { useState, useCallback, useEffect } from 'react';
import { WindowTone } from '../components/Window';

interface Point {
  x: number;
  y: number;
}

export interface DesktopWindow {
  id: string;
  title: string;
  tone: WindowTone;
  iconSrc?: string;
  minimised: boolean;
  maximised: boolean;
}

const CASCADE_OFFSET = 30;
const ICON_POSITIONS_KEY = 'shm-desktop-icon-positions';
const WINDOW_POSITIONS_KEY = 'shm-desktop-window-positions';

function readStoredPositions(storageKey: string): Record<string, Point> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};

    return Object.entries(parsed).reduce<Record<string, Point>>((acc, [id, value]) => {
      if (
        value &&
        typeof value === 'object' &&
        typeof (value as Point).x === 'number' &&
        typeof (value as Point).y === 'number'
      ) {
        acc[id] = { x: (value as Point).x, y: (value as Point).y };
      }
      return acc;
    }, {});
  } catch {
    return {};
  }
}

export function useDesktop() {
  const [windows, setWindows] = useState<DesktopWindow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [order, setOrder] = useState<string[]>([]); // z-order, last = top
  const [iconPositions, setIconPositions] = useState<Record<string, Point>>(() =>
    readStoredPositions(ICON_POSITIONS_KEY)
  );
  const [windowPositions, setWindowPositions] = useState<Record<string, Point>>(() =>
    readStoredPositions(WINDOW_POSITIONS_KEY)
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(ICON_POSITIONS_KEY, JSON.stringify(iconPositions));
    }, 150);
    return () => window.clearTimeout(timeout);
  }, [iconPositions]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(WINDOW_POSITIONS_KEY, JSON.stringify(windowPositions));
    }, 150);
    return () => window.clearTimeout(timeout);
  }, [windowPositions]);

  const open = useCallback((id: string, title: string, tone: WindowTone = 'mint', iconSrc?: string) => {
    setWindows((prev) => {
      const existing = prev.find((w) => w.id === id);
      if (existing) {
        // already open — just restore and focus
        return prev.map((w) => (w.id === id ? { ...w, minimised: false } : w));
      }
      return [...prev, { id, title, tone, iconSrc, minimised: false, maximised: false }];
    });
    setActiveId(id);
    setOrder((prev) => [...prev.filter((x) => x !== id), id]);
  }, []);

  const close = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
    setOrder((prev) => prev.filter((x) => x !== id));
    setActiveId((prev) => (prev === id ? null : prev));
  }, []);

  const minimise = useCallback((id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimised: true } : w)));
    setActiveId((prev) => (prev === id ? null : prev));
  }, []);

  const maximise = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, maximised: !w.maximised } : w))
    );
  }, []);

  const focus = useCallback((id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimised: false } : w)));
    setActiveId(id);
    setOrder((prev) => [...prev.filter((x) => x !== id), id]);
  }, []);

  const toggleMinimise = useCallback((id: string) => {
    setWindows((prev) => {
      const w = prev.find((x) => x.id === id);
      if (!w) return prev;
      if (w.minimised) {
        // restore
        setActiveId(id);
        setOrder((o) => [...o.filter((x) => x !== id), id]);
        return prev.map((x) => (x.id === id ? { ...x, minimised: false } : x));
      }
      // minimise if it's active, otherwise just focus it
      if (id === activeId) {
        setActiveId(null);
        return prev.map((x) => (x.id === id ? { ...x, minimised: true } : x));
      }
      setActiveId(id);
      setOrder((o) => [...o.filter((x) => x !== id), id]);
      return prev;
    });
  }, [activeId]);

  function getZIndex(id: string) {
    return order.indexOf(id) + 10;
  }

  function getCascadeOffset(id: string) {
    const idx = windows.findIndex((w) => w.id === id);
    return idx * CASCADE_OFFSET;
  }

  const setIconPosition = useCallback((id: string, position: Point) => {
    setIconPositions((prev) => ({ ...prev, [id]: position }));
  }, []);

  const setWindowPosition = useCallback((id: string, position: Point) => {
    setWindowPositions((prev) => ({ ...prev, [id]: position }));
  }, []);

  return {
    windows,
    activeId,
    iconPositions,
    windowPositions,
    open,
    close,
    minimise,
    maximise,
    focus,
    toggleMinimise,
    getZIndex,
    getCascadeOffset,
    setIconPosition,
    setWindowPosition,
  };
}
