export const BACKEND_HOST = String(import.meta.env.VITE_BACKEND_IP ?? 'localhost');
export const BACKEND_BASE_URL = `http://${BACKEND_HOST}:5000`;
