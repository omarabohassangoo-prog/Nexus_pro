# NEXUS — Vercel Edition

## ⚠️ تغييرات مهمة عن الإصدار الأصلي

| الميزة | الأصلي | Vercel |
|---|---|---|
| Database | SQLite | PostgreSQL |
| WebSocket | Socket.IO | Polling (30s) |
| Storage | Local FS | Vercel Blob |
| Install | exec migrations | Build-time |
| Backup | Local files | Vercel Blob |
| Entry | server.ts (listen) | vercel-entry.ts (export) |

## هيكل الملفات الجديدة

```
backend/
├── vercel.json                    ← جديد
├── src/
│   ├── vercel-entry.ts           ← جديد (entry)
│   ├── app.vercel.ts             ← جديد (no WS)
│   └── services/
│       ├── media.service.vercel.ts   ← جديد (Blob)
│       ├── backup.service.vercel.ts  ← جديد (Blob)
│       └── install.service.vercel.patch.ts ← جديد
├── prisma/
│   ├── schema.vercel.prisma      ← جديد (PostgreSQL)
│   └── seed.vercel.ts            ← جديد (exportable)
└── package.json                  ← أضف @vercel/blob

frontend/
├── vercel.json                    ← جديد
├── .env.vercel.example           ← جديد
└── src/
    ├── api/client.vercel.patch.md    ← patch
    └── hooks/
        ├── useSocket.vercel.ts        ← stub
        └── useRealtimeNotifications.vercel.ts ← polling

.github/workflows/deploy-vercel.yml ← جديد
vercel-deploy.sh                    ← جديد (CLI script)
docs/vercel-deployment.md           ← جديد
```

## خطوات التطبيق

```bash
# 1. تطبيق patches
cp backend/prisma/schema.vercel.prisma backend/prisma/schema.prisma
cp backend/src/services/media.service.vercel.ts backend/src/services/media.service.ts
cp backend/src/services/backup.service.vercel.ts backend/src/services/backup.service.ts
cp frontend/src/hooks/useSocket.vercel.ts frontend/src/hooks/useSocket.ts
cp frontend/src/hooks/useRealtimeNotifications.vercel.ts frontend/src/hooks/useRealtimeNotifications.ts

# 2. تثبيت @vercel/blob
cd backend && npm i @vercel/blob

# 3. النشر
./vercel-deploy.sh
```

## متغيرات البيئة المطلوبة

### Backend (Vercel Dashboard)
```
DATABASE_URL         postgresql://...@neon.tech/nexus?sslmode=require
DIRECT_URL           postgresql://...@neon.tech/nexus?sslmode=require
JWT_SECRET           64 hex
REFRESH_TOKEN_SECRET 64 hex
ENCRYPTION_KEY       64 hex
BLOB_READ_WRITE_TOKEN vercel_blob_rw_...
CORS_ORIGINS         https://nexus-frontend.vercel.app
FRONTEND_URL         https://nexus-frontend.vercel.app
APP_URL              https://nexus-api.vercel.app
INSTALL_LOCKED       false
NODE_ENV             production
```

### Frontend (Vercel Dashboard)
```
VITE_API_URL  https://nexus-api.vercel.app/api
VITE_APP_ENV  production
```
