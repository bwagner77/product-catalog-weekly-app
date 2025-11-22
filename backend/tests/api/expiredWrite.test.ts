import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import { connectDB, disconnectDB } from '../../src/config/db';
import { getAdminToken } from './helpers/auth';
import Product from '../../src/models/product';
import Category from '../../src/models/category';

/**
 * T187: Expired protected write attempt test
 * Ensures expired token yields 401 token_expired and NO mutations occur for product & category writes.
 */

describe('Expired protected write attempts zero-mutation (SC-030)', () => {
  let adminToken: string;
  let expiredToken: string;
  const secret = process.env.JWT_SECRET || 'dev_secret';
  const productsPath = '/api/products';
  const categoriesPath = '/api/categories';
  let initialProductCount = 0;
  let initialCategoryCount = 0;
  let existingProductId: string;
  let existingCategoryId: string;

  beforeAll(async () => {
    await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/product_catalog_expired_write_test');
    // Clean collections to guarantee baseline counts are accurate
    await Category.deleteMany({});
    await Product.deleteMany({});
    adminToken = await getAdminToken();
    expiredToken = jwt.sign({ role: 'admin', exp: Math.floor(Date.now() / 1000) - 120 }, secret, { algorithm: 'HS256' });

    // Establish baseline counts
    initialProductCount = await Product.countDocuments();
    initialCategoryCount = await Category.countDocuments();

    // Create one product & one category with valid token for update/delete attempts
    const catRes = await request(app)
      .post(categoriesPath)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'BaselineCat' });
    expect(catRes.status).toBe(201);
    existingCategoryId = catRes.body.id;

    const prodRes = await request(app)
      .post(productsPath)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'BaselineProd', description: 'Desc', price: 1, imageUrl: 'http://x/img.png', stock: 5 });
    expect(prodRes.status).toBe(201);
    existingProductId = prodRes.body.id;
  });

  afterAll(async () => {
    await disconnectDB();
  });

  async function assertNoProductMutation() {
    const count = await Product.countDocuments();
    expect(count).toBeGreaterThanOrEqual(initialProductCount + 1); // baseline + created product only
  }

  async function assertNoCategoryMutation() {
    const count = await Category.countDocuments();
    expect(count).toBeGreaterThanOrEqual(initialCategoryCount + 1); // baseline + created category only
  }

  test('expired token product create blocked (401 token_expired)', async () => {
    const res = await request(app)
      .post(productsPath)
      .set('Authorization', `Bearer ${expiredToken}`)
      .send({ name: 'ShouldNotCreate', description: 'No', price: 2, imageUrl: 'http://x/a.png', stock: 1 });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('token_expired');
    await assertNoProductMutation();
  });

  test('expired token product update blocked (401 token_expired)', async () => {
    const res = await request(app)
      .put(`${productsPath}/${existingProductId}`)
      .set('Authorization', `Bearer ${expiredToken}`)
      .send({ price: 999 });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('token_expired');
    const product = await Product.findOne({ id: existingProductId }).lean();
    expect(product?.price).toBe(1); // unchanged
  });

  test('expired token product delete blocked (401 token_expired)', async () => {
    const res = await request(app)
      .delete(`${productsPath}/${existingProductId}`)
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('token_expired');
    const product = await Product.findOne({ id: existingProductId }).lean();
    expect(product).toBeTruthy();
  });

  test('expired token category create blocked (401 token_expired)', async () => {
    const res = await request(app)
      .post(categoriesPath)
      .set('Authorization', `Bearer ${expiredToken}`)
      .send({ name: 'ShouldNotCreateCat' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('token_expired');
    await assertNoCategoryMutation();
  });

  test('expired token category update blocked (401 token_expired)', async () => {
    const res = await request(app)
      .put(`${categoriesPath}/${existingCategoryId}`)
      .set('Authorization', `Bearer ${expiredToken}`)
      .send({ name: 'NewName' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('token_expired');
    const cat = await Category.findOne({ id: existingCategoryId }).lean();
    expect(cat?.name).toBe('BaselineCat');
  });

  test('expired token category delete blocked (401 token_expired)', async () => {
    const res = await request(app)
      .delete(`${categoriesPath}/${existingCategoryId}`)
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('token_expired');
    const cat = await Category.findOne({ id: existingCategoryId }).lean();
    expect(cat).toBeTruthy();
  });
});
