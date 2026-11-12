# NEXUS User Types

## الأنواع الأربعة

| النوع | اللوحة | الصلاحيات | redirect |
|---|---|---|---|
| SUPER_ADMIN | /admin | كل شيء (42) | /admin |
| ADMIN | /admin | كل شيء عدا system.reset | /admin |
| EDITOR | /admin | محتوى فقط (9) | /admin |
| USER | /user | لا شيء إداري | /user |

## إضافة نوع جديد — Checklist

1. `enum UserType` في `schema.prisma`
2. `prisma migrate dev`
3. `seed.ts` — أضف الدور والصلاحيات
4. `auth.service.ts` — `resolveRedirectByType` fallback
5. `admin.redirectAfterLoginByType` setting
6. `router.tsx` — أضف المسار + `RequireRole`
7. `AdminLayout` / `UserLayout` — لوحة مناسبة
8. `docs/user-types/{type}.md`
9. اختبار في `tests/rbac.test.ts`
10. `S20` في فحص النظام
