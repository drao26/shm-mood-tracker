import React, { useRef, useState, useCallback } from 'react';

export type WindowTone = 'mint' | 'lavender' | 'peach' | 'butter' | 'pink';

interface WindowProps {
  id?: string;
  title: string;
  tone?: WindowTone;
  icon?: string;
  active?: boolean;
  maximised?: boolean;
  children: React.ReactNode;
  onClose?: () => void;
  onMinimise?: () => void;
  onMaximise?: () => void;
  onFocus?: () => void;
  draggable?: boolean;
  resizable?: boolean;
  style?: React.CSSProperties;
}

export default function Window({
  title,
  icon,
  active = true,
  maximised = false,
  children,
  onClose,
  onMinimise,
  onMaximise,
  onFocus,
  draggable = false,
  resizable = false,
  style,
}: WindowProps) {
  const titleBg = active
    ? `linear-gradient(to right, var(--accent), var(--accent-light))`
    : `linear-gradient(to right, var(--title-inactive), var(--title-inactive))`;

  const windowRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const dragStart = useRef<{ mx: number; my: number; x: number; y: number } | null>(null);
  const resizeStart = useRef<{ mx: number; my: number; w: number; h: number } | null>(null);

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

  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!resizable || maximised) return;
      e.stopPropagation();
      onFocus?.();
      const el = windowRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      resizeStart.current = { mx: e.clientX, my: e.clientY, w: rect.width, h: rect.height };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [resizable, maximised, onFocus]
  );

  const handleResizePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!resizeStart.current) return;
      const dx = e.clientX - resizeStart.current.mx;
      const dy = e.clientY - resizeStart.current.my;
      const nw = Math.max(200, resizeStart.current.w + dx);
      const nh = Math.max(100, resizeStart.current.h + dy);
      setSize({ w: nw, h: nh });
    },
    []
  );

  const handleResizePointerUp = useCallback(() => {
    resizeStart.current = null;
  }, []);

  const positionStyle: React.CSSProperties = draggable && pos && !maximised
    ? { position: 'absolute', left: pos.x, top: pos.y }
    : {};

  const sizeStyle: React.CSSProperties = resizable && size && !maximised
    ? { width: size.w, height: size.h }
    : {};

  return (
    <div
      ref={windowRef}
      className={`relative bg-[var(--chrome)] border-2 border-t-[var(--chrome-light)] border-l-[var(--chrome-light)] border-b-[var(--chrome-darker)] border-r-[var(--chrome-darker)] shadow-md flex flex-col ${maximised ? 'fixed inset-0 z-50' : ''}`}
      style={{ ...positionStyle, ...sizeStyle, ...style }}
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
        {icon ? (
          <img src={icon} alt="" className="w-[16px] h-[14px] object-contain shrink-0" />
        ) : (
          <div className="w-[16px] h-[14px] border border-dashed border-white/50 shrink-0" />
        )}
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
      {/* resize grip */}
      {resizable && !maximised && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
          onPointerDown={handleResizePointerDown}
          onPointerMove={handleResizePointerMove}
          onPointerUp={handleResizePointerUp}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" className="text-[var(--chrome-dark)]">
            <line x1="14" y1="6" x2="6" y2="14" stroke="currentColor" strokeWidth="1" />
            <line x1="14" y1="9" x2="9" y2="14" stroke="currentColor" strokeWidth="1" />
            <line x1="14" y1="12" x2="12" y2="14" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>
      )}
    </div>
  );
}
