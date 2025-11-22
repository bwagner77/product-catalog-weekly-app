import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import { connectDB, disconnectDB } from '../../src/config/db';
import { getAdminToken } from './helpers/auth';

describe('Products Admin Auth & CRUD', () => {
  let token: string;
  const basePath = '/api/products';

  beforeAll(async () => {
    await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/product_catalog_test');
    token = await getAdminToken();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  test('rejects create without token (401)', async () => {
    const res = await request(app).post(basePath).send({
      name: 'Widget', description: 'A widget', price: 10, imageUrl: 'http://example.com/x.png', stock: 5
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('admin_auth_required');
  });

  test('rejects create with invalid fields (400)', async () => {
    const res = await request(app)
      .post(basePath)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '', description: '', price: -1, imageUrl: '', stock: -5 });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'invalid product fields');
  });

  let createdId: string;
  test('creates product with valid admin token (201)', async () => {
    const res = await request(app)
      .post(basePath)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'AuthProdOne',
        description: 'Auth product one description',
        price: 42,
        imageUrl: 'http://example.com/auth1.png',
        stock: 10
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    createdId = res.body.id;
  });

  test('update product success (200)', async () => {
    const res = await request(app)
      .put(`${basePath}/${createdId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ price: 50, stock: 12 });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('price', 50);
    expect(res.body).toHaveProperty('stock', 12);
  });

  test('update product validation failure (400)', async () => {
    const res = await request(app)
      .put(`${basePath}/${createdId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ price: -10 });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'invalid product fields');
  });

  test('update product not found (404)', async () => {
    const res = await request(app)
      .put(`${basePath}/00000000-0000-4000-8000-000000000000`)
      .set('Authorization', `Bearer ${token}`)
      .send({ price: 99 });
    expect(res.status).toBe(404);
  });

  test('delete product not found (404)', async () => {
    const res = await request(app)
      .delete(`${basePath}/00000000-0000-4000-8000-000000000000`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  test('delete product success (204)', async () => {
    // Create a fresh product just for deletion to avoid interference
    const createRes = await request(app)
      .post(basePath)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'ToDelete', description: 'Temp', price: 1, imageUrl: 'http://x/d.png', stock: 0 });
    expect(createRes.status).toBe(201);
    const delRes = await request(app)
      .delete(`${basePath}/${createRes.body.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(delRes.status).toBe(204);
  });

  test('search branch: search only', async () => {
    // Create one searchable product
    const create = await request(app)
      .post(basePath)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'SearchableAlpha', description: 'Alpha desc', price: 5, imageUrl: 'http://ex.com/a.png', stock: 2 });
    expect(create.status).toBe(201);
    const res = await request(app).get(`${basePath}?search=Alpha`);
    expect(res.status).toBe(200);
    expect(res.body.some((p: any) => p.name === 'SearchableAlpha')).toBe(true);
  });

  test('search branch: category only yields array', async () => {
    const res = await request(app).get(`${basePath}?categoryId=nonexistent-category`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('search branch: search + category', async () => {
    const res = await request(app).get(`${basePath}?search=SearchableAlpha&categoryId=nonexistent-category`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('search branch: empty search ignored', async () => {
    const res = await request(app).get(`${basePath}?search=`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('invalid signature token returns 401 admin_auth_required', async () => {
    const tampered = token.slice(0, -1) + (token.slice(-1) === 'a' ? 'b' : 'a');
    const res = await request(app)
      .post(basePath)
      .set('Authorization', `Bearer ${tampered}`)
      .send({ name: 'BadSig', description: 'Bad sig', price: 1, imageUrl: 'http://x/y.png', stock: 1 });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('admin_auth_required');
  });

  test('expired token returns 401 token_expired', async () => {
    const secret = process.env.JWT_SECRET || 'dev_secret';
    // exp intentionally set to past so manual expiration branch triggers
    const expiredToken = jwt.sign({ role: 'admin', exp: Math.floor(Date.now() / 1000) - 60 }, secret, { algorithm: 'HS256' });
    const res = await request(app)
      .post(basePath)
      .set('Authorization', `Bearer ${expiredToken}`)
      .send({ name: 'ExpiredProd', description: 'Expired desc', price: 2, imageUrl: 'http://x/e.png', stock: 1 });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('token_expired');
  });

    test('non-admin role token returns 403 forbidden_admin_role', async () => {
      const secret = process.env.JWT_SECRET || 'dev_secret';
      const nonAdmin = jwt.sign({ role: 'user', exp: Math.floor(Date.now() / 1000) + 3600 }, secret, { algorithm: 'HS256' });
      const res = await request(app)
        .post(basePath)
        .set('Authorization', `Bearer ${nonAdmin}`)
        .send({ name: 'NonAdminProd', description: 'Should fail', price: 5, imageUrl: 'http://x/n.png', stock: 1 });
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('forbidden_admin_role');
    });
});
