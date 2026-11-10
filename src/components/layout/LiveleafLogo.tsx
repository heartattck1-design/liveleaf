type LiveleafLogoProps = {
  title?: string;
  subtitle?: string;
};

export function LiveleafLogo({
  title = 'Liveleaf',
  subtitle = 'Smart Plant Care',
}: LiveleafLogoProps) {
  return (
    <div className="flex items-center gap-2.5 min-w-0 flex-shrink-0">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shadow-sm ring-1 ring-emerald-200 sm:h-9 sm:w-9">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 sm:h-5 sm:w-5"
          aria-hidden="true"
        >
          <path
            d="M12 2.5C8.5 5.3 7.2 8.1 7.2 10.8c0 3 2.3 5.2 4.8 5.2s4.8-2.2 4.8-5.2c0-2.7-1.3-5.5-4.8-8.3Zm0 9.4c-1.3 0-2.3-1-2.3-2.2 0-1.5 1.7-3.1 2.3-3.9.6.8 2.3 2.4 2.3 3.9 0 1.2-1 2.2-2.3 2.2Z"
            fill="currentColor"
          />
          <path
            d="M12 12.2c-2.6 0-4.7 2-4.7 4.5 0 1.7 1.2 3.1 3.1 3.6.7.2 1.4.3 1.6.3.2 0 .9-.1 1.6-.3 1.9-.5 3.1-1.9 3.1-3.6 0-2.5-2.1-4.5-4.7-4.5Zm-1.8 4.5c.6.5 1.2.7 1.8.7s1.2-.2 1.8-.7c-.5.9-1.2 1.4-1.8 1.4-.6 0-1.3-.5-1.8-1.4Z"
            fill="currentColor"
            opacity="0.9"
          />
        </svg>
      </div>

      <div className="leading-none">
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-emerald-700/85 sm:text-[10px]">
          {title}
        </p>
        <p className="mt-0.5 text-[8px] font-medium text-slate-500 sm:text-[9px]">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
