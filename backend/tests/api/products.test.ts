import request from 'supertest';
import app from '../../src/app';
import { connectDB, disconnectDB } from '../../src/config/db';
import seedProducts from '../../src/seed/seedProducts';
import Product from '../../src/models/product';
import { getErrorCount } from '../../src/utils/traceId';

describe('GET /api/products integration', () => {
  beforeAll(async () => {
    await connectDB('mongodb://localhost:27017/product_catalog_products_test');
    await seedProducts();
  });

  afterAll(async () => {
    const db = Product.db;
    if (db) await db.dropDatabase();
    await disconnectDB();
  });

  it('should have at least 5 seeded products in the database', async () => {
    const count = await Product.countDocuments({});
    expect(count).toBeGreaterThanOrEqual(5);
  });

  it('GET /api/products returns array of products (≥5) with required fields', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(5);
    const first = res.body[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('name');
    expect(first).toHaveProperty('description');
    expect(first).toHaveProperty('price');
    expect(first).toHaveProperty('createdAt');
    expect(first).toHaveProperty('updatedAt');
  });

  it('GET /api/products limits results to 100 items when more exist', async () => {
    // Insert additional >100 products to exceed the cap
    const bulk: Array<Partial<import('../../src/models/product').ProductDocument>> = [];
    for (let i = 0; i < 120; i++) {
      bulk.push({
        name: `Extra Product ${i}`,
        description: `Extra description ${i}`,
        price: i + 0.99,
        imageUrl: `images/extra/product-${i}.jpg`,
        stock: i % 10,
      });
    }
    await Product.insertMany(bulk);

    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeLessThanOrEqual(100);
    // Given ≥125 products in DB now, we expect the hard cap to be exactly 100
    expect(res.body.length).toBe(100);
  });

  it('increments error counter when route throws', async () => {
    const before = getErrorCount();
    // Force Product.find to throw synchronously
    const originalFind = (Product as any).find;
    (Product as any).find = () => { throw new Error('forced failure'); };
    const res = await request(app).get('/api/products');
    // Restore original implementation
    (Product as any).find = originalFind;
    expect(res.status).toBe(500);
    const after = getErrorCount();
    expect(after).toBe(before + 1);
  });
});
