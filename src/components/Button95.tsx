import React from 'react';

interface Button95Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  pressed?: boolean;
}

export default function Button95({ children, pressed, className = '', ...props }: Button95Props) {
  const bevel = pressed
    ? 'border-t-[var(--chrome-dark)] border-l-[var(--chrome-dark)] border-b-[var(--chrome-light)] border-r-[var(--chrome-light)]'
    : 'border-t-[var(--chrome-light)] border-l-[var(--chrome-light)] border-b-[var(--chrome-dark)] border-r-[var(--chrome-dark)]';

  return (
    <button
      className={`border-2 ${bevel} bg-[var(--chrome)] text-[var(--text)] text-[11px] leading-none px-3 h-[23px] cursor-pointer select-none focus:outline-none active:border-t-[var(--chrome-dark)] active:border-l-[var(--chrome-dark)] active:border-b-[var(--chrome-light)] active:border-r-[var(--chrome-light)] ${className}`}
      style={{ fontFamily: 'inherit' }}
      {...props}
    >
      <span className="inline-block active:translate-x-px active:translate-y-px">
        {children}
      </span>
    </button>
  );
}
