import { useMemo, useState } from 'react';
import { getMoodColor, emptyColor } from '../lib/palette';

interface HeatmapEntry {
  date: string;
  score: number;
}

interface HeatmapProps {
  entries: HeatmapEntry[];
  label?: string;
}

export default function Heatmap({ entries, label }: HeatmapProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; date: string; score: number } | null>(null);

  const { weeks, monthLabels, dayLabels } = useMemo(() => {
    const scoreMap = new Map<string, number>();
    for (const e of entries) {
      scoreMap.set(e.date, e.score);
    }

    // rolling 12 months ending today
    const today = new Date();
    const start = new Date(today);
    start.setFullYear(start.getFullYear() - 1);
    // go back to the previous monday
    while (start.getDay() !== 1) {
      start.setDate(start.getDate() - 1);
    }

    const weeks: (({ date: string; score: number | null }) | null)[][] = [];
    const monthLabels: { label: string; col: number }[] = [];
    let currentWeek: ({ date: string; score: number | null } | null)[] = [];
    let lastMonth = -1;

    const cursor = new Date(start);
    while (cursor <= today) {
      const dayOfWeek = (cursor.getDay() + 6) % 7; // monday = 0
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      const dateStr = cursor.toISOString().slice(0, 10);
      const month = cursor.getMonth();
      if (month !== lastMonth) {
        monthLabels.push({
          label: cursor.toLocaleString('en', { month: 'short' }).toLowerCase(),
          col: weeks.length,
        });
        lastMonth = month;
      }

      const score = scoreMap.get(dateStr) ?? null;
      currentWeek.push({ date: dateStr, score });
      cursor.setDate(cursor.getDate() + 1);
    }
    if (currentWeek.length > 0) {
      // pad remaining days
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    // Reverse so most recent month is on the left
    const totalWeeks = weeks.length;
    weeks.reverse();
    const reversedMonthLabels = monthLabels.map((m, i) => {
      const endCol = i < monthLabels.length - 1 ? monthLabels[i + 1].col - 1 : totalWeeks - 1;
      return { label: m.label, col: totalWeeks - 1 - endCol };
    });

    const dayLabels = [
      { label: 'mon', row: 0 },
      { label: 'wed', row: 2 },
      { label: 'fri', row: 4 },
    ];

    return { weeks, monthLabels: reversedMonthLabels, dayLabels };
  }, [entries]);

  const cellSize = 13;
  const cellGap = 3;
  const leftPad = 32;
  const topPad = 18;
  const totalWidth = leftPad + weeks.length * (cellSize + cellGap);
  const totalHeight = topPad + 7 * (cellSize + cellGap);

  return (
    <div className="w-full">
      {label && (
        <p className="text-xs text-gray-500 mb-2">{label}</p>
      )}
      <div className="overflow-x-auto">
        <svg
          width={totalWidth}
          height={totalHeight}
          className="block"
          onMouseLeave={() => setTooltip(null)}
        >
          {/* month labels */}
          {monthLabels.map((m, i) => (
            <text
              key={i}
              x={leftPad + m.col * (cellSize + cellGap)}
              y={12}
              className="fill-gray-400"
              fontSize={10}
              fontFamily="Inter, system-ui, sans-serif"
            >
              {m.label}
            </text>
          ))}

          {/* day labels */}
          {dayLabels.map((d) => (
            <text
              key={d.label}
              x={0}
              y={topPad + d.row * (cellSize + cellGap) + cellSize - 2}
              className="fill-gray-400"
              fontSize={10}
              fontFamily="Inter, system-ui, sans-serif"
            >
              {d.label}
            </text>
          ))}

          {/* cells */}
          {weeks.map((week, col) =>
            week.map((day, row) => {
              if (!day) return null;
              const x = leftPad + col * (cellSize + cellGap);
              const y = topPad + row * (cellSize + cellGap);
              const color = day.score !== null ? getMoodColor(day.score) : emptyColor;
              return (
                <rect
                  key={`${col}-${row}`}
                  x={x}
                  y={y}
                  width={cellSize}
                  height={cellSize}
                  rx={2}
                  ry={2}
                  fill={color}
                  className="cursor-pointer"
                  onMouseEnter={(e) => {
                    const rect = (e.target as SVGRectElement).getBoundingClientRect();
                    setTooltip({
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                      date: day.date,
                      score: day.score!,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })
          )}
        </svg>
      </div>

      {/* tooltip */}
      {tooltip && tooltip.score !== null && (
        <div
          className="fixed z-50 bg-gray-800 text-white text-xs px-2 py-1 rounded pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y - 32,
            transform: 'translateX(-50%)',
          }}
        >
          {tooltip.date} · {tooltip.score}/10
        </div>
      )}
    </div>
  );
}
