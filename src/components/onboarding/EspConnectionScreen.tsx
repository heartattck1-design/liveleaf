import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { Wifi, CheckCircle2, RefreshCw, Radio, Settings2 } from 'lucide-react';
import { BACKEND_BASE_URL } from '../../config';
import { getRequiredBearerHeaders } from '../../services/api';
import { checkEsp32Connection } from '../../services/esp32Api';
import { LiveleafLogo } from '../layout/LiveleafLogo';

interface EspConnectionScreenProps {
  onConnected: () => void;
}

export function EspConnectionScreen({ onConnected }: EspConnectionScreenProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [deviceCount, setDeviceCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [deviceIpAddress, setDeviceIpAddress] = useState('');
  const [isCheckingIp, setIsCheckingIp] = useState(false);
  const [ipError, setIpError] = useState<string | null>(null);
  const [ipSuccess, setIpSuccess] = useState(false);

  const checkDeviceConnection = useCallback(async () => {
    setIsChecking(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/device/connected`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getRequiredBearerHeaders(),
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
    } catch (checkError) {
      setError(
        checkError instanceof Error
          ? `Unable to check the ESP32 connection: ${checkError.message}`
          : 'Unable to check the ESP32 connection.',
      );
    } finally {
      setIsChecking(false);
    }
  }, [onConnected]);

  const handleIpConnection = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCheckingIp(true);
    setIpError(null);
    setIpSuccess(false);

    try {
      await checkEsp32Connection(deviceIpAddress);
      setDeviceCount(1);
      setIsConnected(true);
      setIpSuccess(true);
      window.setTimeout(onConnected, 1500);
    } catch (connectionError) {
      setIpError(
        connectionError instanceof Error
          ? connectionError.message
          : 'Unable to connect to the ESP32. Check the address and try again.',
      );
    } finally {
      setIsCheckingIp(false);
    }
  };

  useEffect(() => {
    // Poll the hardware backend so the UI can reflect real connection state updates.
    // oxlint-disable-next-line react/set-state-in-effect
    void checkDeviceConnection();
    const interval = window.setInterval(() => {
      void checkDeviceConnection();
    }, 4000);
    return () => clearInterval(interval);
  }, [checkDeviceConnection]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F7F5] px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        <div className="mb-6 flex items-start justify-between">
          <LiveleafLogo title="Liveleaf" subtitle="ESP32 Hardware Link" />
          <button
            type="button"
            aria-label="Advanced connection settings"
            aria-expanded={isAdvancedOpen}
            aria-controls="esp32-advanced-connection"
            onClick={() => setIsAdvancedOpen((open) => !open)}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-emerald-700"
          >
            <Settings2 className="h-5 w-5" />
          </button>
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

        {isAdvancedOpen && (
          <form
            id="esp32-advanced-connection"
            onSubmit={handleIpConnection}
            className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left"
          >
            <label htmlFor="esp32-ip-address" className="text-xs font-semibold text-slate-700">
              ESP32 IP address
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="esp32-ip-address"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="192.168.1.50"
                value={deviceIpAddress}
                onChange={(event) => {
                  setDeviceIpAddress(event.target.value);
                  setIpError(null);
                  setIpSuccess(false);
                }}
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={isCheckingIp || !deviceIpAddress.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isCheckingIp ? 'animate-spin' : ''}`} />
                {isCheckingIp ? 'Connecting' : 'Connect'}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Checks the ESP32 sensor endpoint at <code>/read</code>.
            </p>
            {ipError && <p role="alert" className="mt-2 text-xs text-rose-600">{ipError}</p>}
            {ipSuccess && (
              <p role="status" className="mt-2 text-xs font-medium text-emerald-700">
                ESP32 reached. Opening your dashboard...
              </p>
            )}
          </form>
        )}

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
