export type ViewMode = 'user-friendly' | 'analytics';
export type TimeRange = '24h' | '3d' | '7d';
export type NotificationType = 'success' | 'warning' | 'info';
export type RawSensorKey = 'temp' | 'humi' | 'lamp' | 'soil' | 'tank';

export interface TelemetryData {
  soilMoisture: number;
  temperatureC: number;
  airHumidity: number;
  lightLux: number;
}

export interface RawDeviceTelemetry {
  temp: number;
  humi: number;
  lamp: number;
  soil: number;
  tank: number;
  received_at: number;
}

export interface DeviceTelemetrySample extends RawDeviceTelemetry {
  timestampMs: number;
}

export interface RawSensorMetric {
  key: RawSensorKey;
  label: string;
  unit: string;
}

export interface NotificationState {
  message: string;
  type: NotificationType;
}

export type SensorTone = 'emerald' | 'amber' | 'sky' | 'slate';
