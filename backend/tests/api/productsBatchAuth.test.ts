import request from 'supertest';
import app from '../../src/app';
import { connectDB, disconnectDB } from '../../src/config/db';
import Product from '../../src/models/product';
import jwt from 'jsonwebtoken';
import { getAdminToken } from './helpers/auth';

/**
 * T178: Batch product write attempts with expired / missing token should yield auth errors
 * and perform zero successful mutations (SC-029, SC-030 reinforcement).
 */

describe('Batch Protected Product Writes Auth Enforcement', () => {
  let expiredToken: string;
  let adminToken: string;
  const secret = process.env.JWT_SECRET || 'dev_secret';

  beforeAll(async () => {
    await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/product_catalog_products_batch_auth_test');
    await Product.deleteMany({});
    adminToken = await getAdminToken();
    expiredToken = jwt.sign({ role: 'admin', exp: Math.floor(Date.now() / 1000) - 300 }, secret, { algorithm: 'HS256' });
  });

  afterAll(async () => {
    await disconnectDB();
  });

  test('expired token batch creates rejected with token_expired and zero mutation', async () => {
    const before = await Product.countDocuments();
    const attempts = await Promise.all([
      request(app).post('/api/products').set('Authorization', `Bearer ${expiredToken}`).send({ name: 'A', description: 'A', price: 1, imageUrl: 'i.jpg', stock: 1 }),
      request(app).post('/api/products').set('Authorization', `Bearer ${expiredToken}`).send({ name: 'B', description: 'B', price: 1, imageUrl: 'i.jpg', stock: 1 }),
      request(app).post('/api/products').set('Authorization', `Bearer ${expiredToken}`).send({ name: 'C', description: 'C', price: 1, imageUrl: 'i.jpg', stock: 1 }),
    ]);
    attempts.forEach(r => {
      expect(r.status).toBe(401);
      expect(r.body.error).toBe('token_expired');
    });
    const after = await Product.countDocuments();
    expect(after).toBe(before); // zero mutation guarantee
  });

  test('missing token batch creates rejected with admin_auth_required and zero mutation', async () => {
    const before = await Product.countDocuments();
    const attempts = await Promise.all([
      request(app).post('/api/products').send({ name: 'M1', description: 'M1', price: 1, imageUrl: 'i.jpg', stock: 1 }),
      request(app).post('/api/products').send({ name: 'M2', description: 'M2', price: 1, imageUrl: 'i.jpg', stock: 1 }),
    ]);
    attempts.forEach(r => {
      expect(r.status).toBe(401);
      expect(r.body.error).toBe('admin_auth_required');
    });
    const after = await Product.countDocuments();
    expect(after).toBe(before);
  });

  test('valid admin token batch creates succeed (control)', async () => {
    const before = await Product.countDocuments();
    const attempts = await Promise.all([
      request(app).post('/api/products').set('Authorization', `Bearer ${adminToken}`).send({ name: 'V1', description: 'V1', price: 1, imageUrl: 'i.jpg', stock: 1 }),
      request(app).post('/api/products').set('Authorization', `Bearer ${adminToken}`).send({ name: 'V2', description: 'V2', price: 2, imageUrl: 'i.jpg', stock: 2 }),
    ]);
    attempts.forEach(r => {
      expect(r.status).toBe(201);
      expect(r.body).toHaveProperty('id');
    });
    const after = await Product.countDocuments();
    expect(after).toBe(before + attempts.length);
  });
});
