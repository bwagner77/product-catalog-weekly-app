import request from 'supertest';
import app from '../../src/app';
import { connectDB, disconnectDB } from '../../src/config/db';
import Category from '../../src/models/category';
import { getAdminToken } from './helpers/auth';

describe('Category Case-Insensitive Uniqueness (FR-055)', () => {
  let token: string;
  beforeAll(async () => {
    await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/product_catalog_category_unique_test');
    await Category.deleteMany({});
    token = await getAdminToken();
  });

  afterAll(async () => {
    await Category.deleteMany({});
    await disconnectDB();
  });

  it('rejects same name differing only by case with 409 category_name_conflict', async () => {
    const first = await request(app).post('/api/categories').set('Authorization', `Bearer ${token}`).send({ name: 'Books' });
    expect(first.status).toBe(201);
    const second = await request(app).post('/api/categories').set('Authorization', `Bearer ${token}`).send({ name: 'books' });
    expect(second.status).toBe(409);
    expect(second.body.error).toBe('category_name_conflict');
  });
});
