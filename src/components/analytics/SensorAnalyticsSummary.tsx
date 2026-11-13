import type { DeviceTelemetrySample, TimeRange } from '../../types/telemetry';
import {
  formatSensorValue,
  getSamplesInRange,
  isValidSensorValue,
  RAW_SENSOR_METRICS,
} from '../../utils/telemetry';

interface SensorAnalyticsSummaryProps {
  history: DeviceTelemetrySample[];
  range: TimeRange;
  theme: 'light' | 'dark';
}

export function SensorAnalyticsSummary({ history, range, theme }: SensorAnalyticsSummaryProps) {
  const samples = getSamplesInRange(history, range);
  const isDark = theme === 'dark';

  return (
    <section>
      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Calculated statistics</p>
        <h2 className={['mt-1 text-lg font-semibold', isDark ? 'text-slate-100' : 'text-slate-800'].join(' ')}>
          Sensor summary for the selected period
        </h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {RAW_SENSOR_METRICS.map((metric) => {
          const values = samples
            .map((sample) => sample[metric.key])
            .filter(isValidSensorValue);
          const average = values.length
            ? values.reduce((total, value) => total + value, 0) / values.length
            : null;
          const minimum = values.length ? Math.min(...values) : null;
          const maximum = values.length ? Math.max(...values) : null;
          const change = values.length > 1 ? values[values.length - 1] - values[0] : null;

          return (
            <article
              key={metric.key}
              className={[
                'rounded-2xl border p-4 shadow-sm',
                isDark ? 'border-slate-800 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-800',
              ].join(' ')}
            >
              <h3 className="text-sm font-semibold">{metric.label}</h3>
              <p className="mt-1 text-xs text-slate-500">{values.length} samples</p>
              <dl className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Average</dt>
                  <dd className="font-semibold">{average === null ? '—' : formatSensorValue(average, metric.unit)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Min / max</dt>
                  <dd className="text-right font-semibold">
                    {minimum === null || maximum === null
                      ? '—'
                      : `${formatSensorValue(minimum, metric.unit)} / ${formatSensorValue(maximum, metric.unit)}`}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Change</dt>
                  <dd className="font-semibold">
                    {change === null
                      ? '—'
                      : `${change > 0 ? '+' : ''}${formatSensorValue(change, metric.unit)}`}
                  </dd>
                </div>
              </dl>
            </article>
          );
        })}
      </div>
    </section>
  );
}
