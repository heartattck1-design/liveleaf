interface ModeSwitcherProps {
  activeTab: 'user-friendly' | 'analytics';
  onChange: (tab: 'user-friendly' | 'analytics') => void;
  theme: 'light' | 'dark';
}

export function ModeSwitcher({ activeTab, onChange, theme }: ModeSwitcherProps) {
  const isDark = theme === 'dark';

  return (
    <div
      className={[
        'mt-5 flex items-center justify-center rounded-full border p-1 shadow-sm',
        isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white',
      ].join(' ')}
    >
      <button
        type="button"
        onClick={() => onChange('user-friendly')}
        className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
          activeTab === 'user-friendly'
            ? isDark
              ? 'bg-slate-100 text-slate-900 shadow-sm'
              : 'bg-slate-900 text-white shadow-sm'
            : isDark
              ? 'text-slate-300 hover:bg-slate-800'
              : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        User-Friendly Mode
      </button>

      <button
        type="button"
        onClick={() => onChange('analytics')}
        className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
          activeTab === 'analytics'
            ? isDark
              ? 'bg-slate-100 text-slate-900 shadow-sm'
              : 'bg-slate-900 text-white shadow-sm'
            : isDark
              ? 'text-slate-300 hover:bg-slate-800'
              : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        Advanced Analytics
      </button>
    </div>
  );
}
