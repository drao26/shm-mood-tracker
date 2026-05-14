import React from 'react';

interface Button95Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  pressed?: boolean;
}

export default function Button95({ children, pressed, className = '', ...props }: Button95Props) {
  const bevel = pressed ? 'border95-inset' : 'border95-outset';

  return (
    <button
      className={`border-2 ${bevel} bg-[var(--chrome)] text-[var(--text)] text-[11px] leading-none px-3 h-[23px] cursor-pointer select-none focus:outline-none active:border95-inset ${className}`}
      style={{ fontFamily: 'inherit' }}
      {...props}
    >
      <span className="inline-block active:translate-x-px active:translate-y-px">
        {children}
      </span>
    </button>
  );
}
