import type { LucideIcon } from 'lucide-react';

import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import type { SensorTone } from '../../types/telemetry';

interface SensorCardProps {
  title: string;
  value: number;
  unit: string;
  statusLabel: string;
  progress: number;
  tone: SensorTone;
  icon: LucideIcon;
}

export function SensorCard({
  title,
  value,
  unit,
  statusLabel,
  progress,
  tone,
  icon: Icon,
}: SensorCardProps) {
  const badgeTone = tone === 'amber' ? 'warning' : tone === 'sky' ? 'info' : 'success';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Icon size={18} />
          </div>
          <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        </div>
        <Badge label={statusLabel} tone={badgeTone} />
      </div>

      <div className="flex items-end gap-1">
        <p className="text-2xl font-bold text-slate-800">
          {value.toLocaleString(undefined, { maximumFractionDigits: value < 100 ? 1 : 0 })}
        </p>
        <span className="pb-1 text-xs font-medium text-slate-500">{unit}</span>
      </div>

      <div className="mt-4">
        <ProgressBar value={progress} tone={tone} />
      </div>
    </div>
  );
}
