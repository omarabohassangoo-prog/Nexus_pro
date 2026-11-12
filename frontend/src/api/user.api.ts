import { api } from './client';
import type { ApiResponse } from '../types/api.types';
import type { SafeUser } from '../types/models.types';

export const userApi = {
  profile: () => api.get<ApiResponse<SafeUser>>('/user/profile').then(r => r.data.data!),
  updateProfile: (data: { name?: string; phone?: string | null; language?: string }) => api.put<ApiResponse<SafeUser>>('/user/profile', data).then(r => r.data.data!),
};
