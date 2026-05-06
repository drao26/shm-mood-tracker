import { useState } from 'react';
import Button95 from './Button95';

interface StartMenuProps {
  onClose: () => void;
  onSwitchUser: () => void;
}

export default function StartMenu({ onClose, onSwitchUser }: StartMenuProps) {
  const [showShutdown, setShowShutdown] = useState(false);

  if (showShutdown) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/20" onClick={onClose}>
        <div
          className="bg-[var(--chrome)] border-2 border-t-[var(--chrome-light)] border-l-[var(--chrome-light)] border-b-[var(--chrome-darker)] border-r-[var(--chrome-darker)] p-4 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-[12px] text-[var(--text)] mb-3">are you sure you want to shut down?</p>
          <div className="flex justify-end gap-2">
            <Button95 onClick={() => window.location.reload()}>yes</Button95>
            <Button95 onClick={() => { setShowShutdown(false); onClose(); }}>no</Button95>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute bottom-full left-0 mb-[2px] w-[160px] bg-[var(--chrome)] border-2 border-t-[var(--chrome-light)] border-l-[var(--chrome-light)] border-b-[var(--chrome-darker)] border-r-[var(--chrome-darker)] shadow-lg z-[100]"
    >
      <div className="flex flex-col">
        <button
          className="text-left px-3 py-[4px] text-[11px] text-[var(--text)] hover:bg-[var(--title-active)] hover:text-[var(--text-inverse)]"
          onClick={onSwitchUser}
        >
          switch user
        </button>
        <button
          className="text-left px-3 py-[4px] text-[11px] text-[var(--text)] hover:bg-[var(--title-active)] hover:text-[var(--text-inverse)]"
          onClick={() => {
            /* settings - placeholder */
          }}
        >
          settings
        </button>
        <div className="h-px bg-[var(--chrome-dark)] mx-2 my-[2px]" />
        <button
          className="text-left px-3 py-[4px] text-[11px] text-[var(--text)] hover:bg-[var(--title-active)] hover:text-[var(--text-inverse)]"
          onClick={() => setShowShutdown(true)}
        >
          shut down...
        </button>
      </div>
    </div>
  );
}
