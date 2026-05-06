import { useEffect, useRef, useState } from 'react';
import cloud from 'd3-cloud';
import { wordCloudColors } from '../lib/palette';
import { tokenize, WordFrequency } from '../lib/tokenize';

interface WordCloudProps {
  texts: string[];
  width?: number;
  height?: number;
}

interface LayoutWord {
  text: string;
  size: number;
  x: number;
  y: number;
  rotate: number;
  color: string;
}

export default function WordCloud({ texts, width = 500, height = 300 }: WordCloudProps) {
  const [words, setWords] = useState<LayoutWord[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(width);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width || width);
      }
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [width]);

  useEffect(() => {
    const frequencies = tokenize(texts);
    if (frequencies.length === 0) {
      setWords([]);
      return;
    }

    const maxVal = frequencies[0].value;
    const minSize = 12;
    const maxSize = 48;

    const scaledWords = frequencies.map((w: WordFrequency) => ({
      text: w.text,
      size: minSize + ((w.value / maxVal) * (maxSize - minSize)),
    }));

    const layout = cloud()
      .size([containerWidth, height])
      .words(scaledWords)
      .padding(4)
      .rotate(() => (Math.random() > 0.7 ? 90 : 0))
      .fontSize((d: { size?: number }) => d.size ?? minSize)
      .on('end', (output: cloud.Word[]) => {
        setWords(
          output.map((w) => ({
            text: w.text!,
            size: w.size!,
            x: w.x!,
            y: w.y!,
            rotate: w.rotate!,
            color: wordCloudColors[Math.floor(Math.random() * wordCloudColors.length)],
          }))
        );
      });

    layout.start();
  }, [texts, containerWidth, height]);

  const frequencies = tokenize(texts);
  if (frequencies.length === 0) {
    return (
      <div ref={containerRef} className="w-full flex items-center justify-center py-12">
        <p className="text-sm text-gray-400 italic">
          nothing yet — the cloud will fill in as you write
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full">
      <svg width={containerWidth} height={height} className="block mx-auto">
        <g transform={`translate(${containerWidth / 2}, ${height / 2})`}>
          {words.map((w, i) => (
            <text
              key={i}
              textAnchor="middle"
              transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
              style={{
                fontSize: w.size,
                fill: w.color,
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: 500,
              }}
            >
              {w.text}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
}
