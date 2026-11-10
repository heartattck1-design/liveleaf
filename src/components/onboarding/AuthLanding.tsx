import { ArrowRight, LogIn, UserPlus } from 'lucide-react';

import { LiveleafLogo } from '../layout/LiveleafLogo';

interface AuthLandingProps {
  onShowLogin: () => void;
  onShowSignup: () => void;
}

export function AuthLanding({ onShowLogin, onShowSignup }: AuthLandingProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F7F5] px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
        <div className="mb-8 flex justify-center">
          <LiveleafLogo title="Liveleaf" subtitle="Smart Plant Care" />
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={onShowLogin}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2D6A4F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1B4332]"
          >
            <LogIn className="h-4 w-4" />
            Login
          </button>

          <button
            type="button"
            onClick={onShowSignup}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <UserPlus className="h-4 w-4" />
            Sign Up
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <span>Smart plant care</span>
          <ArrowRight className="h-3.5 w-3.5" />
          <span>Personalized health</span>
        </div>
      </div>
    </div>
  );
}
