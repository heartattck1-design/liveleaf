import type { TimeRange } from '../../types/telemetry';

interface TimeSeriesChartProps {
  range: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

const seriesMap: Record<TimeRange, number[]> = {
  '24h': [62, 58, 66, 63, 59, 55, 61, 57, 70, 68, 72, 65],
  '7d': [58, 64, 62, 56, 61, 60, 67, 71, 74, 69, 65, 73],
  '30d': [40, 53, 57, 60, 66, 61, 70, 75, 78, 72, 69, 80],
};

export function TimeSeriesChart({ range, onRangeChange }: TimeSeriesChartProps) {
  const values = seriesMap[range];
  const width = 420;
  const height = 200;
  const max = Math.max(...values) + 10;
  const min = Math.min(...values) - 10;
  const stepX = width / (values.length - 1);

  const points = values
    .map((value, index) => {
      const x = index * stepX;
      const y = height - ((value - min) / (max - min || 1)) * (height - 24) - 12;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `${points} ${width},${height} 0,${height}`;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Telemetry Trend
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-800">Plant health overview</h3>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-slate-100 p-1">
          {(['24h', '7d', '30d'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onRangeChange(option)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                range === option ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="h-52 w-full overflow-visible">
        <defs>
          <linearGradient id="trendGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#34d399" stopOpacity={0.03} />
          </linearGradient>
        </defs>

        {[0, 1, 2, 3].map((line) => (
          <line
            key={line}
            x1="0"
            x2={width}
            y1={24 + line * 40}
            y2={24 + line * 40}
            stroke="#e2e8f0"
            strokeDasharray="4 6"
          />
        ))}

        <polygon points={areaPoints} fill="url(#trendGradient)" />
        <polyline
          points={points}
          fill="none"
          stroke="#10b981"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {values.map((value, index) => {
          const x = index * stepX;
          const y = height - ((value - min) / (max - min || 1)) * (height - 24) - 12;

          return (
            <circle
              key={`${value}-${index}`}
              cx={x}
              cy={y}
              r="4"
              fill="#ffffff"
              stroke="#10b981"
              strokeWidth="2"
            />
          );
        })}
      </svg>
    </div>
  );
}
