import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Auth', () => {
  const email = `test-${Date.now()}@nexus.local`;
  const password = 'TestPass123!';

  it('register user', async () => {
    const res = await request(app).post('/api/auth/register').send({ email, password, name: 'Test User', type: 'USER', acceptTerms: true });
    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe(email);
  });

  it('reject duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send({ email, password, name: 'Test 2', type: 'USER', acceptTerms: true });
    expect(res.status).toBe(409);
  });

  it('login admin', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@nexus.local', password: 'ChangeMe123!' });
    expect(res.status).toBe(200);
    expect(res.body.data.redirectTo).toBe('/admin');
  });

  it('401 without token', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(401);
  });
});
