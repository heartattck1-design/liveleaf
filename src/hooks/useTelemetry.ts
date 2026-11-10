import { useEffect, useRef, useState } from 'react';

import { DEFAULT_TELEMETRY } from '../constants/theme';
import type {
  NotificationState,
  TelemetryData,
  TimeRange,
  ViewMode,
} from '../types/telemetry';

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const randomBetween = (min: number, max: number): number =>
  Math.random() * (max - min) + min;

export function useTelemetry() {
  const [telemetry, setTelemetry] = useState<TelemetryData>(DEFAULT_TELEMETRY);
  const [isAutoStreaming, setIsAutoStreaming] = useState(true);
  const [activeTab, setActiveTab] = useState<ViewMode>('user-friendly');
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const notificationTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!notification) {
      return;
    }

    if (notificationTimerRef.current !== null) {
      window.clearTimeout(notificationTimerRef.current);
    }

    notificationTimerRef.current = window.setTimeout(() => {
      setNotification(null);
    }, 3200);

    return () => {
      if (notificationTimerRef.current !== null) {
        window.clearTimeout(notificationTimerRef.current);
      }
    };
  }, [notification]);

  useEffect(() => {
    if (!isAutoStreaming) {
      return;
    }

    const streamInterval = window.setInterval(() => {
      setTelemetry((current) => ({
        soilMoisture: Number(
          clamp(
            current.soilMoisture + randomBetween(-2.4, 2.1),
            0,
            100,
          ).toFixed(1),
        ),
        temperatureC: Number(
          clamp(
            current.temperatureC + randomBetween(-0.8, 0.9),
            12,
            42,
          ).toFixed(1),
        ),
        airHumidity: Number(
          clamp(
            current.airHumidity + randomBetween(-4, 3),
            20,
            90,
          ).toFixed(1),
        ),
        lightLux: Number(
          clamp(
            current.lightLux + randomBetween(-900, 900),
            0,
            30000,
          ).toFixed(0),
        ),
      }));
    }, 3000);

    return () => {
      window.clearInterval(streamInterval);
    };
  }, [isAutoStreaming]);

  const showNotification = (message: string, type: NotificationState['type']) => {
    setNotification({ message, type });
  };

  const dismissNotification = () => {
    setNotification(null);
  };

  const handleWaterPlant = () => {
    setTelemetry((current) => ({
      ...current,
      soilMoisture: Number(
        clamp(current.soilMoisture + 35, 0, 85).toFixed(1),
      ),
    }));
    showNotification('💧 Water plant action triggered (+35% moisture)', 'success');
  };

  const handleSimulateHeatSpike = () => {
    setTelemetry((current) => ({
      ...current,
      temperatureC: Number((current.temperatureC + 5.5).toFixed(1)),
    }));
    showNotification('🔥 Heat spike simulated (+5.5°C)', 'warning');
  };

  const handleResetSensors = () => {
    setTelemetry(DEFAULT_TELEMETRY);
    showNotification('↺ Telemetry reset to the healthy baseline', 'info');
  };

  const toggleAutoStream = () => {
    setIsAutoStreaming((current) => !current);
  };

  return {
    telemetry,
    isAutoStreaming,
    activeTab,
    timeRange,
    notification,
    setActiveTab,
    setTimeRange,
    dismissNotification,
    handleWaterPlant,
    handleSimulateHeatSpike,
    handleResetSensors,
    toggleAutoStream,
  };
}
