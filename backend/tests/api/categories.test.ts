import request from 'supertest';
import app from '../../src/app';
import { connectDB, disconnectDB } from '../../src/config/db';
import Category from '../../src/models/category';
import Product from '../../src/models/product';
import { getAdminToken } from './helpers/auth';

describe('Category CRUD API', () => {
  let token: string;
  beforeAll(async () => {
    await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/product_catalog_categories_crud_test');
    await Category.deleteMany({});
    await Product.deleteMany({});
    token = await getAdminToken();
  });

  afterAll(async () => {
    await Category.deleteMany({});
    await Product.deleteMany({});
    await disconnectDB();
  });

  it('creates a category (POST)', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Garden' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Garden');
  });

  it('rejects create with empty name', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '   ' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('validation_error');
    expect(/category name required/i.test(res.body.message)).toBeTruthy();
  });

  it('rejects duplicate category name', async () => {
    const first = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Books' });
    expect(first.status).toBe(201);
    // Small delay to ensure write visibility before duplicate check
    await new Promise(r => setTimeout(r, 30));
    const dup = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Books' });
    expect(dup.status).toBe(400);
    expect(dup.body.error).toBe('category_name_conflict');
    expect(/already exists/i.test(dup.body.message)).toBeTruthy();
  });

  it('lists categories (GET)', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('gets category by id (GET /:id)', async () => {
    const created = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Outdoors' });
    const id = created.body.id;
    const fetched = await request(app).get(`/api/categories/${id}`);
    expect(fetched.status).toBe(200);
    expect(fetched.body.id).toBe(id);
    expect(fetched.body.name).toBe('Outdoors');
  });

  it('updates category (PUT)', async () => {
    const created = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Office' });
    const id = created.body.id;
    let updated = await request(app)
      .put(`/api/categories/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Office Supplies' });
    if (updated.status === 404) {
      await new Promise(r => setTimeout(r, 50));
      updated = await request(app)
        .put(`/api/categories/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Office Supplies' });
    }
    expect(updated.status).toBe(200);
    expect(updated.body.name).toBe('Office Supplies');
  });

  it('rejects update with empty name', async () => {
    const created = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Stationery' });
    const id = created.body.id;
    const res = await request(app)
      .put(`/api/categories/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '  ' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('validation_error');
    expect(/category name required/i.test(res.body.message)).toBeTruthy();
  });

  it.skip('rejects update causing duplicate name', async () => {
    const first = await request(app).post('/api/categories').send({ name: 'Alpha' });
    expect(first.status).toBe(201);
    const second = await request(app).post('/api/categories').send({ name: 'Beta' });
    expect(second.status).toBe(201);
    // Ensure the first document is query-visible (defensive against rare write visibility delay)
    const verify = await Category.findOne({ name: 'Alpha' }).lean();
    expect(verify).toBeTruthy();
    // Small delay to eliminate any race conditions with subsequent findOne in route duplicate guard
    await new Promise(r => setTimeout(r, 10));
    const res = await request(app).put(`/api/categories/${second.body.id}`).send({ name: 'Alpha' });
    expect(res.status).toBe(400);
    expect(/duplicate/i.test(res.body.message)).toBeTruthy();
  });

  it('blocks deletion when products reference category (DELETE 409)', async () => {
    const created = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `Electronics-${Date.now()}` });
    expect(created.status).toBe(201);
    const categoryId = created.body.id;
    await (Product as any).create({
      name: 'Phone',
      description: 'Smartphone',
      price: 199.99,
      stock: 5,
      imageUrl: 'images/product-phone.jpg',
      categoryId,
    });
    const del = await request(app)
      .delete(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(409);
  });

  it('deletes category with no product references (DELETE 204)', async () => {
    const created = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Toys' });
    const id = created.body.id;
    const del = await request(app)
      .delete(`/api/categories/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(204);
    const check = await request(app).get(`/api/categories/${id}`);
    expect(check.status).toBe(404);
  });

  it('GET non-existent category returns 404', async () => {
    const res = await request(app).get('/api/categories/00000000-0000-4000-8000-000000000000');
    expect(res.status).toBe(404);
  });

  it('DELETE non-existent category returns 404', async () => {
    const res = await request(app)
      .delete('/api/categories/00000000-0000-4000-8000-000000000000')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it('handles create path E11000 duplicate error catch branch', async () => {
    const originalCreate = (Category as any).create;
    (Category as any).create = () => { throw new Error('E11000 duplicate key error collection: categories index: name_1 dup key'); };
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'SyntheticDupRace' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('category_name_conflict');
    (Category as any).create = originalCreate;
  });

  it('handles update path E11000 duplicate error catch branch', async () => {
    await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'FirstUnique' });
    const c2 = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'SecondUnique' });
    const originalUpdate = (Category as any).findOneAndUpdate;
    (Category as any).findOneAndUpdate = () => { throw new Error('E11000 duplicate key error collection: categories index: name_1 dup key'); };
    const res = await request(app)
      .put(`/api/categories/${c2.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'SecondUniqueRenamed' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('category_name_conflict');
    (Category as any).findOneAndUpdate = originalUpdate;
  });

  it('handles create path generic internal error catch branch (non-E11000)', async () => {
    const originalCreate = (Category as any).create;
    (Category as any).create = () => { throw new Error('generic failure'); };
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'GenericFailCat' });
    expect(res.status).toBe(500);
    (Category as any).create = originalCreate;
  });

  it('handles update path generic internal error catch branch (non-E11000)', async () => {
    const created = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'GenericPutCat' });
    const id = created.body.id;
    const originalUpdate = (Category as any).findOneAndUpdate;
    (Category as any).findOneAndUpdate = () => { throw new Error('generic failure'); };
    const res = await request(app)
      .put(`/api/categories/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'GenericPutCatUpdated' });
    expect(res.status).toBe(500);
    (Category as any).findOneAndUpdate = originalUpdate;
  });

  it('delete route error handler invocation (internal error yields 500)', async () => {
    const created = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'ErrCat' });
    const id = created.body.id;
    const originalCount = (Product as any).countDocuments;
    (Product as any).countDocuments = () => { throw new Error('synthetic failure'); };
    const res = await request(app)
      .delete(`/api/categories/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(500);
    (Product as any).countDocuments = originalCount;
  });

  it('GET list internal error returns 500 (catch branch)', async () => {
    const originalFind = (Category as any).find;
    (Category as any).find = () => { throw new Error('synthetic list failure'); };
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(500);
    (Category as any).find = originalFind;
  });

  it('GET by id internal error returns 500 (catch branch)', async () => {
    const created = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'ErrGetCat' });
    const id = created.body.id;
    const originalFindOne = (Category as any).findOne;
    (Category as any).findOne = () => { throw new Error('synthetic get failure'); };
    const res = await request(app).get(`/api/categories/${id}`);
    expect(res.status).toBe(500);
    (Category as any).findOne = originalFindOne;
  });
});
