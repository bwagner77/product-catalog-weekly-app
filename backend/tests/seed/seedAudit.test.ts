import { connectDB, disconnectDB } from '../../src/config/db';
import seedProducts from '../../src/seed/seedProducts';
import seedCategories from '../../src/seed/seedCategories';
import Product from '../../src/models/product';
import Category from '../../src/models/category';

/**
 * Seed audit: validates deterministic, sufficient seed data
 * - ≥20 products
 * - ≥5 categories
 * - imageUrl pattern images/product<N>.jpg
 * - mixed stock: at least one zero-stock and one >0
 */

describe('Seed Audit', () => {
  beforeAll(async () => {
    await connectDB('mongodb://localhost:27017/product_catalog_seed_audit_test');
    await seedCategories();
    await seedProducts();
  });

  afterAll(async () => {
    await Product.deleteMany({});
    await Category.deleteMany({});
    await disconnectDB();
  });

  it('verifies product and category counts plus image & stock patterns', async () => {
    const products = await Product.find({}).lean();
    const categories = await Category.find({}).lean();

    expect(products.length).toBeGreaterThanOrEqual(20);
    expect(categories.length).toBeGreaterThanOrEqual(5);

    const imagePattern = /^images\/product\d+\.jpg$/;
    let zeroStock = 0;
    let positiveStock = 0;

    for (const p of products) {
      expect(typeof p.imageUrl).toBe('string');
      expect(p.imageUrl).toMatch(imagePattern);
      if (p.stock === 0) zeroStock++;
      if (p.stock > 0) positiveStock++;
    }

    expect(zeroStock).toBeGreaterThanOrEqual(1);
    expect(positiveStock).toBeGreaterThanOrEqual(1);
  });
});
