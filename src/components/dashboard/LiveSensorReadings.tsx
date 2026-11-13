import { RefreshCw, Radio } from 'lucide-react';

import type { DeviceTelemetrySample } from '../../types/telemetry';
import { formatSensorValue, isValidSensorValue, RAW_SENSOR_METRICS } from '../../utils/telemetry';

interface LiveSensorReadingsProps {
  latest: DeviceTelemetrySample | null;
  error: string | null;
  isLoading: boolean;
  onRefresh: () => void;
  theme: 'light' | 'dark';
}

export function LiveSensorReadings({
  latest,
  error,
  isLoading,
  onRefresh,
  theme,
}: LiveSensorReadingsProps) {
  const isDark = theme === 'dark';

  return (
    <section
      className={[
        'rounded-3xl border p-5 shadow-sm',
        isDark ? 'border-slate-800 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-800',
      ].join(' ')}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-emerald-600" />
            <h2 className="text-lg font-semibold">Live raw sensor readings</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">Latest packet from <code>/device/telemetry</code></p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className={[
            'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold disabled:opacity-60',
            isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50',
          ].join(' ')}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <p
          role={latest ? 'status' : 'alert'}
          className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700"
        >
          {latest ? `Latest data is shown; refresh issue: ${error}` : error}
        </p>
      )}

      {latest ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {RAW_SENSOR_METRICS.map((metric) => (
              <div
                key={metric.key}
                className={[
                  'rounded-2xl border p-3',
                  isDark ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50',
                ].join(' ')}
              >
                <p className="text-xs text-slate-500">{metric.label}</p>
                <p className="mt-1 text-lg font-bold">
                  {formatSensorValue(latest[metric.key], metric.unit)}
                </p>
                {!isValidSensorValue(latest[metric.key]) && (
                  <p className="mt-1 text-[10px] text-amber-600">Sensor read failure</p>
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Device sample received {new Date(latest.timestampMs).toLocaleString()}.
            Light, soil, and tank are unconverted ADC values.
          </p>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          {isLoading ? 'Loading the latest device packet...' : 'No device telemetry is available yet.'}
        </div>
      )}
    </section>
  );
}
