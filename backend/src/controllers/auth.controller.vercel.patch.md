# تعديل `backend/src/controllers/auth.controller.ts`

## استبدل `res.cookie(...)` في `login` و `refresh`:

```typescript
import { refreshCookieOptions, clearRefreshCookieOptions } from '../middlewares/cookie.config.vercel';

// في login:
res.cookie('refresh_token', result.refreshToken, refreshCookieOptions());

// في refresh:
res.cookie('refresh_token', result.refreshToken, refreshCookieOptions());

// في logout:
res.clearCookie('refresh_token', clearRefreshCookieOptions());
```

**السبب:** Frontend و Backend على domains مختلفة (vercel.app subdomains) — يتطلب `sameSite: 'none'` + `secure: true`.
