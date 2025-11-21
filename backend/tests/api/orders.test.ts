import request from 'supertest';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import app from '../../src/app';
import { connectDB, disconnectDB } from '../../src/config/db';
import Product from '../../src/models/product';

describe('[US7] Orders API', () => {
  let prod1Id: string;
  let prod2Id: string;
  beforeAll(async () => {
    await connectDB('mongodb://localhost:27017/product_catalog_orders_test');
    const [p1, p2] = await (Product as any).create([
      { id: uuidv4(), name: 'Order Prod 1', description: 'D', price: 10, stock: 5, imageUrl: 'images/p1.jpg' },
      { id: uuidv4(), name: 'Order Prod 2', description: 'D2', price: 3.3333, stock: 2, imageUrl: 'images/p2.jpg' }
    ]);
    prod1Id = p1.id;
    prod2Id = p2.id;
  });

  afterAll(async () => {
    if (mongoose.connection.db) await mongoose.connection.db.dropDatabase();
    await disconnectDB();
  });

  it('creates order with snapshot and decrements stock, rounding total once', async () => {
    const res = await request(app).post('/api/orders').send({
      items: [
        { productId: prod1Id, quantity: 2 },
        { productId: prod2Id, quantity: 1 }
      ]
    });
    expect(res.status).toBe(201);
    expect(res.body.items.length).toBe(2);
    const item2 = res.body.items.find((i: any) => i.productId === prod2Id);
    expect(item2.price).toBe(3.3333);
    expect(res.body.total).toBe(23.33); // 2*10 + 1*3.3333 = 23.3333 -> 23.33
    const p1 = await Product.findOne({ id: prod1Id }).lean();
    const p2 = await Product.findOne({ id: prod2Id }).lean();
    expect(p1!.stock).toBe(3);
    expect(p2!.stock).toBe(1);
  });

  it('rejects insufficient stock with 409 and no decrement', async () => {
    const before = await Product.findOne({ id: prod1Id }).lean();
    const res = await request(app).post('/api/orders').send({ items: [{ productId: prod1Id, quantity: 999 }] });
    expect(res.status).toBe(409);
    const after = await Product.findOne({ id: prod1Id }).lean();
    expect(after!.stock).toBe(before!.stock);
  });

  it('price snapshot immutable after product price change', async () => {
    const first = await request(app).post('/api/orders').send({ items: [{ productId: prod2Id, quantity: 1 }] });
    expect(first.status).toBe(201);
    await Product.updateOne({ id: prod2Id }, { $set: { price: 99 } });
    const fetched = await request(app).get(`/api/orders/${first.body.id}`);
    expect(fetched.status).toBe(200);
    const item = fetched.body.items[0];
    expect(item.price).toBe(3.3333);
  });

  it('rejects empty items array', async () => {
    const res = await request(app).post('/api/orders').send({ items: [] });
    expect(res.status).toBe(400);
  });

  it('handles concurrent orders; only one succeeds (stock atomicity)', async () => {
    const prodId = uuidv4();
    await (Product as any).create({ id: prodId, name: 'Race Prod', description: 'R', price: 5, stock: 1, imageUrl: 'images/race.jpg' });
    // Fire two simultaneous order attempts for same single-stock product
    const [r1, r2] = await Promise.all([
      request(app).post('/api/orders').send({ items: [{ productId: prodId, quantity: 1 }] }),
      request(app).post('/api/orders').send({ items: [{ productId: prodId, quantity: 1 }] }),
    ]);
    const statuses = [r1.status, r2.status].sort();
    expect(statuses).toEqual([201, 409]);
    const final = await Product.findOne({ id: prodId }).lean();
    expect(final!.stock).toBe(0);
  });

  it('rejects missing items property', async () => {
    const res = await request(app).post('/api/orders').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/items/);
  });

  it('rejects non-integer quantity', async () => {
    const res = await request(app).post('/api/orders').send({ items: [{ productId: prod1Id, quantity: 1.5 }] });
    expect(res.status).toBe(400);
  });

  it('rejects zero quantity', async () => {
    const res = await request(app).post('/api/orders').send({ items: [{ productId: prod1Id, quantity: 0 }] });
    expect(res.status).toBe(400);
  });

  it('rejects unknown product id', async () => {
    const missingId = uuidv4();
    const res = await request(app).post('/api/orders').send({ items: [{ productId: missingId, quantity: 1 }] });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/not found/);
  });

  it('aborts order on simulated concurrent stock change (matchedCount mismatch)', async () => {
    // Create product with stock sufficient, but simulate bulkWrite mismatch
    const raceProd = await (Product as any).create({ id: uuidv4(), name: 'Concurrent Prod', description: 'C', price: 2, stock: 3, imageUrl: 'images/c.jpg' });
    const spy = jest.spyOn(Product, 'bulkWrite').mockResolvedValue({ matchedCount: 0 } as any); // force mismatch
    const res = await request(app).post('/api/orders').send({ items: [{ productId: raceProd.id, quantity: 1 }] });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/concurrently/i);
    spy.mockRestore();
  });
});
