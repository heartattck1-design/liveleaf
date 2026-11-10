import { MoonStar, RotateCcw, Radio, SunMedium } from 'lucide-react';

import { LiveleafLogo } from './LiveleafLogo';

interface HeaderBarProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isStreaming: boolean;
  onReset: () => void;
  onToggleStream: () => void;
  onSignOut: () => void;
}

export function HeaderBar({
  theme,
  onToggleTheme,
  isStreaming,
  onReset,
  onToggleStream,
  onSignOut,
}: HeaderBarProps) {
  const isDark = theme === 'dark';

  return (
    <header
      className={[
        'flex items-center justify-between gap-4 rounded-3xl px-4 py-3 shadow-sm backdrop-blur-sm sm:px-5',
        isDark
          ? 'border border-slate-700 bg-slate-900/80 text-slate-100'
          : 'border border-slate-200 bg-white/80 text-slate-800',
      ].join(' ')}
    >
      <div className="flex min-w-0 flex-shrink-0 items-center">
        <LiveleafLogo />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleTheme}
          className={[
            'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition',
            isDark
              ? 'border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700'
              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100',
          ].join(' ')}
        >
          {isDark ? <SunMedium size={15} /> : <MoonStar size={15} />}
          {isDark ? 'Light Mode' : 'Night Mode'}
        </button>

        <button
          type="button"
          onClick={onToggleStream}
          className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${isStreaming ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.9)]' : 'bg-slate-400'}`}
          />
          {isStreaming ? 'Stream Active' : 'Stream Paused'}
        </button>

        <button
          type="button"
          onClick={onReset}
          className={[
            'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition',
            isDark
              ? 'border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700'
              : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100',
          ].join(' ')}
        >
          <RotateCcw size={15} />
          Reset Baseline
        </button>

        <button
          type="button"
          onClick={onSignOut}
          className={[
            'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition',
            isDark
              ? 'border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700'
              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
          ].join(' ')}
        >
          Sign Out
        </button>

        <div
          className={[
            'hidden items-center gap-2 rounded-full px-2.5 py-1.5 md:flex',
            isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500',
          ].join(' ')}
        >
          <Radio size={14} />
          <span className="text-xs font-medium">Live</span>
        </div>
      </div>
    </header>
  );
}
