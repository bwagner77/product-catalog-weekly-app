import request from 'supertest';
import app from '../../src/app';
import { connectDB, disconnectDB } from '../../src/config/db';
import Category from '../../src/models/category';
import { getAdminToken } from './helpers/auth';

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a,b) => a-b);
  const idx = Math.ceil(p * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(sorted.length - 1, idx))];
}
function median(values: number[]): number { return percentile(values, 0.5); }

describe('Category CRUD Performance (SC-007 / FR-054)', () => {
  let token: string;
  const baseUrl = '/api/categories';
  const iterations = 20;
  const createDur: number[] = [];
  const updateDur: number[] = [];
  const deleteDur: number[] = [];

  beforeAll(async () => {
    await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/product_catalog_category_perf_test');
    await Category.deleteMany({});
    token = await getAdminToken();
  });

  afterAll(async () => {
    await Category.deleteMany({});
    await disconnectDB();
  });

  it('measures create/update/delete p95 <= 2000ms', async () => {
    for (let i = 0; i < iterations; i++) {
      const name = `PerfCat_${i}_${Date.now()}`;
      const t0 = Date.now();
      const createRes = await request(app).post(baseUrl).set('Authorization', `Bearer ${token}`).send({ name });
      createDur.push(Date.now() - t0);
      expect(createRes.status).toBe(201);

      const id = createRes.body.id;
      const t1 = Date.now();
      const updateRes = await request(app).put(`${baseUrl}/${id}`).set('Authorization', `Bearer ${token}`).send({ name: name + '_u' });
      updateDur.push(Date.now() - t1);
      expect(updateRes.status).toBe(200);

      const t2 = Date.now();
      const deleteRes = await request(app).delete(`${baseUrl}/${id}`).set('Authorization', `Bearer ${token}`);
      deleteDur.push(Date.now() - t2);
      expect(deleteRes.status).toBe(204);
    }

    const createP95 = percentile(createDur, 0.95);
    const updateP95 = percentile(updateDur, 0.95);
    const deleteP95 = percentile(deleteDur, 0.95);

    const threshold = 2000; // ms
    expect(createP95).toBeLessThanOrEqual(threshold);
    expect(updateP95).toBeLessThanOrEqual(threshold);
    expect(deleteP95).toBeLessThanOrEqual(threshold);

    // Log summary for manual inspection if needed.
    // eslint-disable-next-line no-console
    console.log('[categoryPerf] create median=%d p95=%d update median=%d p95=%d delete median=%d p95=%d',
      median(createDur), createP95, median(updateDur), updateP95, median(deleteDur), deleteP95);
  });
});
