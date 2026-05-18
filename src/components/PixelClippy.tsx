/** Pixel art cat mascot component */

interface PixelClippyProps {
  mode: 'idle' | 'neutral' | 'storm' | 'sunny';
  reacting: boolean;
}

const base = import.meta.env.BASE_URL;

/**
 * Renders the pixel-art cat mascot. The mood tints the image with a soft
 * background halo so the cat visually responds to the current mood.
 */
export function PixelClippy({ mode }: PixelClippyProps) {
  // Halo color by mood
  let halo = '#B8E8D0'; // default mint
  if (mode === 'storm') halo = '#A8C5DD'; // blue
  if (mode === 'sunny') halo = '#FFD0E0'; // pink
  if (mode === 'neutral') halo = '#FFF5B8'; // yellow

  return (
    <div
      className="mood-mascot__art"
      style={{
        width: 96,
        height: 96,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `radial-gradient(circle, ${halo} 0%, ${halo}00 70%)`,
      }}
    >
      <img
        src={`${base}images/pngtree-cute-pixel-art-cat-png-image_21719083.png`}
        alt="pixel cat mascot"
        width={88}
        height={88}
        style={{ imageRendering: 'pixelated', display: 'block' }}
      />
    </div>
  );
}
