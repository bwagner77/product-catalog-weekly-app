import request from 'supertest';
import app from '../../src/app';

describe('CORS configuration', () => {
  it('allows requests from configured FRONTEND_URL origin', async () => {
    // Use default http://localhost:5173 unless env overrides
    const allowed = process.env.FRONTEND_URL || 'http://localhost:5173';
    const res = await request(app).get('/health').set('Origin', allowed);
    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe(allowed);
  });

  it('does not reflect disallowed origins', async () => {
    const disallowed = 'http://example.com';
    // If example.com equals allowed (unlikely), skip this check
    if (disallowed === (process.env.FRONTEND_URL || 'http://localhost:5173')) return;
    const res = await request(app).get('/health').set('Origin', disallowed);
    expect(res.status).toBe(200);
    // CORS middleware should not set allow-origin for disallowed origins
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});
