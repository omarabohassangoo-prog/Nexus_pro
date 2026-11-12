import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const testDb = path.resolve(process.cwd(), 'test.db');
process.env.DATABASE_URL = `file:${testDb}`;
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_32_chars_minimum_xxxxxxxx';
process.env.REFRESH_TOKEN_SECRET = 'test_refresh_secret_32_chars_minimum_yyyyyy';
process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
process.env.CORS_ORIGINS = 'http://localhost:5173';
process.env.INSTALL_LOCKED = 'false';

beforeAll(async () => {
  try { if (fs.existsSync(testDb)) fs.unlinkSync(testDb); } catch { /* ignore */ }
  execSync('npx prisma migrate deploy', { stdio: 'inherit', env: { ...process.env } });
  execSync('npx tsx prisma/seed.ts', { stdio: 'inherit', env: { ...process.env } });
}, 60000);

afterAll(async () => {
  const { prisma } = await import('../src/config/prisma');
  await prisma.$disconnect();
  try { if (fs.existsSync(testDb)) fs.unlinkSync(testDb); } catch { /* ignore */ }
});
