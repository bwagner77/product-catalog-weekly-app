import request from 'supertest';
import app from '../../src/app';
import { connectDB, disconnectDB } from '../../src/config/db';
import seedProducts from '../../src/seed/seedProducts';
import Product from '../../src/models/product';

describe('[US8] Backend products include non-empty imageUrl', () => {
  beforeAll(async () => {
    // Use isolated database to avoid cross-suite interference
    await connectDB('mongodb://localhost:27017/product_catalog_images_test');
    await seedProducts();
  });

  afterAll(async () => {
    await Product.deleteMany({});
    await disconnectDB();
  });

  it('GET /api/products returns products with non-empty imageUrl', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(20); // seed provides 20
    for (const p of res.body) {
      expect(typeof p.imageUrl).toBe('string');
      expect(p.imageUrl.length).toBeGreaterThan(0);
    }
  });
});
