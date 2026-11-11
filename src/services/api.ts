import axios, { type InternalAxiosRequestConfig } from 'axios';
import { BACKEND_BASE_URL } from '../config';

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

const apiClient = axios.create({
  baseURL: BACKEND_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('liveleaf-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function fetchPlantMetrics(): Promise<PlantMetricsResponse> {
  const response = await apiClient.get<PlantMetricsResponse>('/plant/analysis/metrics');
  return response.data;
}

export async function sendAiChatMessage(prompt: string, history: ChatMessage[] = []): Promise<ChatResponse> {
  const response = await apiClient.post<ChatResponse>('/ai/', {
    prompt,
    history: history.map((m) => ({ sender: m.sender, text: m.text })),
  });
  return response.data;
}
