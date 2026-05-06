interface StartMenuProps {
  onClose: () => void;
  onSwitchUser: () => void;
}

export default function StartMenu({ onClose, onSwitchUser }: StartMenuProps) {
  return (
    <div
      className="absolute bottom-full left-0 mb-[2px] w-[160px] bg-[var(--chrome)] border-2 border-t-[var(--chrome-light)] border-l-[var(--chrome-light)] border-b-[var(--chrome-darker)] border-r-[var(--chrome-darker)] shadow-lg z-[100]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col">
        <button
          className="text-left px-3 py-[4px] text-[11px] text-[var(--text)] hover:bg-[var(--title-active)] hover:text-[var(--text-inverse)]"
          onClick={() => { onSwitchUser(); onClose(); }}
        >
          switch user
        </button>
      </div>
    </div>
  );
}
