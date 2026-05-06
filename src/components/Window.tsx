import React from 'react';
import { getTitleBarColor } from '../lib/palette';

interface WindowProps {
  title: string;
  colorIndex?: number;
  children: React.ReactNode;
}

export default function Window({ title, colorIndex = 0, children }: WindowProps) {
  const barColor = getTitleBarColor(colorIndex);

  return (
    <div className="border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080] bg-[#f0f0f0] shadow-md w-full">
      {/* title bar */}
      <div
        className="flex items-center justify-between px-2 py-1"
        style={{ background: barColor }}
      >
        <span className="font-pixel text-[10px] text-gray-800 truncate">
          {title}
        </span>
        <div className="flex gap-1">
          <button className="w-4 h-4 border border-t-white border-l-white border-b-[#808080] border-r-[#808080] bg-[#c0c0c0] text-[8px] leading-none flex items-center justify-center" aria-hidden>
            _
          </button>
          <button className="w-4 h-4 border border-t-white border-l-white border-b-[#808080] border-r-[#808080] bg-[#c0c0c0] text-[8px] leading-none flex items-center justify-center" aria-hidden>
            □
          </button>
          <button className="w-4 h-4 border border-t-white border-l-white border-b-[#808080] border-r-[#808080] bg-[#c0c0c0] text-[8px] leading-none flex items-center justify-center" aria-hidden>
            ×
          </button>
        </div>
      </div>
      {/* inset content area */}
      <div className="border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white m-1 p-4 bg-white">
        {children}
      </div>
    </div>
  );
}
