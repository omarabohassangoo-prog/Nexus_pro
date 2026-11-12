import { api } from './client';
import type { ApiResponse } from '../types/api.types';
import type { Page } from '../types/models.types';

export const publicApi = {
  settings: () => api.get<ApiResponse<Record<string, string>>>('/public/settings/public').then(r => r.data.data ?? {}),
  nav: () => api.get<ApiResponse<Array<Pick<Page, 'slug' | 'title' | 'showInNav' | 'showInFooter' | 'navOrder' | 'isSystem'>>>>('/public/pages/nav').then(r => r.data.data ?? []),
  page: (slug: string) => api.get<ApiResponse<Page>>(`/public/pages/${slug}`).then(r => r.data.data!),
  languages: () => api.get<ApiResponse<Array<{ code: string; name: string; direction: string; isDefault: boolean }>>>('/public/i18n/languages').then(r => r.data.data ?? []),
  translations: (code: string) => api.get<ApiResponse<Record<string, string>>>(`/public/i18n/${code}`).then(r => r.data.data ?? {}),
  contact: (data: { name: string; email: string; message: string }) => api.post('/public/contact', data),
};
