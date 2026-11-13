import { useState, type FormEvent, type ChangeEvent } from 'react';
import { ArrowLeft, ImagePlus, Save, UserRound } from 'lucide-react';

import type { UserProfile } from '../onboarding/OnboardingState';
import type { PlantCareRange, PlantProfile } from '../../types/plant';

interface ProfileSettingsPageProps {
  user: UserProfile;
  plant: PlantProfile | null;
  onSave: (user: UserProfile, plant: PlantProfile | null) => void;
  onCancel: () => void;
}

const imageLimitBytes = 1024 * 1024;

export function ProfileSettingsPage({ user, plant, onSave, onCancel }: ProfileSettingsPageProps) {
  const [draftUser, setDraftUser] = useState(user);
  const [draftPlant, setDraftPlant] = useState(plant);
  const [error, setError] = useState('');

  const updatePlantRange = (
    category: keyof PlantProfile['care'],
    changes: Partial<PlantCareRange>,
  ) => {
    setDraftPlant((current) =>
      current
        ? {
            ...current,
            care: {
              ...current.care,
              [category]: { ...current.care[category], ...changes },
            },
          }
        : current,
    );
  };

  const handleImageChange = (
    field: 'avatarDataUrl' | 'appIconDataUrl',
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Choose an image file.');
      event.target.value = '';
      return;
    }
    if (file.size > imageLimitBytes) {
      setError('Profile and app images must be 1 MB or smaller.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setError('Could not read the selected image.');
        return;
      }
      setDraftUser((current) => ({ ...current, [field]: reader.result as string }));
      setError('');
    };
    reader.onerror = () => setError('Could not read the selected image.');
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (draftPlant) {
      const ranges = Object.entries(draftPlant.care);
      for (const [key, range] of ranges) {
        if (range.minimum !== undefined && range.maximum !== undefined && range.minimum > range.maximum) {
          setError(`${key} minimum must not exceed its maximum.`);
          return;
        }
      }
    }

    setError('');
    onSave(draftUser, draftPlant);
  };

  const careItems = draftPlant
    ? [
        { key: 'soilMoisture' as const, label: 'Water / soil moisture', note: 'Watering guidance' },
        { key: 'temperature' as const, label: 'Temperature', note: null },
        { key: 'airHumidity' as const, label: 'Air humidity', note: null },
        { key: 'light' as const, label: 'Light', note: 'Light recommendation' },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#F4F7F5] px-4 py-8 text-slate-800">
      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              aria-label="Back to dashboard"
              className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Settings</p>
              <h1 className="text-2xl font-bold">Profile and plant settings</h1>
            </div>
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            <Save className="h-4 w-4" />
            Save
          </button>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold">Account profile</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="profile-name" className="text-sm font-medium">Name</label>
              <input
                id="profile-name"
                required
                value={draftUser.name}
                onChange={(event) => setDraftUser((current) => ({ ...current, name: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="profile-email" className="text-sm font-medium">Email</label>
              <input
                id="profile-email"
                type="email"
                required
                value={draftUser.email}
                onChange={(event) => setDraftUser((current) => ({ ...current, email: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="profile-age" className="text-sm font-medium">Age</label>
              <input
                id="profile-age"
                value={draftUser.age}
                onChange={(event) => setDraftUser((current) => ({ ...current, age: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="profile-experience" className="text-sm font-medium">Gardening experience</label>
              <input
                id="profile-experience"
                value={draftUser.experience}
                onChange={(event) => setDraftUser((current) => ({ ...current, experience: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="profile-goal" className="text-sm font-medium">Planting goal</label>
              <textarea
                id="profile-goal"
                rows={2}
                value={draftUser.plantingGoal}
                onChange={(event) => setDraftUser((current) => ({ ...current, plantingGoal: event.target.value }))}
                className="mt-1 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold">Appearance</h2>
          <p className="mt-1 text-xs text-slate-500">Images are saved in this browser (maximum 1 MB each).</p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold">Profile photo</h3>
              <div className="my-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-emerald-700">
                {draftUser.avatarDataUrl ? (
                  <img src={draftUser.avatarDataUrl} alt="Profile preview" className="h-full w-full object-cover" />
                ) : (
                  <UserRound className="h-8 w-8" />
                )}
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold">
                <ImagePlus className="h-4 w-4" />
                Choose photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleImageChange('avatarDataUrl', event)}
                  className="sr-only"
                />
              </label>
              {draftUser.avatarDataUrl && (
                <button
                  type="button"
                  onClick={() => setDraftUser((current) => ({ ...current, avatarDataUrl: undefined }))}
                  className="ml-2 text-xs text-rose-600"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold">App icon</h3>
              <div className="my-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-emerald-100 text-emerald-700">
                {draftUser.appIconDataUrl ? (
                  <img src={draftUser.appIconDataUrl} alt="App icon preview" className="h-full w-full object-cover" />
                ) : (
                  <ImagePlus className="h-8 w-8" />
                )}
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold">
                <ImagePlus className="h-4 w-4" />
                Choose icon
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleImageChange('appIconDataUrl', event)}
                  className="sr-only"
                />
              </label>
              {draftUser.appIconDataUrl && (
                <button
                  type="button"
                  onClick={() => setDraftUser((current) => ({ ...current, appIconDataUrl: undefined }))}
                  className="ml-2 text-xs text-rose-600"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold">Plant care ranges</h2>
          <p className="mt-1 text-xs text-slate-500">
            {draftPlant
              ? `Edit care targets for ${draftPlant.commonName}.`
              : 'Identify a plant to add its care ranges here.'}
          </p>
          {draftPlant && (
            <div className="mt-5 space-y-5">
              {careItems.map(({ key, label, note }) => {
                const range = draftPlant.care[key];
                return (
                  <div key={key} className="rounded-2xl border border-slate-100 p-4">
                    <h3 className="mb-3 text-sm font-semibold">{label}</h3>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <label className="text-xs text-slate-500">
                        Minimum ({range.unit})
                        <input
                          type="number"
                          value={range.minimum ?? ''}
                          onChange={(event) =>
                            updatePlantRange(key, {
                              minimum: event.target.value === '' ? undefined : Number(event.target.value),
                            })
                          }
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800"
                        />
                      </label>
                      <label className="text-xs text-slate-500">
                        Maximum ({range.unit})
                        <input
                          type="number"
                          value={range.maximum ?? ''}
                          onChange={(event) =>
                            updatePlantRange(key, {
                              maximum: event.target.value === '' ? undefined : Number(event.target.value),
                            })
                          }
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800"
                        />
                      </label>
                      <label className="text-xs text-slate-500">
                        Recommended range
                        <input
                          value={range.idealRange ?? ''}
                          onChange={(event) => updatePlantRange(key, { idealRange: event.target.value || undefined })}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800"
                        />
                      </label>
                    </div>
                    {note && (
                      <label className="mt-3 block text-xs text-slate-500">
                        {note}
                        <textarea
                          rows={2}
                          value={key === 'soilMoisture' ? range.guidance ?? '' : range.recommendation ?? ''}
                          onChange={(event) =>
                            updatePlantRange(
                              key,
                              key === 'soilMoisture'
                                ? { guidance: event.target.value || undefined }
                                : { recommendation: event.target.value || undefined },
                            )
                          }
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800"
                        />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {error && (
          <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            <Save className="h-4 w-4" />
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}
