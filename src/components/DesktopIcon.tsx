interface DesktopIconProps {
  label: string;
  iconSrc: string;
  selected?: boolean;
  onOpen: () => void;
  onSelect: () => void;
}

export default function DesktopIcon({ label, iconSrc, selected, onOpen, onSelect }: DesktopIconProps) {
  return (
    <div
      className="flex flex-col items-center gap-1 cursor-pointer w-[68px]"
      onClick={onSelect}
      onDoubleClick={onOpen}
      onTouchEnd={(e) => { e.preventDefault(); onOpen(); }}
    >
      {/* TODO: replace placeholder, expects 48x48 PNG */}
      <div className="w-[48px] h-[48px] border border-dashed border-[var(--chrome-dark)] flex items-center justify-center text-[9px] text-[var(--chrome-darker)]">
        <img
          src={iconSrc}
          alt={label}
          className="w-full h-full object-contain"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </div>
      <span
        className={`text-[11px] text-center leading-tight px-1 ${
          selected
            ? 'bg-[var(--title-active)] text-[var(--text-inverse)] outline outline-1 outline-dotted outline-[var(--focus-dot)]'
            : 'text-[var(--text)]'
        }`}
      >
        {label}
      </span>
    </div>
  );
}
