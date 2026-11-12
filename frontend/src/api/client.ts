import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '../types/api.types';

export const TOKEN_KEY = 'nexus.access_token';

export function getAccessToken(): string | null { return localStorage.getItem(TOKEN_KEY); }
export function setAccessToken(t: string) { localStorage.setItem(TOKEN_KEY, t); }
export function clearAccessToken() { localStorage.removeItem(TOKEN_KEY); }

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshToken(): Promise<string> {
  const res = await axios.post<ApiResponse<{ accessToken: string }>>('/api/auth/refresh', {}, { withCredentials: true });
  const token = res.data.data?.accessToken;
  if (!token) throw new Error('refresh failed');
  setAccessToken(token);
  return token;
}

api.interceptors.response.use(
  r => r,
  async (err: AxiosError) => {
    const original = err.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (err.response?.status === 401 && !original._retry && !original.url?.includes('/auth/')) {
      original._retry = true;
      try {
        refreshPromise ??= refreshToken().finally(() => { refreshPromise = null; });
        const newToken = await refreshPromise;
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        clearAccessToken();
        if (!window.location.pathname.startsWith('/login')) window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export function extractError(err: unknown): { message: string; code?: string; errors?: unknown } {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiResponse | undefined;
    return { message: data?.message ?? err.message, code: data?.code, errors: data?.errors };
  }
  return { message: (err as Error)?.message ?? 'خطأ غير متوقع' };
}
