import { AlertTriangle, Leaf } from 'lucide-react';

import type { TelemetryData } from '../../types/telemetry';

interface HeroStatusCardProps {
  telemetry: TelemetryData;
}

export function HeroStatusCard({ telemetry }: HeroStatusCardProps) {
  const needsImmediateAttention = telemetry.soilMoisture < 30 || telemetry.temperatureC > 30;

  const cardClasses = needsImmediateAttention
    ? 'border-amber-200 bg-amber-50 text-amber-900'
    : 'border-emerald-200 bg-emerald-50 text-emerald-900';

  const accentClasses = needsImmediateAttention
    ? 'bg-amber-500 text-white'
    : 'bg-emerald-500 text-white';

  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${cardClasses}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accentClasses}`}>
            {needsImmediateAttention ? <AlertTriangle size={22} /> : <Leaf size={22} />}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-75">
              Plant Health
            </p>
            <h2 className="mt-1 text-2xl font-bold">
              {needsImmediateAttention ? 'Plant Needs Water Immediately' : 'Plant Is Thriving'}
            </h2>
          </div>
        </div>

        <div className={`rounded-full px-3 py-1 text-xs font-semibold ${accentClasses}`}>
          {needsImmediateAttention ? 'Warning' : 'Optimal'}
        </div>
      </div>

      <p className="mt-4 max-w-xl text-sm opacity-80">
        {needsImmediateAttention
          ? 'Soil moisture is under stress and temperature is elevated. Immediate hydration is recommended.'
          : 'All primary metrics are in a healthy range with steady growth conditions.'}
      </p>
    </div>
  );
}
