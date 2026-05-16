/** Pixel art Clippy mascot component */

interface PixelClippyProps {
  mode: 'idle' | 'neutral' | 'storm' | 'sunny';
  reacting: boolean;
}



/**
 * Generates a pixelated Clippy character as SVG.
 * Uses small rectangles to create retro pixel art style.
 */
export function PixelClippy({ mode }: PixelClippyProps) {
  // Ghost color by mood
  let ghostColor = '#B8E8D0'; // default mint
  if (mode === 'storm') ghostColor = '#A8C5DD'; // blue
  if (mode === 'sunny') ghostColor = '#FFD0E0'; // pink
  if (mode === 'neutral') ghostColor = '#FFF5B8'; // yellow

  // Eye direction by mood
  let eyeDx = 0;
  if (mode === 'storm') eyeDx = -2;
  if (mode === 'sunny') eyeDx = 2;

  return (
    <svg viewBox="0 0 48 48" className="mood-mascot__art" width={96} height={96}>
      {/* Ghost body */}
      <rect x="8" y="12" width="32" height="24" rx="16" fill={ghostColor} />
      {/* Wavy bottom */}
      <rect x="8" y="36" width="4" height="8" rx="2" fill={ghostColor} />
      <rect x="16" y="36" width="4" height="8" rx="2" fill={ghostColor} />
      <rect x="24" y="36" width="4" height="8" rx="2" fill={ghostColor} />
      <rect x="32" y="36" width="4" height="8" rx="2" fill={ghostColor} />
      <rect x="36" y="36" width="4" height="8" rx="2" fill={ghostColor} />
      {/* Eyes */}
      <ellipse cx={18 + eyeDx} cy="26" rx="4" ry="6" fill="#fff" />
      <ellipse cx={30 + eyeDx} cy="26" rx="4" ry="6" fill="#fff" />
      <ellipse cx={18 + eyeDx} cy="29" rx="2" ry="3" fill="#222" />
      <ellipse cx={30 + eyeDx} cy="29" rx="2" ry="3" fill="#222" />
      {/* Mouth by mood */}
      {mode === 'sunny' && <ellipse cx="24" cy="34" rx="4" ry="2" fill="#222" />}
      {mode === 'storm' && <rect x="20" y="34" width="8" height="2" rx="1" fill="#222" />}
      {mode === 'neutral' && <rect x="21" y="34" width="6" height="2" rx="1" fill="#222" />}
      {mode === 'idle' && <ellipse cx="24" cy="36" rx="3" ry="1.5" fill="#222" />}
    </svg>
  );
}
