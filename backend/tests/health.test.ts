import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Health', () => {
  it('/health/live', async () => {
    const res = await request(app).get('/api/health/live');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ok');
  });

  it('/health/ready', async () => {
    const res = await request(app).get('/api/health/ready');
    expect(res.status).toBe(200);
    expect(res.body.data.db).toBe('up');
  });
});
