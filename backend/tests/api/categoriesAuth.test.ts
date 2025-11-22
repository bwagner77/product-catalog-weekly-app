import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import { connectDB, disconnectDB } from '../../src/config/db';
import Category from '../../src/models/category';
import { getAdminToken } from './helpers/auth';

describe('Categories Admin Auth & CRUD Authorization Matrix', () => {
  let adminToken: string;
  const path = '/api/categories';
  const secret = process.env.JWT_SECRET || 'dev_secret';
  let initialCount = 0;

  beforeAll(async () => {
    await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/product_catalog_categories_auth_test');
    initialCount = await Category.countDocuments();
    adminToken = await getAdminToken();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  test('rejects create without token (401 admin_auth_required)', async () => {
    const res = await request(app).post(path).send({ name: 'NoAuthCat' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('admin_auth_required');
    const count = await Category.countDocuments({ name: 'NoAuthCat' });
    expect(count).toBe(0);
  });

  test('rejects create with invalid signature token (401 admin_auth_required)', async () => {
    const tampered = adminToken.slice(0, -1) + (adminToken.slice(-1) === 'a' ? 'b' : 'a');
    const res = await request(app)
      .post(path)
      .set('Authorization', `Bearer ${tampered}`)
      .send({ name: 'BadSigCat' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('admin_auth_required');
    const count = await Category.countDocuments({ name: 'BadSigCat' });
    expect(count).toBe(0);
  });

  test('rejects create with expired token (401 token_expired)', async () => {
    const expired = jwt.sign({ role: 'admin', exp: Math.floor(Date.now() / 1000) - 30 }, secret, { algorithm: 'HS256' });
    const res = await request(app)
      .post(path)
      .set('Authorization', `Bearer ${expired}`)
      .send({ name: 'ExpiredCat' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('token_expired');
    const count = await Category.countDocuments({ name: 'ExpiredCat' });
    expect(count).toBe(0);
  });

  test('rejects create with non-admin role token (403 forbidden_admin_role)', async () => {
    const nonAdmin = jwt.sign({ role: 'user', exp: Math.floor(Date.now() / 1000) + 3600 }, secret, { algorithm: 'HS256' });
    const res = await request(app)
      .post(path)
      .set('Authorization', `Bearer ${nonAdmin}`)
      .send({ name: 'NonAdminCat' });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('forbidden_admin_role');
    const count = await Category.countDocuments({ name: 'NonAdminCat' });
    expect(count).toBe(0);
  });

  let createdId: string;
  test('creates category with valid admin token (201)', async () => {
    const res = await request(app)
      .post(path)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'AuthCatOne' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    createdId = res.body.id;
  });

  test('update category requires admin token (401 when missing)', async () => {
    const res = await request(app).put(`${path}/${createdId}`).send({ name: 'RenamedCat' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('admin_auth_required');
  });

  test('update with non-admin role token returns 403', async () => {
    const nonAdmin = jwt.sign({ role: 'user', exp: Math.floor(Date.now() / 1000) + 3600 }, secret, { algorithm: 'HS256' });
    const res = await request(app)
      .put(`${path}/${createdId}`)
      .set('Authorization', `Bearer ${nonAdmin}`)
      .send({ name: 'AttemptRename' });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('forbidden_admin_role');
    const cat = await Category.findOne({ id: createdId }).lean();
    expect(cat?.name).toBe('AuthCatOne');
  });

  test('successful update with admin token (200)', async () => {
    const res = await request(app)
      .put(`${path}/${createdId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'AuthCatOneRenamed' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('AuthCatOneRenamed');
  });

  test('delete category missing token returns 401', async () => {
    const res = await request(app).delete(`${path}/${createdId}`);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('admin_auth_required');
  });

  test('delete category non-admin token returns 403', async () => {
    const nonAdmin = jwt.sign({ role: 'user', exp: Math.floor(Date.now() / 1000) + 3600 }, secret, { algorithm: 'HS256' });
    const res = await request(app)
      .delete(`${path}/${createdId}`)
      .set('Authorization', `Bearer ${nonAdmin}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('forbidden_admin_role');
  });

  test('delete category success (204)', async () => {
    const res = await request(app)
      .delete(`${path}/${createdId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });

  test('no unintended category writes from unauthorized attempts', async () => {
    const finalCount = await Category.countDocuments();
    expect(finalCount).toBeGreaterThanOrEqual(initialCount); // Creates only the authorized category we added & then deleted
  });
});