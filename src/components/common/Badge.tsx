import type { ReactNode } from 'react';

interface BadgeProps {
  label: ReactNode;
  tone?: 'success' | 'warning' | 'info' | 'neutral';
}

const toneClassMap = {
  success: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-100 text-amber-700 ring-amber-200',
  info: 'bg-sky-100 text-sky-700 ring-sky-200',
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
};

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${toneClassMap[tone]}`}
    >
      {label}
    </span>
  );
}
