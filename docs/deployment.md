# Deployment Guide

## متغيرات البيئة

```env
NODE_ENV=production
PORT=4000
APP_URL=https://your-domain.com
DATABASE_URL=postgresql://user:pass@db:5432/nexus
JWT_SECRET=<64 hex>
REFRESH_TOKEN_SECRET=<64 hex>
ENCRYPTION_KEY=<64 hex>
CORS_ORIGINS=https://your-domain.com
INSTALL_LOCKED=true
```

## Docker

```bash
docker-compose up -d
docker-compose exec backend npx prisma migrate deploy
```

## Nginx + HTTPS

راجع `nginx.conf` — استخدم Certbot للـ SSL.
