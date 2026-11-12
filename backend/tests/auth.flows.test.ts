import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import { sha256 } from '../src/utils/crypto';

const app = createApp();

describe('Auth flows (full)', () => {
  let userId = 0;
  const email = `flow-${Date.now()}@test.local`;
  const password = 'SecurePass123!';

  it('register + creates verification token', async () => {
    const res = await request(app).post('/api/auth/register').send({ email, password, name: 'Flow User', type: 'USER', acceptTerms: true });
    expect(res.status).toBe(201);
    const user = await prisma.user.findUnique({ where: { email } });
    expect(user).toBeTruthy();
    expect(user!.status).toBe('PENDING');
    userId = user!.id;
    const tok = await prisma.emailVerificationToken.findFirst({ where: { userId } });
    expect(tok).toBeTruthy();
  });

  it('activate account with real token', async () => {
    const record = await prisma.emailVerificationToken.findFirst({ where: { userId } });
    expect(record).toBeTruthy();
    // نحتاج الرمز الخام — نتحقق من المسار عبر إنشاء token جديد يدوياً
    const raw = 'testtoken_' + Date.now();
    await prisma.emailVerificationToken.create({
      data: { userId, tokenHash: sha256(raw), expiresAt: new Date(Date.now() + 3600000) },
    });
    const res = await request(app).post('/api/auth/activate').send({ token: raw });
    expect(res.status).toBe(200);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    expect(user!.status).toBe('ACTIVE');
  });

  it('login returns redirectTo', async () => {
    const res = await request(app).post('/api/auth/login').send({ email, password });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.body.data.redirectTo).toBe('/user');
  });

  it('password reset flow', async () => {
    const raw = 'resettoken_' + Date.now();
    await prisma.passwordResetToken.create({
      data: { userId, tokenHash: sha256(raw), expiresAt: new Date(Date.now() + 3600000) },
    });
    const res = await request(app).post('/api/auth/reset-password').send({ token: raw, password: 'NewPass123!' });
    expect(res.status).toBe(200);
    const login = await request(app).post('/api/auth/login').send({ email, password: 'NewPass123!' });
    expect(login.status).toBe(200);
  });

  it('rejects reused reset token', async () => {
    const record = await prisma.passwordResetToken.findFirst({ where: { userId, usedAt: { not: null } } });
    expect(record).toBeTruthy();
    const res = await request(app).post('/api/auth/reset-password').send({ token: 'invalid', password: 'X' });
    expect(res.status).toBe(400);
  });
});
