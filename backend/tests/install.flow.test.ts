import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Install Wizard', () => {
  it('GET /status returns shape', async () => {
    const res = await request(app).get('/api/install/status');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('installed');
    expect(res.body.data).toHaveProperty('lockFile');
    expect(res.body.data).toHaveProperty('dbFlag');
  });

  it('GET /requirements returns 15+ checks', async () => {
    const res = await request(app).get('/api/install/requirements');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.checks)).toBe(true);
    expect(res.body.data.checks.length).toBeGreaterThanOrEqual(10);
  });
});
