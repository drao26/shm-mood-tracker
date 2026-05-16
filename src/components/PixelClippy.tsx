/** Pixel art Clippy mascot component */

interface PixelClippyProps {
  mode: 'idle' | 'neutral' | 'storm' | 'sunny';
  reacting: boolean;
}

const BLOCK_SIZE = 8;
const PIXEL_SIZE = 2; // Each pixel is this many SVG units

/**
 * Generates a pixelated Clippy character as SVG.
 * Uses 8x8 blocks to create retro pixel art style.
 */
export function PixelClippy({ mode, reacting }: PixelClippyProps) {
  // Clip shape (main body) - rotated slightly based on mode
  const rotation = reacting ? 'rotate(-5 68 70)' : 'rotate(0 68 70)';
  
  // Base color for body
  const bodyColor = '#9B8BA1';
  const highlightColor = '#D4C1E8';
  const darkColor = '#5B4B6B';
  
  return (
    <svg viewBox="0 0 140 140" className="mood-mascot__art" role="img" aria-label="Mood mascot">
      {/* Shadow */}
      <ellipse cx="70" cy="120" rx="45" ry="12" fill="rgba(81, 81, 93, 0.18)" />
      
      {/* Main clip body - pixelated */}
      <g transform={rotation}>
        {/* Upper clip section */}
        {[
          { x: 50, y: 30 }, { x: 58, y: 30 }, { x: 66, y: 30 }, { x: 74, y: 30 }, { x: 82, y: 30 },
          { x: 45, y: 38 }, { x: 53, y: 38 }, { x: 61, y: 38 }, { x: 69, y: 38 }, { x: 77, y: 38 }, { x: 85, y: 38 },
          { x: 45, y: 46 }, { x: 53, y: 46 }, { x: 61, y: 46 }, { x: 69, y: 46 }, { x: 77, y: 46 }, { x: 85, y: 46 },
          { x: 45, y: 54 }, { x: 53, y: 54 }, { x: 61, y: 54 }, { x: 69, y: 54 }, { x: 77, y: 54 }, { x: 85, y: 54 },
          { x: 45, y: 62 }, { x: 53, y: 62 }, { x: 61, y: 62 }, { x: 69, y: 62 }, { x: 77, y: 62 }, { x: 85, y: 62 },
        ].map((pos, i) => (
          <rect key={`body-${i}`} x={pos.x} y={pos.y} width={PIXEL_SIZE} height={PIXEL_SIZE} fill={bodyColor} />
        ))}
        
        {/* Highlight on clip */}
        {[
          { x: 58, y: 30 }, { x: 66, y: 30 },
          { x: 61, y: 38 }, { x: 69, y: 38 },
          { x: 61, y: 46 }, { x: 69, y: 46 },
        ].map((pos, i) => (
          <rect key={`highlight-${i}`} x={pos.x} y={pos.y} width={PIXEL_SIZE} height={PIXEL_SIZE} fill={highlightColor} />
        ))}
      </g>
      
      {/* Eyes */}\n      <circle cx="58" cy="60" r="4" fill={darkColor} />\n      <circle cx="82" cy="60" r="4" fill={darkColor} />\n      <circle cx="60" cy="58" r="1.5" fill={highlightColor} />\n      <circle cx="84" cy="58" r="1.5" fill={highlightColor} />\n      \n      {/* Mouth */}\n      {mode === 'sunny' && (\n        <path d="M 65 75 Q 70 80 75 75" stroke={darkColor} strokeWidth="2" fill="none" strokeLinecap="round" />\n      )}\n      {mode === 'storm' && (\n        <path d="M 65 75 L 75 75" stroke={darkColor} strokeWidth="2" strokeLinecap="round" />\n      )}\n      {mode === 'neutral' && (\n        <line x1="65" y1="75" x2="75" y2="75" stroke={darkColor} strokeWidth="2" strokeLinecap="round" />\n      )}\n      {mode === 'idle' && (\n        <path d="M 65 77 Q 70 74 75 77" stroke={darkColor} strokeWidth="2" fill="none" strokeLinecap="round" />\n      )}\n      \n      {/* Cheeks */}\n      <circle cx="48" cy="68" r="3" fill={highlightColor} opacity="0.6" />\n      <circle cx="92" cy="68" r="3" fill={highlightColor} opacity="0.6" />\n    </svg>\n  );\n}
