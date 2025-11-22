import request from 'supertest';
import app from '../../src/app';
import Product from '../../src/models/product';
import { connectDB, disconnectDB } from '../../src/config/db';

/**
 * Covers production branch in errorHandler (message redaction) to raise branch coverage.
 */

describe('traceId error handler production branch', () => {
  const origEnv = process.env.NODE_ENV;
  beforeAll(async () => {
    process.env.NODE_ENV = 'production';
    await connectDB('mongodb://localhost:27017/product_catalog_traceid_prod_test');
  });
  afterAll(async () => {
    process.env.NODE_ENV = origEnv;
    await disconnectDB();
  });

  it('redacts error message in production', async () => {
    const originalFind = (Product as any).find;
    (Product as any).find = () => { throw new Error('synthetic failure for prod branch'); };
    const res = await request(app).get('/api/products');
    (Product as any).find = originalFind;
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(typeof res.body.traceId).toBe('string');
  });
});
