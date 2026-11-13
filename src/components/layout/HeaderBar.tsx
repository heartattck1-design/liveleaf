import { MoonStar, RotateCcw, Radio, Settings2, SunMedium, UserRound } from 'lucide-react';

import { LiveleafLogo } from './LiveleafLogo';

interface HeaderBarProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isStreaming: boolean;
  onReset: () => void;
  onToggleStream: () => void;
  onSignOut: () => void;
  onOpenSettings: () => void;
  userName?: string;
  planTier?: string;
  avatarUrl?: string;
  appIconUrl?: string;
}

export function HeaderBar({
  theme,
  onToggleTheme,
  isStreaming,
  onReset,
  onToggleStream,
  onSignOut,
  onOpenSettings,
  userName,
  planTier,
  avatarUrl,
  appIconUrl,
}: HeaderBarProps) {
  const isDark = theme === 'dark';

  return (
    <header
      className={[
        'flex flex-col gap-4 rounded-3xl p-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-5',
        isDark
          ? 'border border-slate-700 bg-slate-900/80 text-slate-100'
          : 'border border-slate-200 bg-white/80 text-slate-800',
      ].join(' ')}
    >
      <div className="flex flex-wrap items-center gap-4">
        <LiveleafLogo iconSrc={appIconUrl} />
        {userName && (
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-emerald-700">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <UserRound className="h-5 w-5" />
              )}
            </div>
            <span className={['text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-600'].join(' ')}>
              Welcome back, <strong className={isDark ? 'text-emerald-400' : 'text-emerald-700'}>{userName}</strong>! 🌿
            </span>
            {planTier && (
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 border border-emerald-500/20">
                {planTier}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Open profile and plant settings"
          title="Profile and plant settings"
          className={[
            'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition',
            isDark
              ? 'border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
          ].join(' ')}
        >
          <Settings2 size={15} />
          <span className="hidden sm:inline">Settings</span>
        </button>

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
