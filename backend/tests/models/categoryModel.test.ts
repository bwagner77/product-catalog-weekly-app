import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../../src/config/db';
import Category from '../../src/models/category';

/**
 * Category model validation tests (T069):
 * - Required name
 * - Unique name constraint
 * - UUID v4 id auto-generated
 */

describe('Category model validation', () => {
  beforeAll(async () => {
    await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/product_catalog_test');
    // Ensure unique index exists before uniqueness tests
    await (Category as any).init();
    try {
      await (Category as any).collection.createIndex({ name: 1 }, { unique: true });
    } catch (e) {
      // ignore if already exists
    }
  });

  afterAll(async () => {
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
    await disconnectDB();
  });

  it('creates category with UUID v4 id and timestamps', async () => {
    const cat = await (Category as any).create({ name: 'Electronics' });
    expect(cat.id).toMatch(/[0-9a-fA-F-]{36}/);
    const segments = cat.id.split('-');
    expect(segments[2][0]).toBe('4');
    expect(cat.createdAt).toBeInstanceOf(Date);
    expect(cat.updatedAt).toBeInstanceOf(Date);
  });

  it('requires non-empty name', async () => {
    await expect((Category as any).create({ name: '' })).rejects.toThrow(/Path `name` is required|name cannot be empty/);
  });

  it('enforces unique name constraint', async () => {
    await (Category as any).create({ name: 'Home' });
    await expect((Category as any).create({ name: 'Home' })).rejects.toThrow(/E11000|duplicate key/);
  });
});
