import { Leaf, Pencil } from 'lucide-react';

import type { PlantCareRange, PlantProfile } from '../../types/plant';

interface PlantCareProfileCardProps {
  plant: PlantProfile | null;
  theme: 'light' | 'dark';
  onEdit: () => void;
}

function getRangeLabel(range: PlantCareRange): string {
  if (range.minimum !== undefined && range.maximum !== undefined) {
    return `${range.minimum}–${range.maximum} ${range.unit}`;
  }
  if (range.minimum !== undefined) return `Min ${range.minimum} ${range.unit}`;
  if (range.maximum !== undefined) return `Max ${range.maximum} ${range.unit}`;
  return 'Range not provided';
}

function getRecommendedLabel(range: PlantCareRange): string {
  return range.idealRange ?? range.recommendation ?? 'No recommendation provided';
}

export function PlantCareProfileCard({ plant, theme, onEdit }: PlantCareProfileCardProps) {
  const isDark = theme === 'dark';
  const rangeValueClass = isDark ? 'text-slate-200' : 'text-slate-700';

  return (
    <section
      className={[
        'rounded-3xl border p-5 shadow-sm',
        isDark ? 'border-slate-800 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-800',
      ].join(' ')}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
            <Leaf className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Plant profile</p>
            <h2 className="text-lg font-bold">{plant?.commonName || 'No plant identified yet'}</h2>
            {plant?.scientificName && <p className="text-sm italic text-slate-500">{plant.scientificName}</p>}
          </div>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className={[
            'inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition',
            isDark ? 'border-slate-700 bg-slate-800 hover:bg-slate-700' : 'border-slate-200 bg-slate-50 hover:bg-slate-100',
          ].join(' ')}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit profile
        </button>
      </div>

      {plant ? (
        <>
          {(plant.species || plant.plantType || plant.confidence) && (
            <p className="mb-4 text-xs text-slate-500">
              {[plant.species, plant.plantType, plant.confidence ? `${plant.confidence} confidence` : undefined]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Water / soil moisture', range: plant.care.soilMoisture },
              { label: 'Temperature', range: plant.care.temperature },
              { label: 'Air humidity', range: plant.care.airHumidity },
              { label: 'Light', range: plant.care.light },
            ].map(({ label, range }) => (
              <article
                key={label}
                className={[
                  'rounded-2xl border p-4',
                  isDark ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50',
                ].join(' ')}
              >
                <h3 className="text-sm font-semibold">{label}</h3>
                <p className="mt-2 text-xs text-slate-500">
                  Min–max: <span className={`font-semibold ${rangeValueClass}`}>{getRangeLabel(range)}</span>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Recommended: <span className={`font-semibold ${rangeValueClass}`}>{getRecommendedLabel(range)}</span>
                </p>
                {range.guidance && <p className="mt-2 text-xs leading-5 text-slate-500">{range.guidance}</p>}
              </article>
            ))}
          </div>

          {plant.recommendations.length > 0 && (
            <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <h3 className="text-sm font-semibold text-emerald-700">Care recommendations</h3>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                {plant.recommendations.map((recommendation, index) => (
                  <li key={`${index}-${recommendation}`} className="flex gap-2">
                    <span className="text-emerald-600">•</span>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-slate-500">
          Identify a plant to show its care ranges and recommendations here.
        </p>
      )}
    </section>
  );
}
