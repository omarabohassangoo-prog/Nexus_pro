# Contributing

## Setup
```bash
cd backend && npm i && cp .env.example .env && npx prisma migrate dev && npx prisma db seed
cd frontend && npm i
```

## Development
- `backend: npm run dev` (tsx watch)
- `frontend: npm run dev` (vite)

## Before PR
- [ ] `npm run lint` (tsc --noEmit) نظيف
- [ ] `npm test` يمر
- [ ] لا `any`، لا `console.log` (استخدم logger)
- [ ] تحديث `CHANGELOG.md`
- [ ] تحديث `فحص النظام.json`

## Code style
- أسماء ملفات: kebab-case (`user.service.ts`)
- أنواع: PascalCase
- دوال: camelCase
- لا سحر أرقام — استخدم constants
- كل async يُغلَّف بـ `asyncHandler`
- كل مدخل يمر بـ Zod schema

## Commits
`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`
