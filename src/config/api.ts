import { config } from './env';

export const API_BASE_URL = config.apiBaseUrl || 'http://localhost:6000';

export function apiUrl(path: string) {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

