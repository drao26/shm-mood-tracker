import React, { useRef, useState, useCallback } from 'react';

export type WindowTone = 'mint' | 'lavender' | 'peach' | 'butter' | 'pink';

const toneGradients: Record<WindowTone, [string, string]> = {
  mint: ['#d4899e', '#e8a8b8'],
  lavender: ['#c0b8e8', '#e0d8f5'],
  peach: ['#f0c8a8', '#f8e8d8'],
  butter: ['#e8e0a0', '#f5f0d0'],
  pink: ['#c47090', '#d4899e'],
};

interface WindowProps {
  id?: string;
  title: string;
  tone?: WindowTone;
  active?: boolean;
  maximised?: boolean;
  children: React.ReactNode;
  onClose?: () => void;
  onMinimise?: () => void;
  onMaximise?: () => void;
  onFocus?: () => void;
  draggable?: boolean;
  style?: React.CSSProperties;
}

export default function Window({
  title,
  tone = 'mint',
  active = true,
  maximised = false,
  children,
  onClose,
  onMinimise,
  onMaximise,
  onFocus,
  draggable = false,
  style,
}: WindowProps) {
  const [grad1, grad2] = toneGradients[tone];
  const titleBg = active
    ? `linear-gradient(to right, ${grad1}, ${grad2})`
    : `linear-gradient(to right, var(--title-inactive), var(--title-inactive))`;

  const windowRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dragStart = useRef<{ mx: number; my: number; x: number; y: number } | null>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!draggable || maximised) return;
      onFocus?.();
      const el = windowRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      dragStart.current = { mx: e.clientX, my: e.clientY, x: rect.left, y: rect.top };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [draggable, maximised, onFocus]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragStart.current) return;
      const dx = e.clientX - dragStart.current.mx;
      const dy = e.clientY - dragStart.current.my;
      const nx = Math.max(0, Math.min(window.innerWidth - 100, dragStart.current.x + dx));
      const ny = Math.max(0, Math.min(window.innerHeight - 50, dragStart.current.y + dy));
      setPos({ x: nx, y: ny });
    },
    []
  );

  const handlePointerUp = useCallback(() => {
    dragStart.current = null;
  }, []);

  const positionStyle: React.CSSProperties = draggable && pos && !maximised
    ? { position: 'absolute', left: pos.x, top: pos.y }
    : {};

  return (
    <div
      ref={windowRef}
      className={`bg-[var(--chrome)] border-2 border-t-[var(--chrome-light)] border-l-[var(--chrome-light)] border-b-[var(--chrome-darker)] border-r-[var(--chrome-darker)] shadow-md flex flex-col ${maximised ? 'fixed inset-0 z-50' : ''}`}
      style={{ ...positionStyle, ...style }}
      onMouseDown={() => onFocus?.()}
    >
      {/* title bar */}
      <div
        className="flex items-center h-[22px] px-1 gap-1 shrink-0 select-none"
        style={{ background: titleBg }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* TODO: replace placeholder, expects 16x16 window icon PNG */}
        <div className="w-[16px] h-[14px] border border-dashed border-white/50 shrink-0" />
        <span className="text-[12px] font-bold text-[var(--text-inverse)] truncate flex-1">
          {title}
        </span>
        {/* window controls */}
        <div className="flex gap-[2px]">
          {onMinimise && (
            <button
              onClick={(e) => { e.stopPropagation(); onMinimise(); }}
              className="w-[16px] h-[14px] border border-t-[var(--chrome-light)] border-l-[var(--chrome-light)] border-b-[var(--chrome-dark)] border-r-[var(--chrome-dark)] bg-[var(--chrome)] text-[10px] leading-none flex items-center justify-center active:border-t-[var(--chrome-dark)] active:border-l-[var(--chrome-dark)] active:border-b-[var(--chrome-light)] active:border-r-[var(--chrome-light)]"
              aria-label="Minimise"
            >_</button>
          )}
          {onMaximise && (
            <button
              onClick={(e) => { e.stopPropagation(); onMaximise(); }}
              className="w-[16px] h-[14px] border border-t-[var(--chrome-light)] border-l-[var(--chrome-light)] border-b-[var(--chrome-dark)] border-r-[var(--chrome-dark)] bg-[var(--chrome)] text-[10px] leading-none flex items-center justify-center active:border-t-[var(--chrome-dark)] active:border-l-[var(--chrome-dark)] active:border-b-[var(--chrome-light)] active:border-r-[var(--chrome-light)]"
              aria-label="Maximise"
            >□</button>
          )}
          {onClose && (
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="w-[16px] h-[14px] border border-t-[var(--chrome-light)] border-l-[var(--chrome-light)] border-b-[var(--chrome-dark)] border-r-[var(--chrome-dark)] bg-[var(--chrome)] text-[10px] leading-none flex items-center justify-center active:border-t-[var(--chrome-dark)] active:border-l-[var(--chrome-dark)] active:border-b-[var(--chrome-light)] active:border-r-[var(--chrome-light)]"
              aria-label="Close"
            >×</button>
          )}
        </div>
      </div>
      {/* inset content area */}
      <div className="border-2 border-t-[var(--chrome-dark)] border-l-[var(--chrome-dark)] border-b-[var(--chrome-light)] border-r-[var(--chrome-light)] m-[2px] p-2 bg-white flex-1 overflow-auto text-[12px]">
        {children}
      </div>
    </div>
  );
}
