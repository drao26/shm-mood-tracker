import React from 'react';

interface Textarea95Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export default function Textarea95({ className = '', ...props }: Textarea95Props) {
  return (
    <textarea
      className={`border-2 border-t-[var(--chrome-dark)] border-l-[var(--chrome-dark)] border-b-[var(--chrome-light)] border-r-[var(--chrome-light)] bg-white text-[12px] p-1 resize-y min-h-[60px] w-full outline-none focus:[outline:1px_dotted_var(--focus-dot)] focus:[outline-offset:-3px] ${className}`}
      style={{ borderRadius: 0, fontFamily: 'inherit' }}
      {...props}
    />
  );
}
