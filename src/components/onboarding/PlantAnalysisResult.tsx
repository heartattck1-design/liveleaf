import { ArrowRight, Leaf } from 'lucide-react';

import type { PlantAnalysisResponse } from '../../types/plantAnalysis';

interface PlantAnalysisResultProps {
  result: PlantAnalysisResponse;
  onContinue: () => void;
}

function formatReading(value: number | null, unit: string): string {
  return value === null ? 'No reading' : `${value} ${unit}`;
}

function formatSensorValue(value: unknown): string {
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return JSON.stringify(value) ?? 'Unavailable';
}

export function PlantAnalysisResult({ result, onContinue }: PlantAnalysisResultProps) {
  const { analysis } = result;
  const identification = analysis.plant_identification;
  const environment = analysis.environment_analysis;
  const requirements = analysis.environment_requirements;
  const schedule = analysis.monitoring_schedule;
  const environmentRows = [
    {
      label: 'Temperature',
      reading: formatReading(environment.temperature.current_celsius, '°C'),
      status: environment.temperature.status,
      ideal: requirements.temperature.ideal_range,
      limits: `${requirements.temperature.minimum_celsius}–${requirements.temperature.maximum_celsius} °C`,
    },
    {
      label: 'Soil moisture',
      reading: formatReading(environment.soil_moisture.current_percent, '%'),
      status: environment.soil_moisture.status,
      ideal: requirements.soil_moisture.ideal_range,
      limits: `${requirements.soil_moisture.minimum_percent}–${requirements.soil_moisture.maximum_percent}%`,
    },
    {
      label: 'Air humidity',
      reading: formatReading(environment.air_humidity.current_percent, '%'),
      status: environment.air_humidity.status,
      ideal: requirements.air_humidity.ideal_range,
      limits: `${requirements.air_humidity.minimum_percent}–${requirements.air_humidity.maximum_percent}%`,
    },
  ];

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <Leaf className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Plant identified</p>
            <h2 className="mt-1 text-xl font-bold text-slate-800">{identification.common_name}</h2>
            <p className="text-sm italic text-slate-600">{identification.scientific_name}</p>
            <p className="mt-1 text-xs text-slate-500">
              {identification.species} · {identification.plant_type} · confidence {identification.confidence}
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-700">{analysis.summary}</p>
        <p className="mt-2 text-xs text-slate-500">
          Device status: {result.device_status}. {result.msg}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 p-4">
        <h3 className="mb-3 text-sm font-bold text-slate-800">Health and environment</h3>
        <div className="mb-3 rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Plant condition</p>
          <p className="font-semibold text-slate-800">
            {analysis.health_analysis.condition}
            {' · '}
            {analysis.health_analysis.possible_disease}
            {' · '}
            {analysis.health_analysis.disease_confidence} disease confidence
          </p>
          <p className="mt-1 text-xs text-slate-600">
            {analysis.health_analysis.symptoms.length > 0
              ? analysis.health_analysis.symptoms.join(', ')
              : 'No symptoms reported.'}
          </p>
        </div>

        <div className="space-y-2">
          {environmentRows.map((row) => (
            <div key={row.label} className="grid grid-cols-[1fr_auto] gap-3 rounded-xl border border-slate-100 p-3 sm:grid-cols-[1fr_auto_auto]">
              <span className="text-sm font-medium text-slate-700">{row.label}</span>
              <span className="text-sm text-slate-800">{row.reading}</span>
              <span className="text-xs text-slate-500 sm:text-right">
                {row.status} · ideal {row.ideal} · limits {row.limits}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500">{environment.overall_condition}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-4">
          <h3 className="mb-3 text-sm font-bold text-slate-800">Monitoring schedule</h3>
          <dl className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between gap-2">
              <dt>Normal full sensor cycle</dt>
              <dd className="font-semibold">{schedule.normal_conditions.complete_cycle_interval_minutes} min</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Temperature checks</dt>
              <dd className="font-semibold">{schedule.normal_conditions.temperature_interval_minutes} min</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Soil moisture checks</dt>
              <dd className="font-semibold">{schedule.normal_conditions.soil_moisture_interval_minutes} min</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Air humidity checks</dt>
              <dd className="font-semibold">{schedule.normal_conditions.air_humidity_interval_minutes} min</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Abnormal conditions</dt>
              <dd className="font-semibold">{schedule.abnormal_conditions.recommended_interval_minutes} min</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Plant health issues</dt>
              <dd className="font-semibold">{schedule.plant_health_issues.recommended_interval_minutes} min</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs leading-5 text-slate-500">{schedule.abnormal_conditions.reason}</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">{schedule.plant_health_issues.reason}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4">
          <h3 className="mb-3 text-sm font-bold text-slate-800">Alert conditions</h3>
          <ul className="space-y-2 text-xs text-slate-600">
            {schedule.alert_conditions.map((condition) => (
              <li key={condition} className="flex gap-2">
                <span className="text-amber-600">•</span>
                <span>{condition}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 p-4">
        <h3 className="mb-3 text-sm font-bold text-slate-800">Care recommendations</h3>
        <ul className="space-y-2 text-sm text-slate-700">
          {analysis.recommendations.map((recommendation) => (
            <li key={recommendation} className="flex gap-2">
              <span className="text-emerald-600">•</span>
              <span>{recommendation}</span>
            </li>
          ))}
          <li className="flex gap-2">
            <span className="text-emerald-600">•</span>
            <span>
              Watering guidance: {requirements.soil_moisture.watering_guidance}
            </span>
          </li>
        </ul>
      </div>

      {analysis.reference_images.length > 0 && (
        <div className="rounded-2xl border border-slate-200 p-4">
          <h3 className="mb-3 text-sm font-bold text-slate-800">Reference images</h3>
          <div className="grid grid-cols-2 gap-3">
            {analysis.reference_images.map((image, index) => (
              <img
                key={`${image}-${index}`}
                src={image}
                alt={`${identification.common_name} reference ${index + 1}`}
                className="h-32 w-full rounded-xl object-cover"
              />
            ))}
          </div>
        </div>
      )}

      <details className="rounded-2xl border border-slate-200 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-slate-700">Sensor data used</summary>
        {Object.keys(result.sensor_data_used).length > 0 ? (
          <dl className="mt-3 space-y-2 text-xs">
            {Object.entries(result.sensor_data_used).map(([key, value]) => (
              <div key={key} className="flex justify-between gap-3">
                <dt className="text-slate-500">{key}</dt>
                <dd className="break-all text-right text-slate-700">{formatSensorValue(value)}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-3 text-xs text-slate-500">No sensor readings were included in this analysis.</p>
        )}
      </details>

      <button
        type="button"
        onClick={onContinue}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2D6A4F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1B4332]"
      >
        Continue to ESP32 connection
        <ArrowRight className="h-4 w-4" />
      </button>
    </section>
  );
}
