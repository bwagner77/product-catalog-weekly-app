import request from 'supertest';
// Increase timeout to accommodate initial Mongo connection & inserts on slower CI hosts
jest.setTimeout(15000);
import app from '../../src/app';
import { connectDB, disconnectDB } from '../../src/config/db';
import Product from '../../src/models/product';
import Category from '../../src/models/category';

describe('Products search & filter API', () => {
  let catA: string;
  let catB: string;

  beforeAll(async () => {
    await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/product_catalog_test');
    await Product.deleteMany({});
    await Category.deleteMany({});
    const a = await (Category as any).create({ name: 'AlphaCat' });
    const b = await (Category as any).create({ name: 'BetaCat' });
    catA = a.id;
    catB = b.id;
    // Seed products with distinct names/descriptions and categories
    await Product.insertMany([
      { name: 'Red Apple', description: 'Fresh and crispy', price: 1.99, stock: 5, imageUrl: 'images/p1.jpg', categoryId: catA },
      { name: 'Green Apple', description: 'Tart flavor', price: 1.89, stock: 3, imageUrl: 'images/p2.jpg', categoryId: catA },
      { name: 'Banana', description: 'Yellow fruit', price: 0.99, stock: 10, imageUrl: 'images/p3.jpg', categoryId: catB },
      { name: 'Cherry Pie', description: 'Dessert with cherries', price: 5.5, stock: 2, imageUrl: 'images/p4.jpg', categoryId: catB },
      { name: 'Laptop Case', description: 'Protective accessory', price: 19.99, stock: 4, imageUrl: 'images/p5.jpg' }, // uncategorized
    ]);
  });

  afterAll(async () => {
    await Product.deleteMany({});
    await Category.deleteMany({});
    await disconnectDB();
  });

  it('search only: finds products by case-insensitive substring in name or description', async () => {
    const res = await request(app).get('/api/products').query({ search: 'apple' });
    expect(res.status).toBe(200);
    const names = res.body.map((p: any) => p.name).sort();
    expect(names).toEqual(['Green Apple', 'Red Apple']);
  });

  it('category only: filters products by categoryId', async () => {
    const res = await request(app).get('/api/products').query({ categoryId: catB });
    expect(res.status).toBe(200);
    const names = res.body.map((p: any) => p.name).sort();
    expect(names).toEqual(['Banana', 'Cherry Pie']);
  });

  it('combined search + category filter: intersection (category containing matches)', async () => {
    const res = await request(app).get('/api/products').query({ search: 'apple', categoryId: catA });
    expect(res.status).toBeDefined(); // sanity
    expect(res.status).toBe(200);
    const names = res.body.map((p: any) => p.name).sort();
    expect(names).toEqual(['Green Apple', 'Red Apple']);
  });

  it('combined reduces matches correctly', async () => {
    const res = await request(app).get('/api/products').query({ search: 'apple', categoryId: catB });
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(0);
  });

  it('zero-results search returns empty array', async () => {
    const res = await request(app).get('/api/products').query({ search: 'nonexistentphrase' });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it('no params returns all (≤100) products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(5);
  });
});
