import { useMemo, useState } from 'react';

import type { DeviceTelemetrySample, RawSensorKey, TimeRange } from '../../types/telemetry';
import {
  formatSensorValue,
  getSamplesInRange,
  isValidSensorValue,
  RAW_SENSOR_METRICS,
  TIME_RANGE_OPTIONS,
} from '../../utils/telemetry';

interface TimeSeriesChartProps {
  history: DeviceTelemetrySample[];
  range: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  theme: 'light' | 'dark';
}

const CHART_WIDTH = 680;
const CHART_HEIGHT = 240;
const CHART_TOP = 18;
const CHART_BOTTOM = 190;
const MAX_CHART_POINTS = 60;

function downsample(samples: DeviceTelemetrySample[]): DeviceTelemetrySample[] {
  if (samples.length <= MAX_CHART_POINTS) {
    return samples;
  }

  const step = (samples.length - 1) / (MAX_CHART_POINTS - 1);
  return Array.from({ length: MAX_CHART_POINTS }, (_, index) =>
    samples[Math.round(index * step)],
  );
}

function formatTick(timestampMs: number, range: TimeRange): string {
  const date = new Date(timestampMs);
  return range === '24h'
    ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function TimeSeriesChart({ history, range, onRangeChange, theme }: TimeSeriesChartProps) {
  const [sensorKey, setSensorKey] = useState<RawSensorKey>('lamp');
  const metric = RAW_SENSOR_METRICS.find((item) => item.key === sensorKey) ?? RAW_SENSOR_METRICS[2];
  const samples = useMemo(
    () => getSamplesInRange(history, range).filter((sample) => isValidSensorValue(sample[sensorKey])),
    [history, range, sensorKey],
  );
  const visibleSamples = useMemo(() => downsample(samples), [samples]);
  const values = visibleSamples.map((sample) => sample[sensorKey]);
  const minValue = values.length ? Math.min(...values) : 0;
  const maxValue = values.length ? Math.max(...values) : 1;
  const spread = maxValue - minValue || Math.max(Math.abs(maxValue) * 0.1, 1);
  const paddedMin = minValue - spread * 0.1;
  const paddedMax = maxValue + spread * 0.1;
  const plotHeight = CHART_BOTTOM - CHART_TOP;
  const points = visibleSamples.map((sample, index) => {
    const x = visibleSamples.length === 1
      ? CHART_WIDTH / 2
      : (index / (visibleSamples.length - 1)) * CHART_WIDTH;
    const y = CHART_BOTTOM - ((sample[sensorKey] - paddedMin) / (paddedMax - paddedMin)) * plotHeight;
    return { x, y };
  });
  const linePoints = points.map(({ x, y }) => `${x},${y}`).join(' ');
  const areaPoints = points.length
    ? `${points[0].x},${CHART_BOTTOM} ${linePoints} ${points[points.length - 1].x},${CHART_BOTTOM}`
    : '';
  const isDark = theme === 'dark';

  return (
    <section
      className={[
        'rounded-3xl border p-5 shadow-sm',
        isDark ? 'border-slate-800 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-800',
      ].join(' ')}
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Sensor history</p>
          <h2 className="mt-1 text-lg font-semibold">Raw {metric.label.toLowerCase()} readings</h2>
          <p className="mt-1 text-xs text-slate-500">{samples.length} readings in this period</p>
        </div>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          Sensor
          <select
            value={sensorKey}
            onChange={(event) => {
              const selected = RAW_SENSOR_METRICS.find((item) => item.key === event.target.value);
              if (selected) setSensorKey(selected.key);
            }}
            className={[
              'rounded-xl border px-3 py-2 text-sm outline-none focus:border-emerald-500',
              isDark ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-200 bg-white text-slate-800',
            ].join(' ')}
          >
            {RAW_SENSOR_METRICS.map((item) => (
              <option key={item.key} value={item.key}>{item.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {TIME_RANGE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={range === option.value}
            onClick={() => onRangeChange(option.value)}
            className={[
              'rounded-full px-3 py-1.5 text-xs font-semibold transition',
              range === option.value
                ? 'bg-emerald-600 text-white'
                : isDark
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            ].join(' ')}
          >
            {option.label}
          </button>
        ))}
      </div>

      {visibleSamples.length > 0 ? (
        <>
          <svg
            role="img"
            aria-label={`${metric.label} sensor readings over the last ${range}`}
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="h-64 w-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="sensorHistoryFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3].map((line) => {
              const y = CHART_TOP + (plotHeight / 3) * line;
              const value = paddedMax - ((paddedMax - paddedMin) / 3) * line;
              return (
                <g key={line}>
                  <line
                    x1="0"
                    x2={CHART_WIDTH}
                    y1={y}
                    y2={y}
                    stroke={isDark ? '#334155' : '#e2e8f0'}
                    strokeDasharray="4 6"
                  />
                  <text x="4" y={y - 4} fill={isDark ? '#94a3b8' : '#64748b'} fontSize="10">
                    {formatSensorValue(value, metric.unit)}
                  </text>
                </g>
              );
            })}
            {points.length > 1 && <polygon points={areaPoints} fill="url(#sensorHistoryFill)" />}
            {points.length > 1 && (
              <polyline
                points={linePoints}
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}
            {points.map(({ x, y }, index) => (
              <circle
                key={`${visibleSamples[index].timestampMs}-${index}`}
                cx={x}
                cy={y}
                r={points.length === 1 ? 5 : 2}
                fill="#10b981"
              />
            ))}
            <text x="0" y="226" fill={isDark ? '#94a3b8' : '#64748b'} fontSize="11">
              {formatTick(samples[0].timestampMs, range)}
            </text>
            <text x={CHART_WIDTH} y="226" fill={isDark ? '#94a3b8' : '#64748b'} fontSize="11" textAnchor="end">
              {formatTick(samples[samples.length - 1].timestampMs, range)}
            </text>
          </svg>
          <p className="mt-2 text-xs text-slate-500">
            Light, soil, and tank readings are raw ADC counts; temperature and humidity use sensor units.
          </p>
        </>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 px-6 text-center text-sm text-slate-500">
          No readings in this time range yet. New readings are collected while the dashboard is open.
        </div>
      )}
    </section>
  );
}
