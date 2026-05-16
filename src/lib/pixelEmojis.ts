/** Pixel art emoji replacements (0-10 mood scale) */

function createPixelEmoji(blocks: string[][], color: string): string {
  const blockSize = 16;
  const width = blocks[0].length * blockSize;
  const height = blocks.length * blockSize;
  
  let svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
  
  blocks.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === '1') {
        svg += `<rect x="${x * blockSize}" y="${y * blockSize}" width="${blockSize}" height="${blockSize}" fill="${color}"/>`;
      }
    });
  });
  
  svg += '</svg>';
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// Pixel art designs for each mood (0-10)
const pixelMoodEmojis = [
  // 0 - storm (dark blue)
  createPixelEmoji([
    ['0', '1', '1', '0'],
    ['1', '1', '1', '1'],
    ['1', '1', '1', '0'],
    ['0', '1', '0', '1'],
  ], '#5B7AA2'),
  
  // 1 - rainy (slate blue)
  createPixelEmoji([
    ['0', '1', '1', '0'],
    ['1', '1', '1', '1'],
    ['1', '1', '1', '0'],
    ['1', '0', '1', '0'],
  ], '#6B8BB8'),
  
  // 2 - rainy (lighter blue)
  createPixelEmoji([
    ['0', '1', '1', '0'],
    ['1', '1', '1', '1'],
    ['1', '1', '1', '0'],
    ['0', '1', '0', '0'],
  ], '#7B9BD0'),
  
  // 3 - cloudy (blue-green)
  createPixelEmoji([
    ['1', '1', '1', '1'],
    ['1', '1', '1', '1'],
    ['0', '0', '0', '0'],
    ['0', '0', '0', '0'],
  ], '#8BAEDC'),
  
  // 4 - partly cloudy (cyan)
  createPixelEmoji([
    ['1', '1', '0', '0'],
    ['1', '1', '0', '0'],
    ['0', '0', '1', '1'],
    ['0', '0', '1', '1'],
  ], '#9BBDE8'),
  
  // 5 - neutral (light blue)
  createPixelEmoji([
    ['0', '1', '1', '0'],
    ['1', '1', '1', '1'],
    ['0', '1', '1', '0'],
    ['0', '0', '0', '0'],
  ], '#ABCDF0'),
  
  // 6 - partly sunny (yellow-blue)
  createPixelEmoji([
    ['0', '0', '1', '1'],
    ['0', '0', '1', '1'],
    ['1', '1', '0', '0'],
    ['1', '1', '0', '0'],
  ], '#BBDDF8'),
  
  // 7 - sunny (yellow)
  createPixelEmoji([
    ['0', '1', '1', '0'],
    ['1', '1', '1', '1'],
    ['0', '1', '1', '0'],
    ['0', '1', '1', '0'],
  ], '#FFD700'),
  
  // 8 - bright sun (bright yellow)
  createPixelEmoji([
    ['1', '1', '1', '1'],
    ['1', '0', '0', '1'],
    ['1', '0', '0', '1'],
    ['1', '1', '1', '1'],
  ], '#FFED4E'),
  
  // 9 - very bright (golden)
  createPixelEmoji([
    ['0', '1', '1', '0'],
    ['1', '1', '1', '1'],
    ['1', '1', '1', '1'],
    ['0', '1', '1', '0'],
  ], '#FFE91E'),
  
  // 10 - magical (bright pink/magenta)
  createPixelEmoji([
    ['1', '0', '0', '1'],
    ['0', '1', '1', '0'],
    ['0', '1', '1', '0'],
    ['1', '0', '0', '1'],
  ], '#FF69B4'),
];

export function getPixelEmojiUrl(score: number): string {
  const clamped = Math.max(0, Math.min(10, Math.round(score)));
  return pixelMoodEmojis[clamped];
}

export const pixelMoodEmojisArray = pixelMoodEmojis;
