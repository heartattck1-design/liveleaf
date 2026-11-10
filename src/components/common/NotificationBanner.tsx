import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

import type { NotificationState } from '../../types/telemetry';

interface NotificationBannerProps {
  message: string;
  type: NotificationState['type'];
  onDismiss: () => void;
}

const toneMap = {
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    icon: 'bg-emerald-500 text-white',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    icon: 'bg-amber-500 text-white',
  },
  info: {
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-800',
    icon: 'bg-sky-500 text-white',
  },
};

export function NotificationBanner({ message, type, onDismiss }: NotificationBannerProps) {
  const tone = toneMap[type];

  return (
    <div
      className={`mt-4 flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 shadow-sm ${tone.bg} ${tone.border}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-full ${tone.icon}`}>
          {type === 'warning' ? <AlertTriangle size={18} /> : type === 'success' ? <CheckCircle2 size={18} /> : <Info size={18} />}
        </div>
        <p className={`text-sm font-medium ${tone.text}`}>{message}</p>
      </div>

      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={onDismiss}
        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-slate-700"
      >
        <X size={16} />
      </button>
    </div>
  );
}
