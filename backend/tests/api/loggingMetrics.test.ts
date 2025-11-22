import request from 'supertest';
import app from '../../src/app';
import Product from '../../src/models/product';
import { connectDB, disconnectDB } from '../../src/config/db';
import seedProducts from '../../src/seed/seedProducts';
import { getErrorCount } from '../../src/utils/traceId';

/**
 * T123 Logging & metrics verification (FR-011, SC-006)
 * Verifies:
 *  - Structured request log emitted with required keys on success
 *  - Structured error log emitted on failure with required keys
 *  - errorCount increments exactly once per failing request
 */

describe('T123 Logging & metrics verification', () => {
  const origEnv = process.env.NODE_ENV;
  beforeAll(async () => {
    process.env.NODE_ENV = 'test'; // ensure non-production error message path
    await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/product_catalog_test');
    await seedProducts();
  });
  afterAll(async () => {
    process.env.NODE_ENV = origEnv;
    await disconnectDB();
  });

  it('emits request and error logs with proper schema and increments error counter', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const initialErrorCount = getErrorCount();
    // Successful request (generates request log)
    const okRes = await request(app).get('/api/products');
    expect(okRes.status).toBe(200);

    // Force an internal error by monkey-patching Product.find to throw
    const originalFind = Product.find;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Product as any).find = () => { throw new Error('synthetic failure'); };
    const errRes = await request(app).get('/api/products');
    expect(errRes.status).toBe(500);
    // restore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Product as any).find = originalFind;

    // Unknown route (404) produces request log only
    const notFoundRes = await request(app).get('/api/does-not-exist');
    expect(notFoundRes.status).toBe(404);

    // Gather logged JSON entries
    const entries = logSpy.mock.calls.map(call => {
      try { return JSON.parse(String(call[0])); } catch { return null; }
    }).filter(Boolean) as Array<Record<string, any>>;

    // There should be at least one request log for each of the three requests
    const requestLogs = entries.filter(e => e.event === 'request');
    expect(requestLogs.length).toBeGreaterThanOrEqual(3);

    // Validate required keys in request log shape
    for (const rl of requestLogs) {
      expect(rl).toEqual(expect.objectContaining({
        ts: expect.any(String),
        level: 'info',
        event: 'request',
        method: expect.any(String),
        path: expect.any(String),
        status: expect.any(Number),
        duration_ms: expect.any(Number),
        traceId: expect.any(String),
      }));
    }

    // Error log should exist for the thrown error route (event === 'error')
    const errorLogs = entries.filter(e => e.event === 'error');
    expect(errorLogs.length).toBeGreaterThanOrEqual(1);
    const oneError = errorLogs[0];
    expect(oneError).toEqual(expect.objectContaining({
      ts: expect.any(String),
      level: 'error',
      event: 'error',
      status: expect.any(Number),
      message: expect.any(String),
      errorName: expect.any(String),
      path: expect.any(String),
      traceId: expect.any(String),
    }));

    // errorCount incremented exactly once for the validation error (404 handled by request log only)
    const afterErrorCount = getErrorCount();
    expect(afterErrorCount).toBe(initialErrorCount + 1);

    logSpy.mockRestore();
  });
});
