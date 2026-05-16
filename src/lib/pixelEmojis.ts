/** Pixel art emoji replacements (0-10 mood scale) */

function createFaceSVG(face: string[][], color: string, eye: string, mouth: string) {
  const blockSize = 16;
  const width = face[0].length * blockSize;
  const height = face.length * blockSize;
  let svg = `<svg viewBox='0 0 ${width} ${height}' xmlns='http://www.w3.org/2000/svg'>`;
  // Face background
  svg += `<rect x='0' y='0' width='${width}' height='${height}' rx='${blockSize * 2}' fill='${color}'/>`;
  // Eyes
  if (eye === 'happy') {
    svg += `<ellipse cx='${blockSize * 1.5}' cy='${blockSize * 2}' rx='${blockSize/2}' ry='${blockSize/2}' fill='#222'/><ellipse cx='${blockSize * 3.5}' cy='${blockSize * 2}' rx='${blockSize/2}' ry='${blockSize/2}' fill='#222'/>`;
  } else if (eye === 'sad') {
    svg += `<ellipse cx='${blockSize * 1.5}' cy='${blockSize * 2.5}' rx='${blockSize/2}' ry='${blockSize/2}' fill='#222'/><ellipse cx='${blockSize * 3.5}' cy='${blockSize * 2.5}' rx='${blockSize/2}' ry='${blockSize/2}' fill='#222'/>`;
  } else {
    svg += `<ellipse cx='${blockSize * 1.5}' cy='${blockSize * 2}' rx='${blockSize/2}' ry='${blockSize/2}' fill='#222'/><ellipse cx='${blockSize * 3.5}' cy='${blockSize * 2}' rx='${blockSize/2}' ry='${blockSize/2}' fill='#222'/>`;
  }
  // Mouth
  if (mouth === 'smile') {
    svg += `<path d='M${blockSize*1.2} ${blockSize*3.2} Q${blockSize*2.5} ${blockSize*4.2} ${blockSize*3.8} ${blockSize*3.2}' stroke='#222' stroke-width='2' fill='none'/>`;
  } else if (mouth === 'frown') {
    svg += `<path d='M${blockSize*1.2} ${blockSize*4} Q${blockSize*2.5} ${blockSize*3.2} ${blockSize*3.8} ${blockSize*4}' stroke='#222' stroke-width='2' fill='none'/>`;
  } else if (mouth === 'flat') {
    svg += `<rect x='${blockSize*1.5}' y='${blockSize*3.5}' width='${blockSize*2}' height='2' rx='1' fill='#222'/>`;
  } else if (mouth === 'o') {
    svg += `<ellipse cx='${blockSize*2.5}' cy='${blockSize*3.5}' rx='${blockSize/2}' ry='${blockSize/3}' fill='#222'/>`;
  }
  svg += '</svg>';
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

const pixelMoodEmojis = [
  // 0 - very sad
  createFaceSVG([
    ['0','0','0','0','0'],
    ['0','1','1','1','0'],
    ['1','1','1','1','1'],
    ['1','1','1','1','1'],
    ['0','1','1','1','0'],
  ], '#A8C5DD', 'sad', 'frown'),
  // 1 - sad
  createFaceSVG([
    ['0','0','0','0','0'],
    ['0','1','1','1','0'],
    ['1','1','1','1','1'],
    ['1','1','1','1','1'],
    ['0','1','1','1','0'],
  ], '#B0D4F1', 'sad', 'frown'),
  // 2 - less sad
  createFaceSVG([
    ['0','0','0','0','0'],
    ['0','1','1','1','0'],
    ['1','1','1','1','1'],
    ['1','1','1','1','1'],
    ['0','1','1','1','0'],
  ], '#AEDDDB', 'sad', 'flat'),
  // 3 - neutral
  createFaceSVG([
    ['0','0','0','0','0'],
    ['0','1','1','1','0'],
    ['1','1','1','1','1'],
    ['1','1','1','1','1'],
    ['0','1','1','1','0'],
  ], '#B8E8D0', 'neutral', 'flat'),
  // 4 - neutral
  createFaceSVG([
    ['0','0','0','0','0'],
    ['0','1','1','1','0'],
    ['1','1','1','1','1'],
    ['1','1','1','1','1'],
    ['0','1','1','1','0'],
  ], '#C8E6C9', 'neutral', 'flat'),
  // 5 - slight smile
  createFaceSVG([
    ['0','0','0','0','0'],
    ['0','1','1','1','0'],
    ['1','1','1','1','1'],
    ['1','1','1','1','1'],
    ['0','1','1','1','0'],
  ], '#D8EAAA', 'happy', 'smile'),
  // 6 - smile
  createFaceSVG([
    ['0','0','0','0','0'],
    ['0','1','1','1','0'],
    ['1','1','1','1','1'],
    ['1','1','1','1','1'],
    ['0','1','1','1','0'],
  ], '#E8E9A8', 'happy', 'smile'),
  // 7 - big smile
  createFaceSVG([
    ['0','0','0','0','0'],
    ['0','1','1','1','0'],
    ['1','1','1','1','1'],
    ['1','1','1','1','1'],
    ['0','1','1','1','0'],
  ], '#F5DBA8', 'happy', 'smile'),
  // 8 - very happy
  createFaceSVG([
    ['0','0','0','0','0'],
    ['0','1','1','1','0'],
    ['1','1','1','1','1'],
    ['1','1','1','1','1'],
    ['0','1','1','1','0'],
  ], '#FFD9B3', 'happy', 'smile'),
  // 9 - excited
  createFaceSVG([
    ['0','0','0','0','0'],
    ['0','1','1','1','0'],
    ['1','1','1','1','1'],
    ['1','1','1','1','1'],
    ['0','1','1','1','0'],
  ], '#FFCDC9', 'happy', 'o'),
  // 10 - magical
  createFaceSVG([
    ['0','0','0','0','0'],
    ['0','1','1','1','0'],
    ['1','1','1','1','1'],
    ['1','1','1','1','1'],
    ['0','1','1','1','0'],
  ], '#FFD0E0', 'happy', 'o'),
];

export function getPixelEmojiUrl(score: number): string {
  const clamped = Math.max(0, Math.min(10, Math.round(score)));
  return pixelMoodEmojis[clamped];
}

export const pixelMoodEmojisArray = pixelMoodEmojis;
