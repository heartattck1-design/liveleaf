import axios, { type InternalAxiosRequestConfig } from 'axios';
import { BACKEND_BASE_URL } from '../config';
import type { PlantAnalysisResponse } from '../types/plantAnalysis';
import type { RawDeviceTelemetry } from '../types/telemetry';

export interface PlantMetricsResponse {
  plantId?: string | number;
  scientificName?: string;
  commonName?: string;
  soilMoisture?: number;
  temperatureC?: number;
  airHumidity?: number;
  lightLux?: number;
  waterLevel?: number;
  timestamp?: string | number;
  status?: string;
  recommendations?: string[];
  [key: string]: unknown;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface ChatResponse {
  reply: string;
  analysis?: PlantMetricsResponse;
  [key: string]: unknown;
}

export const ACCESS_TOKEN_STORAGE_KEY = 'liveleaf_token';

export function getAccessToken(): string {
  const token = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  if (!token) {
    throw new Error('Access token is missing. Please log in or sign up before making this request.');
  }
  return token;
}

export function getRequiredBearerHeaders(): { Authorization: string } {
  return { Authorization: `Bearer ${getAccessToken()}` };
}

export function getOptionalBearerHeaders(): Record<string, string> {
  const token = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function saveAccessToken(token: string): void {
  if (!token.trim()) {
    throw new Error('The authentication response did not include an access token.');
  }
  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
}

function isRawDeviceTelemetry(value: unknown): value is RawDeviceTelemetry {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const telemetry = value as Record<string, unknown>;
  return (
    typeof telemetry.temp === 'number' &&
    Number.isFinite(telemetry.temp) &&
    typeof telemetry.humi === 'number' &&
    Number.isFinite(telemetry.humi) &&
    typeof telemetry.lamp === 'number' &&
    Number.isFinite(telemetry.lamp) &&
    typeof telemetry.soil === 'number' &&
    Number.isFinite(telemetry.soil) &&
    typeof telemetry.tank === 'number' &&
    Number.isFinite(telemetry.tank) &&
    typeof telemetry.received_at === 'number' &&
    Number.isFinite(telemetry.received_at)
  );
}

const apiClient = axios.create({
  baseURL: BACKEND_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.headers.Authorization = getRequiredBearerHeaders().Authorization;
  return config;
});

export async function fetchPlantMetrics(): Promise<PlantMetricsResponse> {
  const response = await apiClient.get<PlantMetricsResponse>('/plant/analysis/metrics');
  return response.data;
}

export async function analyzePlantPhoto(
  image: File,
  details: { commonName?: string; scientificName?: string } = {},
): Promise<PlantAnalysisResponse> {
  const formData = new FormData();
  formData.append('image', image);
  if (details.commonName?.trim()) {
    formData.append('common_name', details.commonName.trim());
  }
  if (details.scientificName?.trim()) {
    formData.append('scientific_name', details.scientificName.trim());
  }

  const response = await apiClient.post<PlantAnalysisResponse>('/plant/analysis', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60_000,
  });
  return response.data;
}

export async function fetchDeviceTelemetry(): Promise<RawDeviceTelemetry> {
  const response = await apiClient.get<{ data: unknown }>('/device/telemetry');
  if (!isRawDeviceTelemetry(response.data.data)) {
    throw new Error('The device telemetry endpoint returned an invalid sensor payload.');
  }
  return response.data.data;
}

export async function sendAiChatMessage(prompt: string, history: ChatMessage[] = []): Promise<ChatResponse> {
  const response = await apiClient.post<ChatResponse>('/ai', {
    prompt,
    history: history.map((m) => ({ sender: m.sender, text: m.text })),
  });
  return response.data;
}
