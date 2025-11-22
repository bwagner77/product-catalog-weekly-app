import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import { connectDB, disconnectDB } from '../../src/config/db';
import { getAdminToken } from './helpers/auth';
import Product from '../../src/models/product';
import Category from '../../src/models/category';

/**
 * T183: Aggregated structured error codes test (SC-033)
 * Verifies endpoints return standardized `{ error, message }` bodies and full membership of expected codes.
 */

describe('Structured Error Codes Catalog', () => {
  const expectedCodes = new Set([
    'admin_auth_required',
    'invalid_credentials',
    'token_expired',
    'forbidden_admin_role',
    'validation_error',
    'category_name_conflict',
    'not_found',
    'stock_conflict',
  ]);
  const seen = new Set<string>();
  const secret = process.env.JWT_SECRET || 'dev_secret';
  let adminToken: string;
  let createdCategoryId: string;
  let lowStockProductId: string;

  beforeAll(async () => {
    await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/product_catalog_error_codes_test');
    // Ensure clean slate to avoid unintended duplicate conflicts
    await Category.deleteMany({});
    await Product.deleteMany({});
    adminToken = await getAdminToken();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  function assertError(res: request.Response) {
    expect(res.body).toBeTruthy();
    expect(typeof res.body.error).toBe('string');
    expect(typeof res.body.message).toBe('string');
    seen.add(res.body.error);
  }

  test('invalid credentials -> invalid_credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'WRONG' });
    expect(res.status).toBe(401);
    assertError(res);
    expect(res.body.error).toBe('invalid_credentials');
  });

  test('missing auth on category create -> admin_auth_required', async () => {
    const res = await request(app).post('/api/categories').send({ name: 'NoAuth' });
    expect(res.status).toBe(401);
    assertError(res);
    expect(res.body.error).toBe('admin_auth_required');
  });

  test('expired token on product create -> token_expired', async () => {
    const expired = jwt.sign({ role: 'admin', exp: Math.floor(Date.now() / 1000) - 10 }, secret, { algorithm: 'HS256' });
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${expired}`)
      .send({ name: 'X', description: 'Y', price: 1, imageUrl: 'x.jpg', stock: 1 });
    expect(res.status).toBe(401);
    assertError(res);
    expect(res.body.error).toBe('token_expired');
  });

  test('non-admin role token on category create -> forbidden_admin_role', async () => {
    const nonAdmin = jwt.sign({ role: 'user', exp: Math.floor(Date.now() / 1000) + 3600 }, secret, { algorithm: 'HS256' });
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${nonAdmin}`)
      .send({ name: 'NonAdminAttempt' });
    expect(res.status).toBe(403);
    assertError(res);
    expect(res.body.error).toBe('forbidden_admin_role');
  });

  test('validation_error on invalid product fields', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: '', description: '', price: -1, imageUrl: '', stock: -5 });
    expect(res.status).toBe(400);
    assertError(res);
    expect(res.body.error).toBe('validation_error');
  });

  test('category_name_conflict duplicate', async () => {
    // Create initial
    const first = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'DupCat' });
    expect(first.status).toBe(201);
    createdCategoryId = first.body.id;
    // Duplicate attempt
    const dup = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'DupCat' });
    expect(dup.status).toBe(409);
    assertError(dup);
    expect(dup.body.error).toBe('category_name_conflict');
  });

  test('not_found on product update missing id', async () => {
    const res = await request(app)
      .put('/api/products/does-not-exist')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'NewName' });
    expect(res.status).toBe(404);
    assertError(res);
    expect(res.body.error).toBe('not_found');
  });

  test('stock_conflict on insufficient stock order', async () => {
    // Create product with stock 0
    const prodRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'LowStock', description: 'ls', price: 1, imageUrl: 'ls.jpg', stock: 0 });
    expect(prodRes.status).toBe(201);
    lowStockProductId = prodRes.body.id;
    // Attempt order with quantity 1
    const orderRes = await request(app)
      .post('/api/orders')
      .send({ items: [{ productId: lowStockProductId, quantity: 1 }] });
    expect(orderRes.status).toBe(409);
    // Order route returns error + message; ensure mapping
    if (orderRes.body.error) {
      assertError(orderRes);
      expect(orderRes.body.error).toBe('stock_conflict');
    } else {
      // If legacy message shape encountered, treat as failure.
      throw new Error('Expected structured stock_conflict error body');
    }
  });

  test('all expected codes observed', () => {
    expectedCodes.forEach(code => {
      if (!seen.has(code)) {
        // Provide helpful diff
        // eslint-disable-next-line no-console
        console.error('Missing expected error code:', code, 'Seen:', Array.from(seen));
      }
    });
    // Adjust for actual number of codes seen (7 if stock_conflict not triggered)
    expect(seen.size).toBeGreaterThanOrEqual(7);
    expectedCodes.forEach(code => expect(seen.has(code)).toBeTruthy());
  });
});
