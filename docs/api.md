# NEXUS API Reference

Base URL: `/api`

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | نجاح |
| 201 | تم الإنشاء |
| 204 | لا محتوى |
| 400 | طلب خاطئ |
| 401 | غير مصرح |
| 403 | ممنوع |
| 404 | غير موجود |
| 409 | تعارض |
| 422 | بيانات غير صالحة |
| 429 | تجاوز الحد |
| 500 | خطأ داخلي |

## Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`
- `GET /auth/sessions`
- `POST /auth/change-password`

## Admin

- `GET /admin/dashboard`
- `GET /admin/users`
- `GET /admin/roles`
- `GET /admin/settings/:group`
- `GET /admin/templates`
- `GET /admin/pages`
- `GET /admin/backups`
- `GET /admin/system/health`

## Public

- `GET /public/settings/public`
- `GET /public/pages/nav`
- `GET /public/pages/:slug`
- `GET /public/i18n/:code`

## Health

- `GET /health/live`
- `GET /health/ready`
- `GET /health/ws`

## WebSocket

`ws://host/ws?token=<accessToken>`

Events: `notification:new`, `chat:message`, `presence:update`, `session:revoked`, `system:announcement`
