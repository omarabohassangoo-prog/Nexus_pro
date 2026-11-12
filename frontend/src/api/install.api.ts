import { api } from './client';
import type { ApiResponse } from '../types/api.types';

export interface InstallStatus { installed: boolean; lockFile: boolean; dbFlag: boolean; envFlag: boolean; }
export interface RequirementCheck { key: string; label: string; ok: boolean; current: string; required: string; }
export interface RunPayload { adminName: string; adminEmail: string; adminPassword: string; siteName: string; siteUrl: string; }

export const installApi = {
  status: () => api.get<ApiResponse<InstallStatus>>('/install/status').then(r => r.data.data!),
  requirements: () => api.get<ApiResponse<{ ok: boolean; checks: RequirementCheck[] }>>('/install/requirements').then(r => r.data.data!),
  validate: (data: { dbUrl: string; adminEmail: string }) => api.post<ApiResponse<{ ok: boolean }>>('/install/validate', data).then(r => r.data.data!),
  run: (data: RunPayload) => api.post<ApiResponse<{ ok: boolean; steps: Array<{ name: string; ok: boolean; message?: string }> }>>('/install/run', data).then(r => r.data.data!),
  emergency: (data: { key: string; confirm: 'RESET'; adminEmail: string; adminPassword: string }) => api.post<ApiResponse<{ ok: boolean }>>('/install/emergency', data).then(r => r.data.data!),
};
