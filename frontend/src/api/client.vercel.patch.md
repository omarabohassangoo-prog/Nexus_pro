# تعديل `frontend/src/api/client.ts`

استبدل:
```typescript
export const api = axios.create({ baseURL: '/api', withCredentials: true });
```

بـ:
```typescript
const API_URL = import.meta.env.VITE_API_URL || '/api';
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});
```

واستبدل في `refreshToken()`:
```typescript
const res = await axios.post<ApiResponse<{ accessToken: string }>>('/api/auth/refresh', {}, { withCredentials: true });
```

بـ:
```typescript
const API_URL = import.meta.env.VITE_API_URL || '/api';
const res = await axios.post<ApiResponse<{ accessToken: string }>>(
  `${API_URL}/auth/refresh`,
  {},
  { withCredentials: true }
);
```
