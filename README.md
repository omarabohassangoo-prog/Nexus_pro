# 🚀 NEXUS Enterprise Platform

منصة مؤسسية متكاملة — Express + Prisma + React + TypeScript

## ✨ المميزات

- 🔐 **مصادقة كاملة**: JWT + Refresh rotation + bcrypt(12)
- 👥 **4 أنواع مستخدمين**: SUPER_ADMIN / ADMIN / EDITOR / USER
- 🛡️ **40+ صلاحية** في 12 مجموعة
- ⚙️ **12 مجموعة إعدادات** مع تشفير AES-256-GCM
- 📧 **خدمات خارجية**: Email, SMS, WhatsApp, PayPal
- 💬 **WebSocket**: 6 غرف + presence + chat
- 🔧 **Install Wizard**: 6 خطوات + 3 طبقات قفل

## 📋 المتطلبات

- Node.js ≥ 18
- npm ≥ 9

## 🚀 التثبيت

```bash
# Backend
cd backend && npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev

# Frontend (نافذة أخرى)
cd frontend && npm install
npm run dev
```

## 🔑 بيانات الدخول

```
Email:    admin@nexus.local
Password: ChangeMe123!
```

## 🐳 Docker

```bash
docker-compose up -d
```
