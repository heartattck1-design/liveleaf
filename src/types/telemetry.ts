export type ViewMode = 'user-friendly' | 'analytics';
export type TimeRange = '24h' | '7d' | '30d';
export type NotificationType = 'success' | 'warning' | 'info';

export interface TelemetryData {
  soilMoisture: number;
  temperatureC: number;
  airHumidity: number;
  lightLux: number;
}

export interface NotificationState {
  message: string;
  type: NotificationType;
}

export type SensorTone = 'emerald' | 'amber' | 'sky' | 'slate';
