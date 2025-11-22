import request from 'supertest';
import { performance } from 'perf_hooks';
import app from '../../src/app';
import { connectDB, disconnectDB } from '../../src/config/db';
import { getAdminToken } from './helpers/auth';

// Run only when explicitly enabled (avoids slowing normal CI): set PERF_PROTECTED=1
const maybeDescribe = process.env.PERF_PROTECTED === '1' ? describe : describe.skip;

maybeDescribe('Performance probe: protected admin POST endpoints', () => {
  let adminToken: string;
  let baseCategoryId: string;

  beforeAll(async () => {
    await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/product_catalog_protected_perf_test');
    adminToken = await getAdminToken();
    // Create a base category to reference for product creation perf runs
    const catRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `PerfBaseCategory-${Date.now()}` });
    expect(catRes.status).toBe(201);
    baseCategoryId = catRes.body.id;
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('measures POST /api/categories latency over N runs', async () => {
    const runs = Number.parseInt(process.env.PERF_PROTECTED_RUNS || '10', 10);
    const times: number[] = [];
    for (let i = 0; i < runs; i++) {
      const name = `PerfCat-${i}-${Date.now()}`; // ensure uniqueness, avoid 409 from duplicates
      const t0 = performance.now();
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name });
      const t1 = performance.now();
      expect(res.status).toBe(201);
      times.push(t1 - t0);
    }
    const sorted = [...times].sort((a, b) => a - b);
    const p95 = sorted[Math.max(0, Math.floor(0.95 * (sorted.length - 1)))];
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    if (process.env.PERF_PROTECTED_ASSERT === '1') {
      const threshold = Number.parseFloat(process.env.PERF_PROTECTED_CATEGORY_THRESHOLD_MS || '1000');
      expect(p95).toBeLessThanOrEqual(threshold);
    }
    // eslint-disable-next-line no-console
    console.info(JSON.stringify({ endpoint: 'POST /api/categories', runs, avg_ms: Math.round(avg), p95_ms: Math.round(p95) }));
  });

  it('measures POST /api/products latency over N runs', async () => {
    const runs = Number.parseInt(process.env.PERF_PROTECTED_RUNS || '10', 10);
    const times: number[] = [];
    for (let i = 0; i < runs; i++) {
      const t0 = performance.now();
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `PerfProduct-${i}-${Date.now()}`,
          description: 'Performance probe product',
          price: 9.99,
          imageUrl: 'http://example.com/perf.png',
          stock: 5,
          categoryId: baseCategoryId,
        });
      const t1 = performance.now();
      expect(res.status).toBe(201);
      times.push(t1 - t0);
    }
    const sorted = [...times].sort((a, b) => a - b);
    const p95 = sorted[Math.max(0, Math.floor(0.95 * (sorted.length - 1)))];
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    if (process.env.PERF_PROTECTED_ASSERT === '1') {
      const threshold = Number.parseFloat(process.env.PERF_PROTECTED_PRODUCT_THRESHOLD_MS || '1000');
      expect(p95).toBeLessThanOrEqual(threshold);
    }
    // eslint-disable-next-line no-console
    console.info(JSON.stringify({ endpoint: 'POST /api/products', runs, avg_ms: Math.round(avg), p95_ms: Math.round(p95) }));
  });
});
