import { isAxiosError } from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';

import { fetchDeviceTelemetry } from '../services/api';
import type { DeviceTelemetrySample, RawDeviceTelemetry } from '../types/telemetry';
import { toTimestampMs } from '../utils/telemetry';

const HISTORY_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const POLL_INTERVAL_MS = 10_000;

export function useDeviceTelemetry() {
  const [latest, setLatest] = useState<DeviceTelemetrySample | null>(null);
  const [history, setHistory] = useState<DeviceTelemetrySample[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const requestInFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (requestInFlight.current) {
      return;
    }

    requestInFlight.current = true;
    setIsLoading(true);
    try {
      const data: RawDeviceTelemetry = await fetchDeviceTelemetry();
      const sample: DeviceTelemetrySample = {
        ...data,
        timestampMs: toTimestampMs(data.received_at),
      };
      const cutoff = Date.now() - HISTORY_WINDOW_MS;

      setLatest(sample);
      setHistory((current) =>
        [...current.filter((item) => item.timestampMs !== sample.timestampMs), sample]
          .filter((item) => item.timestampMs >= cutoff)
          .sort((left, right) => left.timestampMs - right.timestampMs),
      );
      setError(null);
    } catch (requestError) {
      if (isAxiosError(requestError) && requestError.response?.status === 404) {
        setError('Waiting for the first ESP32 sensor reading.');
      } else {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Could not load ESP32 sensor telemetry.',
        );
      }
    } finally {
      setIsLoading(false);
      requestInFlight.current = false;
    }
  }, []);

  useEffect(() => {
    // Keep the dashboard synchronized with the backend's latest device packet.
    // oxlint-disable-next-line react/set-state-in-effect
    void refresh();
    const intervalId = window.setInterval(() => {
      void refresh();
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [refresh]);

  return { latest, history, error, isLoading, refresh };
}
