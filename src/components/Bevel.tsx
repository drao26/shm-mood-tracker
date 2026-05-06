import React from 'react';

interface BevelProps {
  type: 'outset' | 'inset';
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function Bevel({ type, children, className = '', style }: BevelProps) {
  const borders =
    type === 'outset'
      ? 'border-t-[var(--chrome-light)] border-l-[var(--chrome-light)] border-b-[var(--chrome-dark)] border-r-[var(--chrome-dark)]'
      : 'border-t-[var(--chrome-dark)] border-l-[var(--chrome-dark)] border-b-[var(--chrome-light)] border-r-[var(--chrome-light)]';

  return (
    <div className={`border-2 ${borders} ${className}`} style={style}>
      {children}
    </div>
  );
}
