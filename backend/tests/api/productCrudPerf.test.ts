import request from 'supertest';
import app from '../../src/app';
import { connectDB, disconnectDB } from '../../src/config/db';
import { getAdminToken } from './helpers/auth';
import Product from '../../src/models/product';

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a,b) => a-b);
  const idx = Math.ceil(p * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(sorted.length - 1, idx))];
}
function median(values: number[]): number { return percentile(values, 0.5); }

describe('Product CRUD Performance (SC-028 / FR-054)', () => {
  let token: string;
  const base = '/api/products';
  const iterations = 20;
  const createDur: number[] = [];
  const updateDur: number[] = [];
  const deleteDur: number[] = [];

  beforeAll(async () => {
    await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/product_catalog_product_perf_test');
    await Product.deleteMany({});
    token = await getAdminToken();
  });

  afterAll(async () => {
    await Product.deleteMany({});
    await disconnectDB();
  });

  it('measures p95 <= 2000ms for create/update/delete', async () => {
    for (let i = 0; i < iterations; i++) {
      const payload = { name: `PerfProd_${i}_${Date.now()}`, description: 'Desc', price: 9.99, imageUrl: 'http://ex/p.png', stock: 5 };
      const t0 = Date.now();
      const createRes = await request(app).post(base).set('Authorization', `Bearer ${token}`).send(payload);
      createDur.push(Date.now() - t0);
      expect(createRes.status).toBe(201);

      const id = createRes.body.id;
      const t1 = Date.now();
      const updateRes = await request(app).put(`${base}/${id}`).set('Authorization', `Bearer ${token}`).send({ price: 10.99 });
      updateDur.push(Date.now() - t1);
      expect(updateRes.status).toBe(200);

      const t2 = Date.now();
      const deleteRes = await request(app).delete(`${base}/${id}`).set('Authorization', `Bearer ${token}`);
      deleteDur.push(Date.now() - t2);
      expect(deleteRes.status).toBe(204);
    }

    const threshold = 2000;
    const createP95 = percentile(createDur, 0.95);
    const updateP95 = percentile(updateDur, 0.95);
    const deleteP95 = percentile(deleteDur, 0.95);

    expect(createP95).toBeLessThanOrEqual(threshold);
    expect(updateP95).toBeLessThanOrEqual(threshold);
    expect(deleteP95).toBeLessThanOrEqual(threshold);

    // eslint-disable-next-line no-console
    console.log('[productCrudPerf] create median=%d p95=%d update median=%d p95=%d delete median=%d p95=%d',
      median(createDur), createP95, median(updateDur), updateP95, median(deleteDur), deleteP95);
  });
});
