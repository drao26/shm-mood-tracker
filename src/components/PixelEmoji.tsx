import { useEffect, useState } from 'react';

interface PixelEmojiProps {
  /** Native emoji character (e.g. "☀️"). */
  emoji: string;
  /** Final display size in CSS pixels. */
  size?: number;
  /** Internal raster size — smaller = chunkier pixelation. */
  pixelSize?: number;
  className?: string;
}

/**
 * Renders a native emoji as a low-resolution raster scaled up with
 * `image-rendering: pixelated`. Produces a chunky Win95/8-bit look
 * without needing custom sprite assets.
 */
export default function PixelEmoji({
  emoji,
  size = 24,
  pixelSize = 16,
  className = '',
}: PixelEmojiProps) {
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = pixelSize;
    canvas.height = pixelSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${pixelSize - 2}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Twemoji Mozilla",sans-serif`;
    ctx.fillText(emoji, pixelSize / 2, pixelSize / 2 + 1);
    setUrl(canvas.toDataURL('image/png'));
  }, [emoji, pixelSize]);

  return (
    <img
      src={url}
      width={size}
      height={size}
      alt=""
      className={className}
      style={{
        imageRendering: 'pixelated',
        width: size,
        height: size,
        display: 'block',
      }}
    />
  );
}
