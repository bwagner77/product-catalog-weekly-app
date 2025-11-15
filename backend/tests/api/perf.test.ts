import request from 'supertest';
import app from '../../src/app';
import { connectDB, disconnectDB } from '../../src/config/db';
import seedProducts from '../../src/seed/seedProducts';
import { performance } from 'perf_hooks';

// Activate only when PERF=1 is set; otherwise, skip this probe test
const maybeDescribe = process.env.PERF === '1' ? describe : describe.skip;

maybeDescribe('Performance probe: GET /api/products', () => {
  beforeAll(async () => {
    await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/product_catalog_test');
    await seedProducts();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('measures latency over N runs and logs avg/p95 (ms)', async () => {
    const runs = Number.parseInt(process.env.PERF_RUNS || '20', 10);
    const warmup = Number.parseInt(process.env.PERF_WARMUP || '1', 10);

    // Warm-up to avoid cold-start effects
    for (let i = 0; i < warmup; i++) {
      await request(app).get('/api/products');
    }

    const times: number[] = [];
    for (let i = 0; i < runs; i++) {
      const t0 = performance.now();
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      const t1 = performance.now();
      times.push(t1 - t0);
    }

    const sorted = [...times].sort((a, b) => a - b);
    const p95 = sorted[Math.max(0, Math.floor(0.95 * (sorted.length - 1)))];
    const avg = times.reduce((a, b) => a + b, 0) / times.length;

    // Optional threshold assertion, opt-in
    if (process.env.PERF_ASSERT === '1') {
      const threshold = Number.parseFloat(process.env.PERF_THRESHOLD_MS || '1000');
      expect(p95).toBeLessThanOrEqual(threshold);
    }

    // eslint-disable-next-line no-console
    console.info(
      JSON.stringify({
        runs,
        avg_ms: Math.round(avg),
        p95_ms: Math.round(p95),
        times_ms: times.map((t) => Math.round(t)),
      })
    );
  });
});
