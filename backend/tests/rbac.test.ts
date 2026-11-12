import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('RBAC', () => {
  let adminToken = '';
  let userToken = '';

  beforeAll(async () => {
    const admin = await request(app).post('/api/auth/login').send({ email: 'admin@nexus.local', password: 'ChangeMe123!' });
    adminToken = admin.body.data?.accessToken ?? '';
  });

  it('admin can list users', async () => {
    const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it('no token → 401', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(401);
  });

  it('user role cannot access admin', async () => {
    const email = `rbac-${Date.now()}@test.local`;
    await request(app).post('/api/auth/register').send({ email, password: 'TestPass123!', name: 'RBAC User', type: 'USER', acceptTerms: true });
    const user = await (await import('../src/config/prisma')).prisma.user.findUnique({ where: { email } });
    if (user) {
      await (await import('../src/config/prisma')).prisma.user.update({ where: { id: user.id }, data: { status: 'ACTIVE', emailVerified: true } });
    }
    const login = await request(app).post('/api/auth/login').send({ email, password: 'TestPass123!' });
    userToken = login.body.data?.accessToken ?? '';
    const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });
});
