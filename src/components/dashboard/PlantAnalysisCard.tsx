import { useCallback, useEffect, useState } from 'react';
import { Activity, CheckCircle2, RefreshCw } from 'lucide-react';

import { fetchPlantMetrics, type PlantMetricsResponse } from '../../services/api';

interface PlantAnalysisCardProps {
  theme: 'light' | 'dark';
}

export function PlantAnalysisCard({ theme }: PlantAnalysisCardProps) {
  const isDark = theme === 'dark';
  const [metrics, setMetrics] = useState<PlantMetricsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setMetrics(await fetchPlantMetrics());
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not fetch plant analysis from the server.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load server analysis when this card is first shown.
    // oxlint-disable-next-line react/set-state-in-effect
    void loadMetrics();
  }, [loadMetrics]);

  return (
    <section
      className={[
        'rounded-3xl border p-5 shadow-sm',
        isDark ? 'border-slate-800 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-800',
      ].join(' ')}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Plant Analysis</h2>
            <p className="text-xs text-slate-500">
              Endpoint: <code className="font-mono text-emerald-500">/plant/analysis/metrics</code>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void loadMetrics()}
          disabled={isLoading}
          aria-label="Refresh plant analysis"
          className={[
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60',
            isDark ? 'border-slate-700 bg-slate-800 hover:bg-slate-700' : 'border-slate-200 bg-slate-50 hover:bg-slate-100',
          ].join(' ')}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700">
          Could not load plant analysis: {error}
        </p>
      )}

      {metrics ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Species</span>
              <h3 className="text-base font-bold">{metrics.commonName || 'Smart Plant'}</h3>
              <p className="text-xs italic text-slate-400">{metrics.scientificName || 'Plantae'}</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {metrics.status || 'Healthy'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Soil Moisture', value: metrics.soilMoisture, unit: '%' },
              { label: 'Temperature', value: metrics.temperatureC, unit: '°C' },
              { label: 'Air Humidity', value: metrics.airHumidity, unit: '%' },
              { label: 'Light Intensity', value: metrics.lightLux, unit: ' lx' },
            ].map((item) => (
              <div
                key={item.label}
                className={[
                  'rounded-2xl border p-3',
                  isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-100 bg-slate-50',
                ].join(' ')}
              >
                <span className="text-xs text-slate-500">{item.label}</span>
                <p className="mt-1 text-xl font-black text-emerald-500">
                  {item.value ?? '—'}{item.value === undefined ? '' : item.unit}
                </p>
              </div>
            ))}
          </div>

          {metrics.recommendations && metrics.recommendations.length > 0 && (
            <div className="rounded-2xl border border-slate-700/40 p-4">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-500">AI Recommendations</h3>
              <ul className="space-y-1.5 text-xs">
                {metrics.recommendations.map((recommendation, index) => (
                  <li key={`${index}-${recommendation}`} className="flex items-start gap-2">
                    <span className="text-emerald-500">•</span>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        !error && (
          <div className="py-12 text-center text-sm text-slate-400">
            {isLoading ? 'Loading plant analysis...' : 'No plant analysis data available.'}
          </div>
        )
      )}
    </section>
  );
}
