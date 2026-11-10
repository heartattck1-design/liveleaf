import type { SensorTone } from '../../types/telemetry';

interface ProgressBarProps {
  value: number;
  tone?: SensorTone;
}

const toneClassMap: Record<SensorTone, string> = {
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  sky: 'bg-sky-500',
  slate: 'bg-slate-500',
};

export function ProgressBar({ value, tone = 'emerald' }: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(value, 100));

  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
      <div
        className={`h-full rounded-full transition-all duration-300 ${toneClassMap[tone]}`}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}
