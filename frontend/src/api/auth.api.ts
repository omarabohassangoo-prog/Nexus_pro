import { api } from './client';
import type { ApiResponse } from '../types/api.types';
import type { SafeUser } from '../types/models.types';

export interface LoginPayload { email: string; password: string; remember?: boolean; }
export interface LoginResult { accessToken: string; refreshToken: string; user: SafeUser; redirectTo: string; }
export interface RegisterPayload { email: string; password: string; name: string; phone?: string; type?: 'USER' | 'EDITOR'; acceptTerms: true; }

export const authApi = {
  login: (data: LoginPayload) => api.post<ApiResponse<LoginResult>>('/auth/login', data).then(r => r.data.data!),
  register: (data: RegisterPayload) => api.post<ApiResponse<{ user: SafeUser }>>('/auth/register', data).then(r => r.data.data!),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<ApiResponse<SafeUser>>('/auth/me').then(r => r.data.data!),
  sessions: () => api.get<ApiResponse<Array<{ id: string; ipAddress: string | null; userAgent: string | null; createdAt: string; expiresAt: string }>>>('/auth/sessions').then(r => r.data.data ?? []),
  revokeSession: (id: string) => api.delete(`/auth/sessions/${id}`),
  changePassword: (currentPassword: string, newPassword: string) => api.post('/auth/change-password', { currentPassword, newPassword }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
  activate: (token: string) => api.post('/auth/activate', { token }),
};
