# Security Policy

## الممارسات المطبقة

- JWT + refresh rotation
- bcrypt(12)
- Account lockout (5 محاولات / 15 دقيقة)
- AES-256-GCM للأسرار
- Helmet + CORS + Rate limiting
- Prisma ORM (SQL injection safe)
- Audit log لكل عملية

## النشر الآمن

- [ ] JWT_SECRET ≥ 32 حرف
- [ ] ENCRYPTION_KEY = 64 hex
- [ ] NODE_ENV=production
- [ ] HTTPS إلزامي
- [ ] CORS محدد
- [ ] INSTALL_LOCKED=true
