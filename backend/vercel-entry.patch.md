# تعديل `backend/src/vercel-entry.ts`

استبدل السطر:
```typescript
import { createApp } from './app';
const app = createApp();
```

بـ:
```typescript
import { createVercelApp } from './app.vercel';
const app = createVercelApp();
```

هذا يضمن عدم تشغيل `initRealtime()` على Vercel.
