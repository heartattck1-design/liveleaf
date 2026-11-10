import {
  CloudRain,
  Droplets,
  SunMedium,
  Thermometer,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { SensorTone, TelemetryData } from '../../types/telemetry';
import { SensorCard } from './SensorCard';

interface SensorQuadGridProps {
  telemetry: TelemetryData;
}

type DashboardSensor = {
  title: string;
  value: number;
  unit: string;
  statusLabel: string;
  progress: number;
  tone: SensorTone;
  icon: LucideIcon;
};

export function SensorQuadGrid({ telemetry }: SensorQuadGridProps) {
  const sensors: DashboardSensor[] = [
    {
      title: 'Soil Moisture',
      value: telemetry.soilMoisture,
      unit: '%',
      statusLabel: telemetry.soilMoisture < 30 ? 'Crit Low' : telemetry.soilMoisture > 75 ? 'Saturated' : 'Optimal',
      progress: telemetry.soilMoisture,
      tone: telemetry.soilMoisture < 30 ? 'amber' : 'emerald',
      icon: Droplets,
    },
    {
      title: 'Temperature',
      value: telemetry.temperatureC,
      unit: '°C',
      statusLabel: telemetry.temperatureC > 30 ? 'Warm' : telemetry.temperatureC < 18 ? 'Cool' : 'Optimal',
      progress: Math.min((telemetry.temperatureC / 40) * 100, 100),
      tone: telemetry.temperatureC > 30 ? 'amber' : 'sky',
      icon: Thermometer,
    },
    {
      title: 'Air Humidity',
      value: telemetry.airHumidity,
      unit: '%',
      statusLabel: telemetry.airHumidity > 70 ? 'High' : telemetry.airHumidity < 30 ? 'Dry' : 'Optimal',
      progress: telemetry.airHumidity,
      tone: telemetry.airHumidity < 30 ? 'amber' : 'emerald',
      icon: CloudRain,
    },
    {
      title: 'Light Intensity',
      value: telemetry.lightLux,
      unit: 'Lux',
      statusLabel: telemetry.lightLux > 20000 ? 'High Sun' : telemetry.lightLux < 5000 ? 'Shade' : 'Sun',
      progress: Math.min((telemetry.lightLux / 25000) * 100, 100),
      tone: telemetry.lightLux > 20000 ? 'amber' : 'sky',
      icon: SunMedium,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sensors.map((sensor) => (
        <SensorCard
          key={sensor.title}
          title={sensor.title}
          value={sensor.value}
          unit={sensor.unit}
          statusLabel={sensor.statusLabel}
          progress={sensor.progress}
          tone={sensor.tone}
          icon={sensor.icon}
        />
      ))}
    </div>
  );
}
