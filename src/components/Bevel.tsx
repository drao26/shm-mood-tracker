import React from 'react';

interface BevelProps {
  type: 'outset' | 'inset';
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function Bevel({ type, children, className = '', style }: BevelProps) {
  const borders = type === 'outset' ? 'border95-outset' : 'border95-inset';

  return (
    <div className={`border-2 ${borders} ${className}`} style={style}>
      {children}
    </div>
  );
}
