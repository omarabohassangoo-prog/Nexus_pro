# 🚀 NEXUS — Vercel Deployment Guide

## المعمارية

```
┌─────────────────┐         ┌──────────────────┐
│  Frontend       │  HTTPS  │  Backend API     │
│  (Vercel)       │ ──────► │  (Vercel Func)   │
│  Vite SPA       │         │  Express         │
└─────────────────┘         └────────┬─────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
              ┌──────────┐    ┌──────────┐    ┌──────────┐
              │PostgreSQL│    │  Vercel  │    │ External │
              │ (Neon)   │    │   Blob   │    │ Services │
              └──────────┘    └──────────┘    └──────────┘
```

## قيود Vercel المهمة

| الميزة | الحالة | البديل |
|---|---|---|
| WebSocket | ❌ | Polling (30s) |
| SQLite | ❌ | PostgreSQL (Neon/Supabase) |
| Filesystem | ❌ | Vercel Blob |
| Shell exec | ❌ | Prisma migrate في build |
| Long-running | ❌ | maxDuration: 30s |
| Background jobs | ❌ | Vercel Cron / external |

## 1. إعداد قاعدة البيانات (Neon)

1. اذهب إلى [neon.tech](https://neon.tech) → New Project
2. انسخ `DATABASE_URL` و `DIRECT_URL`
3. شغّل migrations محلياً:
```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
DATABASE_URL="postgresql://..." npx prisma db seed
```

## 2. إعداد Vercel Blob

1. Vercel Dashboard → Storage → Create Blob Store
2. انسخ `BLOB_READ_WRITE_TOKEN`

## 3. نشر Backend

```bash
cd backend
vercel link
vercel env add DATABASE_URL production
vercel env add DIRECT_URL production
vercel env add JWT_SECRET production
vercel env add REFRESH_TOKEN_SECRET production
vercel env add ENCRYPTION_KEY production
vercel env add BLOB_READ_WRITE_TOKEN production
vercel env add CORS_ORIGINS production
vercel --prod
```

**ملاحظة:** Vercel يكتشف `@vercel/node` تلقائياً من `vercel.json`.

## 4. نشر Frontend

```bash
cd frontend
vercel link
vercel env add VITE_API_URL production
vercel --prod
```

## 5. بعد النشر

1. عدّل `CORS_ORIGINS` في Backend لرابط Frontend
2. أعد نشر Backend
3. افتح `https://<backend>.vercel.app/api/install/requirements`
4. اذهب إلى `/install` على Frontend

## استكشاف الأخطاء

| المشكلة | السبب | الحل |
|---|---|---|
| `500` عند أي طلب | Prisma binary | أضف `rhel-openssl-3.0.x` في binaryTargets |
| `Cannot find module .prisma/client` | لم يُنفّذ generate | `vercel-build` script |
| Blob upload fails | token ناقص | تحقق من `BLOB_READ_WRITE_TOKEN` |
| CORS error | origin غير مطابق | حدّث `CORS_ORIGINS` |
| Session lost | cookie domain | `sameSite: 'none', secure: true` |
