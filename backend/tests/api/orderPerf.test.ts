import request from 'supertest';
import app from '../../src/app';
import { connectDB, disconnectDB } from '../../src/config/db';
import seedProducts from '../../src/seed/seedProducts';
import { performance } from 'perf_hooks';

const maybeDescribe = process.env.PERF === '1' ? describe : describe.skip;

maybeDescribe('Performance probe: POST /api/orders', () => {
  beforeAll(async () => {
    await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/product_catalog_test');
    await seedProducts();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('measures order submission latency over N runs', async () => {
    const runs = Number.parseInt(process.env.PERF_ORDER_RUNS || '10', 10);
    const productList = await request(app).get('/api/products');
    expect(productList.status).toBe(200);
    // Filter out products with zero stock to avoid 409 conflicts during repeated runs.
    // Ensure we only pick items that can sustain the number of runs (quantity 1 each).
    const products = productList.body.filter((p: any) => p.stock > 0).slice(0, 3);
    const times: number[] = [];
    for (let i = 0; i < runs; i++) {
      const items = products.map((p: any) => ({ productId: p.id, quantity: 1 }));
      const t0 = performance.now();
      const res = await request(app).post('/api/orders').send({ items });
      const t1 = performance.now();
      expect(res.status).toBe(201);
      times.push(t1 - t0);
    }
    const sorted = [...times].sort((a, b) => a - b);
    const p95 = sorted[Math.max(0, Math.floor(0.95 * (sorted.length - 1)))];
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    if (process.env.PERF_ASSERT === '1') {
      const threshold = Number.parseFloat(process.env.PERF_ORDER_THRESHOLD_MS || '1000');
      expect(p95).toBeLessThanOrEqual(threshold);
    }
    // eslint-disable-next-line no-console
    console.info(JSON.stringify({ runs, avg_ms: Math.round(avg), p95_ms: Math.round(p95), times_ms: times.map(t => Math.round(t)) }));
  });
});
