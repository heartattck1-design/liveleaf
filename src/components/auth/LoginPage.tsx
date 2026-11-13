import { ArrowRight, Eye, EyeOff, LockKeyhole, User } from 'lucide-react';
import { useState } from 'react';

import { BACKEND_BASE_URL } from '../../config';
import { getOptionalBearerHeaders, saveAccessToken } from '../../services/api';
import { LiveleafLogo } from '../layout/LiveleafLogo';

interface LoginPageProps {
  onLogin: (email: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Please enter both your user email and password.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getOptionalBearerHeaders(),
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { msg?: string; data?: { token?: string } }
        | null;

      if (!response.ok) {
        throw new Error(payload?.msg ?? 'Login request failed.');
      }

      const token = payload?.data?.token;
      if (!token) {
        throw new Error('Login response did not include an access token.');
      }

      saveAccessToken(token);

      setIsSubmitting(false);
      onLogin(email.trim());
    } catch (loginError) {
      const message = loginError instanceof Error ? loginError.message : 'Unable to reach the LiveLeaf backend.';
      setError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F7F5] px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <LiveleafLogo title="Liveleaf" subtitle="Smart Plant Care" />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              Sign In to Liveleaf
            </h1>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                User Email
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100">
                <User className="h-4 w-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  className="w-full border-0 bg-transparent py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100">
                <LockKeyhole className="h-4 w-4 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••••••"
                  className="w-full border-0 bg-transparent py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((current) => !current)}
                  className="rounded-full p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2D6A4F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1B4332] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In to Dashboard'}
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
