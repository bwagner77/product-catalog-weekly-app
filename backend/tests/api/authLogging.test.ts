import request from 'supertest';
import app from '../../src/app';
import { connectDB, disconnectDB } from '../../src/config/db';
import Product from '../../src/models/product';

/**
 * T179: Auth failure logging emits structured log with reason code, path, traceId.
 * We capture console.log output and assert presence of an auth_failure event line.
 */

describe('Auth Failure Logging', () => {
  let logs: string[] = [];
  const originalLog = console.log;

  beforeAll(async () => {
    await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/product_catalog_auth_logging_test');
    console.log = (...args: any[]) => {
      logs.push(args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' '));
      originalLog.apply(console, args);
    };
  });

  afterAll(async () => {
    console.log = originalLog;
    await disconnectDB();
  });

  test('missing token product create emits auth_failure log line', async () => {
    logs = [];
    const res = await request(app).post('/api/products').send({ name: 'X', description: 'Y', price: 1, imageUrl: 'i.jpg', stock: 1 });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('admin_auth_required');
    const authLines = logs.filter(l => /auth_failure/.test(l));
    expect(authLines.length).toBeGreaterThan(0);
    // Parse JSON line(s) to assert required fields
    const parsed = authLines.map(line => {
      try { return JSON.parse(line); } catch { return null; }
    }).filter(Boolean) as Array<Record<string, any>>;
    expect(parsed.some(p => p.event === 'auth_failure' && p.reason === 'admin_auth_required' && typeof p.traceId === 'string')).toBe(true);
  });
});
