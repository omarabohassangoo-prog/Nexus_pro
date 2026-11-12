#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════
# NEXUS — نشر على Vercel (Backend + Frontend)
# ═══════════════════════════════════════════════════════
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   NEXUS → Vercel Deployment         ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"

# متطلبات
command -v vercel >/dev/null 2>&1 || { echo -e "${RED}❌ vercel CLI غير مثبت. شغّل: npm i -g vercel${NC}"; exit 1; }
command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ Node.js غير مثبت${NC}"; exit 1; }

# تحقق من المتغيرات
REQUIRED_ENV=(DATABASE_URL DIRECT_URL JWT_SECRET REFRESH_TOKEN_SECRET ENCRYPTION_KEY BLOB_READ_WRITE_TOKEN)
for v in "${REQUIRED_ENV[@]}"; do
  if [ -z "${!v:-}" ]; then
    echo -e "${YELLOW}⚠️  $v غير معيّن في بيئتك الحالية${NC}"
  fi
done

echo -e "\n${BLUE}[1/5]${NC} نسخ schema PostgreSQL..."
cp backend/prisma/schema.vercel.prisma backend/prisma/schema.prisma

если [ -f backend/src/app.vercel.ts ]; then
  echo -e "${GREEN}✅ app.vercel.ts موجود${NC}"
else
  echo -e "${RED}❌ app.vercel.ts مفقود${NC}"; exit 1
fi

echo -e "\n${BLUE}[2/5]${NC} نسخ الخدمات Vercel-compatible..."
[ -f backend/src/services/media.service.vercel.ts ] && mv backend/src/services/media.service.vercel.ts backend/src/services/media.service.ts
[ -f backend/src/services/backup.service.vercel.ts ] && mv backend/src/services/backup.service.vercel.ts backend/src/services/backup.service.ts

echo -e "\n${BLUE}[3/5]${NC} نشر Backend..."
cd backend
vercel link --yes --project nexus-api 2>/dev/null || vercel link --yes
vercel env pull .env.vercel --environment=production --yes 2>/dev/null || true
vercel --prod --yes
BACKEND_URL=$(vercel ls nexus-api --token="${VERCEL_TOKEN:-}" 2>/dev/null | grep -oP 'https://[^\s]+' | head -1 || echo "")
cd ..

echo -e "\n${BLUE}[4/5]${NC} نشر Frontend..."
cd frontend
vercel link --yes --project nexus-frontend 2>/dev/null || vercel link --yes
vercel env add VITE_API_URL production "${BACKEND_URL}/api" --force 2>/dev/null || true
vercel --prod --yes
cd ..

echo -e "\n${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ اكتمل النشر!                   ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo -e "${BLUE}Backend:${NC}  ${BACKEND_URL}"
echo -e "${BLUE}Health:${NC}   ${BACKEND_URL}/api/health/live"
echo -e "\n${YELLOW}الخطوة التالية:${NC}"
echo -e "  1. افتح Frontend → /install"
echo -e "  2. أكمل معالج التنصيب"
