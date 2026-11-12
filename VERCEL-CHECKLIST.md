# ✅ Vercel Deployment Checklist

## قبل النشر
- [ ] PostgreSQL جاهز (Neon/Supabase) مع `DATABASE_URL` + `DIRECT_URL`
- [ ] Vercel Blob Store منشأ → `BLOB_READ_WRITE_TOKEN`
- [ ] `JWT_SECRET` (64 hex) مولّد
- [ ] `REFRESH_TOKEN_SECRET` (64 hex) مولّد
- [ ] `ENCRYPTION_KEY` (64 hex) مولّد
- [ ] `schema.prisma` محدّث إلى PostgreSQL
- [ ] `@vercel/blob` مثبّت
- [ ] WebSocket معطّل (استبدل `useSocket.ts`)

## Backend Deploy
- [ ] `vercel link` في `backend/`
- [ ] كل env variables مضافة
- [ ] `vercel --prod` ينجح
- [ ] `/api/health/live` يرجع 200
- [ ] `/api/health/ready` يرجع `db: up`
- [ ] `/api/install/requirements` يعرض 8+ فحوصات

## Frontend Deploy
- [ ] `vercel link` في `frontend/`
- [ ] `VITE_API_URL` يشير للـ backend
- [ ] `vercel --prod` ينجح
- [ ] `/` يحمّل
- [ ] `/login` يعمل
- [ ] CORS لا يعطي أخطاء

## بعد النشر
- [ ] `CORS_ORIGINS` في Backend محدّث لرابط Frontend
- [ ] `/install` يفتح ويعرض requirements
- [ ] التنصيب يكتمل
- [ ] تسجيل الدخول بالحساب الجديد يعمل
- [ ] رفع ملف يذهب إلى Blob
- [ ] Backup يعمل
- [ ] Notifications polling يعمل

## مراقبة
- [ ] Vercel Logs نظيفة
- [ ] لا 500 errors
- [ ] Blob storage يستخدم
- [ ] DB connections مستقرة
