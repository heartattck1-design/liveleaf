import { useState, useEffect, useCallback } from 'react';
import { Wifi, CheckCircle2, RefreshCw, Radio } from 'lucide-react';
import { BACKEND_BASE_URL } from '../../config';
import { LiveleafLogo } from '../layout/LiveleafLogo';

interface EspConnectionScreenProps {
  onConnected: () => void;
}

export function EspConnectionScreen({ onConnected }: EspConnectionScreenProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [deviceCount, setDeviceCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const checkDeviceConnection = useCallback(async () => {
    setIsChecking(true);
    setError(null);
    try {
      const token = localStorage.getItem('liveleaf_token');
      const response = await fetch(`${BACKEND_BASE_URL}/device/connected`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.msg ?? 'Failed to check device connection status.');
      }

      const count = data?.data?.connected_count ?? 0;
      setDeviceCount(count);

      if (count > 0) {
        setIsConnected(true);
        setIsChecking(false);
        setTimeout(() => {
          onConnected();
        }, 1500);
      } else {
        setIsConnected(false);
      }
    } catch {
      // In standalone demo mode where ESP32 might not be physically connected yet, allow simulation bypass or polling
      setError('Waiting for ESP32 hardware device socket connection...');
    } finally {
      setIsChecking(false);
    }
  }, [onConnected]);

  useEffect(() => {
    checkDeviceConnection();
    const interval = window.setInterval(() => {
      checkDeviceConnection();
    }, 4000);
    return () => clearInterval(interval);
  }, [checkDeviceConnection]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F7F5] px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        <div className="mb-6 flex justify-center">
          <LiveleafLogo title="Liveleaf" subtitle="ESP32 Hardware Link" />
        </div>

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 shadow-inner">
          {isConnected ? (
            <CheckCircle2 className="h-10 w-10 text-emerald-600 animate-bounce" />
          ) : (
            <Wifi className="h-10 w-10 text-emerald-600 animate-pulse" />
          )}
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
          {isConnected ? 'ESP32 Device Connected!' : 'Waiting for ESP32 Device...'}
        </h1>
        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
          {isConnected
            ? `Successfully detected ${deviceCount} active ESP32 node(s). Launching your live dashboard...`
            : 'Ensure your ESP32 IoT node is powered on, connected to Wi-Fi, and linked to the backend WebSocket server.'}
        </p>

        <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Backend Endpoint:</span>
            <code className="font-mono text-emerald-600">/device/connected</code>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500">Active Nodes:</span>
            <span className="font-bold text-slate-800">{deviceCount} device(s)</span>
          </div>
        </div>

        {error && <p className="mt-4 text-xs text-amber-600">{error}</p>}

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={checkDeviceConnection}
            disabled={isChecking}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
            Check Connection Now
          </button>

          {/* Bypass for evaluation/demo when physical ESP32 is not present */}
          <button
            type="button"
            onClick={onConnected}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 shadow-sm"
          >
            <Radio className="h-4 w-4" />
            Simulate / Enter Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
