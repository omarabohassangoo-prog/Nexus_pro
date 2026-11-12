import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Health deep', () => {
  it('/health/live < 100ms', async () => {
    const t0 = Date.now();
    const res = await request(app).get('/api/health/live');
    expect(res.status).toBe(200);
    expect(Date.now() - t0).toBeLessThan(500);
  });

  it('/health/ready reports db', async () => {
    const res = await request(app).get('/api/health/ready');
    expect(res.body.data.db).toBe('up');
  });

  it('/health/ws reports presence', async () => {
    const res = await request(app).get('/api/health/ws');
    expect(res.body.data).toHaveProperty('enabled');
  });
});
