import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import { connectDB, disconnectDB } from '../../src/config/db';

// T198: Backend test verifying standardized unauthorized error bodies
// Covers: missing token (401 admin_auth_required), invalid signature (401 admin_auth_required),
// expired token (401 token_expired), non-admin role (403 forbidden_admin_role)

describe('Unauthorized error body format for protected writes', () => {
  const secret = process.env.JWT_SECRET || 'dev_secret';

  beforeAll(async () => {
    await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/product_catalog_unauth_error_format_test');
  });

  afterAll(async () => {
    await disconnectDB();
  });

  test('missing Authorization on POST /api/products → 401 admin_auth_required', async () => {
    const res = await request(app).post('/api/products').send({ name: 'A', description: 'B', price: 1, imageUrl: 'i.jpg', stock: 1 });
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ error: 'admin_auth_required', message: 'Admin authentication required' });
  });

  test('invalid signature token on POST /api/categories → 401 admin_auth_required', async () => {
    // Token-like string but not properly signed/verified
    const badToken = 'header.payload.bad-signature';
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${badToken}`)
      .send({ name: 'X' });
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ error: 'admin_auth_required', message: 'Admin authentication required' });
  });

  test('expired token on POST /api/products → 401 token_expired', async () => {
    const expired = jwt.sign({ role: 'admin', exp: Math.floor(Date.now() / 1000) - 60 }, secret, { algorithm: 'HS256' });
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${expired}`)
      .send({ name: 'A', description: 'B', price: 1, imageUrl: 'i.jpg', stock: 1 });
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ error: 'token_expired', message: 'Token expired' });
  });

  test('non-admin role on POST /api/categories → 403 forbidden_admin_role', async () => {
    const userToken = jwt.sign({ role: 'user', exp: Math.floor(Date.now() / 1000) + 3600 }, secret, { algorithm: 'HS256' });
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Y' });
    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({ error: 'forbidden_admin_role', message: 'Admin role required' });
  });
});
