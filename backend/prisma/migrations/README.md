# Migrations

## توليد أول migration
```bash
cd backend
npx prisma migrate dev --name init
```

سيُنشئ:
- `prisma/migrations/YYYYMMDD_init/migration.sql`
- `prisma/migrations/migration_lock.toml`

## تطبيق migrations في الإنتاج
```bash
npx prisma migrate deploy
```

## ملاحظة
لا تُعدّل ملفات migration يدوياً — أنشئ migration جديدة للتغيير.
