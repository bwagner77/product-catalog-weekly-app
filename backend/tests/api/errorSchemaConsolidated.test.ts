import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import app from '../../src/app';
import Product from '../../src/models/product';
import Category from '../../src/models/category';

// Consolidated error schema test (T168)
// Exercises: admin_auth_required, token_expired, forbidden_admin_role, invalid_credentials,
// category_name_conflict, stock_conflict and asserts absence of deprecated alias 'insufficient_stock'.
// Ensures uniform shape { error, message } for each.

describe('Consolidated error schema (T168)', () => {
  const secret = 'test_secret';
  beforeAll(async () => {
    process.env.JWT_SECRET = secret;
    process.env.ADMIN_USERNAME = 'admin';
    process.env.ADMIN_PASSWORD = 'password';
    const uri = process.env.MONGO_URL || 'mongodb://localhost:27017/shoply_error_schema_test';
    await mongoose.connect(uri, { dbName: 'shoply_error_schema_test' });
  });
  afterAll(async () => {
    await mongoose.connection.close();
  });
  beforeEach(async () => {
    await Product.deleteMany({});
    await Category.deleteMany({});
  });

  function sign(payload: Record<string, unknown>): string {
    return jwt.sign(payload, secret, { algorithm: 'HS256' });
  }

  test('invalid_credentials on bad login', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'wrong', password: 'creds' });
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ error: 'invalid_credentials' });
    expect(typeof res.body.message).toBe('string');
  });

  test('admin_auth_required missing token on protected write', async () => {
    const res = await request(app).post('/api/categories').send({ name: 'Electronics' });
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ error: 'admin_auth_required' });
    expect(typeof res.body.message).toBe('string');
  });

  test('token_expired with past exp', async () => {
    const expired = sign({ role: 'admin', exp: Math.floor(Date.now()/1000) - 10 });
    const res = await request(app).post('/api/categories').set('Authorization', `Bearer ${expired}`).send({ name: 'Books' });
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ error: 'token_expired' });
    expect(typeof res.body.message).toBe('string');
  });

  test('forbidden_admin_role with non-admin role', async () => {
    const token = sign({ role: 'user', exp: Math.floor(Date.now()/1000) + 3600 });
    const res = await request(app).post('/api/categories').set('Authorization', `Bearer ${token}`).send({ name: 'Tools' });
    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({ error: 'forbidden_admin_role' });
    expect(typeof res.body.message).toBe('string');
  });

  test('category_name_conflict duplicate (case-insensitive)', async () => {
    const admin = sign({ role: 'admin', exp: Math.floor(Date.now()/1000) + 3600 });
    const first = await request(app).post('/api/categories').set('Authorization', `Bearer ${admin}`).send({ name: 'Garden' });
    expect(first.status).toBeLessThan(400);
    const dup = await request(app).post('/api/categories').set('Authorization', `Bearer ${admin}`).send({ name: 'garden' });
    expect(dup.status).toBe(409);
    expect(dup.body).toMatchObject({ error: 'category_name_conflict' });
    expect(typeof dup.body.message).toBe('string');
  });

  test('stock_conflict when ordering quantity above stock', async () => {
    // Create product with valid UUID then attempt order exceeding stock
    await Product.create({ name: 'Widget', description: 'Test', price: 9.99, stock: 1, imageUrl: 'x.jpg' });
    const prod = await Product.findOne({ name: 'Widget' }).lean();
    const res = await request(app).post('/api/orders').send({ items: [{ productId: prod!.id, quantity: 2 }] });
    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({ error: 'stock_conflict' });
    expect(typeof res.body.message).toBe('string');
    // Assert deprecated alias not used
    expect(res.body.error).not.toBe('insufficient_stock');
  });

  test('no responses use deprecated insufficient_stock code', async () => {
    // Sanity: trigger a valid order then invalid to ensure stock_conflict remains
    await Product.create({ name: 'Gizmo', description: 'Desc', price: 5.00, stock: 1, imageUrl: 'y.jpg' });
    const gizmo = await Product.findOne({ name: 'Gizmo' }).lean();
    const ok = await request(app).post('/api/orders').send({ items: [{ productId: gizmo!.id, quantity: 1 }] });
    expect(ok.status).toBe(201);
    await Product.create({ name: 'Thing', description: 'Desc', price: 5.00, stock: 1, imageUrl: 'z.jpg' });
    const thing = await Product.findOne({ name: 'Thing' }).lean();
    const conflict = await request(app).post('/api/orders').send({ items: [{ productId: thing!.id, quantity: 3 }] });
    expect(conflict.status).toBe(409);
    expect(conflict.body.error).toBe('stock_conflict');
    expect(conflict.body.error).not.toBe('insufficient_stock');
  });
});
