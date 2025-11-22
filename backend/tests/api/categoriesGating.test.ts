import request from 'supertest';
import app from '../../src/app';
import { connectDB, disconnectDB } from '../../src/config/db';
import Category from '../../src/models/category';
import { getAdminToken } from './helpers/auth';

describe('Category admin RBAC (JWT role=admin)', () => {
  let token: string;
  beforeAll(async () => {
    await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/product_catalog_test');
    await Category.deleteMany({});
    token = await getAdminToken();
  });

  afterAll(async () => {
    await Category.deleteMany({});
    await disconnectDB();
  });

  it('rejects create without token (401)', async () => {
    const res = await request(app).post('/api/categories').send({ name: 'NoAuth' });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'admin_auth_required');
  });

  it('creates category with valid token (201)', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Permitted' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Permitted');
  });

  it('allows update & delete only with token; missing token blocked', async () => {
    const created = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'UpDelBase' });
    expect(created.status).toBe(201);
    const id = created.body.id;
    const updNoAuth = await request(app).put(`/api/categories/${id}`).send({ name: 'ShouldNotUpdate' });
    expect(updNoAuth.status).toBe(401);
    const updAuth = await request(app)
      .put(`/api/categories/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'UpdatedOK' });
    expect(updAuth.status).toBe(200);
    const delNoAuth = await request(app).delete(`/api/categories/${id}`);
    expect(delNoAuth.status).toBe(401);
    const delAuth = await request(app)
      .delete(`/api/categories/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(delAuth.status).toBe(204);
  });
});
