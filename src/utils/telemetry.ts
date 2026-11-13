import type { DeviceTelemetrySample, RawSensorMetric, TimeRange } from '../types/telemetry';

export const RAW_SENSOR_METRICS: RawSensorMetric[] = [
  { key: 'temp', label: 'Temperature', unit: '°C' },
  { key: 'humi', label: 'Air humidity', unit: '%' },
  { key: 'lamp', label: 'Light sensor', unit: 'ADC' },
  { key: 'soil', label: 'Soil sensor', unit: 'ADC' },
  { key: 'tank', label: 'Water level', unit: 'ADC' },
];

export const TIME_RANGE_OPTIONS: { value: TimeRange; label: string; durationMs: number }[] = [
  { value: '24h', label: '24 hours', durationMs: 24 * 60 * 60 * 1000 },
  { value: '3d', label: '3 days', durationMs: 3 * 24 * 60 * 60 * 1000 },
  { value: '7d', label: '7 days', durationMs: 7 * 24 * 60 * 60 * 1000 },
];

export function getSamplesInRange(
  samples: DeviceTelemetrySample[],
  range: TimeRange,
  now = Date.now(),
): DeviceTelemetrySample[] {
  const selectedRange = TIME_RANGE_OPTIONS.find((option) => option.value === range);
  if (!selectedRange) {
    return [];
  }

  const startTime = now - selectedRange.durationMs;
  return samples.filter((sample) => sample.timestampMs >= startTime && sample.timestampMs <= now);
}

export function formatSensorValue(value: number, unit: string): string {
  const formatted = value.toLocaleString(undefined, {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 1,
  });
  return `${formatted}${unit === '°C' ? unit : ` ${unit}`}`;
}

export function isValidSensorValue(value: number): boolean {
  return Number.isFinite(value) && value !== -1;
}

export function toTimestampMs(timestamp: number): number {
  return timestamp < 1_000_000_000_000 ? timestamp * 1000 : timestamp;
}
