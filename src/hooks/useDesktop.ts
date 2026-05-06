import { useState, useCallback } from 'react';
import { WindowTone } from '../components/Window';

export interface DesktopWindow {
  id: string;
  title: string;
  tone: WindowTone;
  minimised: boolean;
  maximised: boolean;
}

const CASCADE_OFFSET = 30;

export function useDesktop() {
  const [windows, setWindows] = useState<DesktopWindow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [order, setOrder] = useState<string[]>([]); // z-order, last = top

  const open = useCallback((id: string, title: string, tone: WindowTone = 'mint') => {
    setWindows((prev) => {
      const existing = prev.find((w) => w.id === id);
      if (existing) {
        // already open — just restore and focus
        return prev.map((w) => (w.id === id ? { ...w, minimised: false } : w));
      }
      return [...prev, { id, title, tone, minimised: false, maximised: false }];
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

  return {
    windows,
    activeId,
    open,
    close,
    minimise,
    maximise,
    focus,
    toggleMinimise,
    getZIndex,
    getCascadeOffset,
  };
}
