import { ArrowRight, Calendar, LockKeyhole, Mail, Target, User } from 'lucide-react';
import { useState } from 'react';

import { BACKEND_BASE_URL } from '../../config';
import { getOptionalBearerHeaders, saveAccessToken } from '../../services/api';
import { LiveleafLogo } from '../layout/LiveleafLogo';
import { type UserProfile } from './OnboardingState';

interface SignUpWizardProps {
  onComplete: (user: UserProfile) => void;
}

export function SignUpWizard({ onComplete }: SignUpWizardProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    plantingGoal: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      };

      const response = await fetch(`${BACKEND_BASE_URL}/user/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getOptionalBearerHeaders(),
        },
        body: JSON.stringify(payload),
      });

      const responseData = (await response.json().catch(() => null)) as
        | { msg?: string; message?: string; data?: { token?: string } }
        | null;

      if (!response.ok) {
        const backendMessage = responseData?.msg ?? responseData?.message ?? 'Failed to create account.';
        throw new Error(backendMessage);
      }

      const token = responseData?.data?.token;
      if (!token) {
        throw new Error('Signup response did not include an access token.');
      }
      saveAccessToken(token);

      onComplete({
        ...formData,
        experience: 'Beginner',
        planTier: 'Free',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F7F5] px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-8 flex justify-center">
          <LiveleafLogo title="Liveleaf" subtitle="Create Account" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Full Name</label>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3">
              <User className="h-4 w-4 text-slate-400" />
              <input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-transparent py-3 text-sm text-slate-700 outline-none"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email Address</label>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3">
              <Mail className="h-4 w-4 text-slate-400" />
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-transparent py-3 text-sm text-slate-700 outline-none"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3">
              <LockKeyhole className="h-4 w-4 text-slate-400" />
              <input
                required
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-transparent py-3 text-sm text-slate-700 outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Age</label>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3">
                <Calendar className="h-4 w-4 text-slate-400" />
                <input
                  required
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full bg-transparent py-3 text-sm text-slate-700 outline-none"
                  placeholder="25"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Planting purpose</label>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3">
                <Target className="h-4 w-4 text-slate-400" />
                <input
                  required
                  value={formData.plantingGoal}
                  onChange={(e) => setFormData({ ...formData, plantingGoal: e.target.value })}
                  className="w-full bg-transparent py-3 text-sm text-slate-700 outline-none"
                  placeholder="Gardening"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2D6A4F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1B4332] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Creating...' : 'Create Account'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
