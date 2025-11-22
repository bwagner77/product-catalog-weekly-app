import request from 'supertest';
import app from '../../src/app';
import { connectDB, disconnectDB } from '../../src/config/db';
import Category from '../../src/models/category';

describe('Category administration gating (ENABLE_CATEGORY_ADMIN)', () => {
  beforeAll(async () => {
    await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/product_catalog_test');
  });

  afterAll(async () => {
    await Category.deleteMany({});
    await disconnectDB();
  });

  it('returns 403 for create when gating disabled', async () => {
    process.env.ENABLE_CATEGORY_ADMIN = 'false';
    const res = await request(app).post('/api/categories').send({ name: 'ShouldFail' });
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
    const count = await Category.countDocuments({ name: 'ShouldFail' });
    expect(count).toBe(0);
  });

  it('allows create when gating enabled', async () => {
    process.env.ENABLE_CATEGORY_ADMIN = 'true';
    const res = await request(app).post('/api/categories').send({ name: 'Permitted' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Permitted');
  });

  it('blocks update & delete when gating disabled', async () => {
    process.env.ENABLE_CATEGORY_ADMIN = 'true';
    const created = await request(app).post('/api/categories').send({ name: 'UpDelBase' });
    expect(created.status).toBe(201);
    const id = created.body.id;
    process.env.ENABLE_CATEGORY_ADMIN = 'false';
    const upd = await request(app).put(`/api/categories/${id}`).send({ name: 'ShouldNotUpdate' });
    expect(upd.status).toBe(403);
    const del = await request(app).delete(`/api/categories/${id}`);
    expect(del.status).toBe(403);
    process.env.ENABLE_CATEGORY_ADMIN = 'true';
    const refetch = await request(app).get(`/api/categories/${id}`);
    expect(refetch.status).toBe(200);
    expect(refetch.body.name).toBe('UpDelBase');
  });
});
