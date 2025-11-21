import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../../src/config/db';
import Product from '../../src/models/product';

/**
 * Model validation tests (T044):
 * - Required fields enforced
 * - Field length constraints (name <=120, description <=1000)
 * - Price >= 0
 * - UUID v4 id auto-generated and immutable
 */

describe('Product model validation', () => {
  beforeAll(async () => {
    await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/product_catalog_test');
  });

  afterAll(async () => {
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
    await disconnectDB();
  });

  it('generates a valid UUID v4 id and timestamps on create', async () => {
    const prod = await (Product as any).create({
      name: 'Test Product',
      description: 'A description',
      price: 9.99,
      stock: 5,
      imageUrl: 'images/product-test.jpg',
      categoryId: '11111111-1111-4111-8111-111111111111',
    });
    expect(prod.id).toMatch(/[0-9a-fA-F-]{36}/); // basic UUID length/char check
    // Confirm Mongoose validation produced v4 specifically
    const segments = prod.id.split('-');
    expect(segments[2][0]).toBe('4'); // version nibble for UUID v4
    expect(prod.createdAt).toBeInstanceOf(Date);
    expect(prod.updatedAt).toBeInstanceOf(Date);
  });

  it('enforces required fields (except stock has default)', async () => {
    await expect((Product as any).create({ description: 'desc', price: 1.23, stock: 1, imageUrl: 'images/x.jpg' })).rejects.toThrow(/name/);
    await expect((Product as any).create({ name: 'Name', price: 1.23, stock: 1, imageUrl: 'images/x.jpg' })).rejects.toThrow(/description/);
    await expect((Product as any).create({ name: 'Name', description: 'desc', stock: 1, imageUrl: 'images/x.jpg' })).rejects.toThrow(/price/);
    await expect((Product as any).create({ name: 'Name', description: 'desc', price: 1.23, stock: 1 })).rejects.toThrow(/imageUrl/);
    // Missing stock should apply default 0
    const prodNoStock = await (Product as any).create({ name: 'Name', description: 'desc', price: 1.23, imageUrl: 'images/x.jpg' });
    expect(prodNoStock.stock).toBe(0);
  });

  it('enforces length constraints on name and description', async () => {
    const longName = 'x'.repeat(121);
  await expect((Product as any).create({ name: longName, description: 'desc', price: 1, stock: 1, imageUrl: 'images/x.jpg' })).rejects.toThrow(/name too long/);
    const longDesc = 'y'.repeat(1001);
  await expect((Product as any).create({ name: 'Name', description: longDesc, price: 1, stock: 1, imageUrl: 'images/x.jpg' })).rejects.toThrow(/description too long/);
  });

  it('rejects negative price', async () => {
  await expect((Product as any).create({ name: 'Name', description: 'desc', price: -1, stock: 1, imageUrl: 'images/x.jpg' })).rejects.toThrow(/price must be >= 0/);
  });

  it('rejects negative or non-integer stock and empty imageUrl', async () => {
    await expect(
      (Product as any).create({ name: 'Bad Stock', description: 'desc', price: 1, stock: -1, imageUrl: 'images/x.jpg' })
    ).rejects.toThrow(/stock must be >= 0|stock must be a non-negative integer/);
    await expect(
      (Product as any).create({ name: 'Float Stock', description: 'desc', price: 1, stock: 1.5, imageUrl: 'images/x.jpg' })
    ).rejects.toThrow(/stock must be a non-negative integer/);
    await expect(
      (Product as any).create({ name: 'Empty Image', description: 'desc', price: 1, stock: 1, imageUrl: '' })
    ).rejects.toThrow(/Path `imageUrl` is required|imageUrl cannot be empty/);
  });

  it('prevents id modification after creation (immutable)', async () => {
    const prod = await (Product as any).create({ name: 'Immutable ID', description: 'desc', price: 1, stock: 1, imageUrl: 'images/x.jpg' });
    const originalId = prod.id;
    prod.id = '11111111-1111-4111-8111-111111111111'; // attempt another v4-like id
    await (prod as any).save();
    // Mongoose immutable should keep original value
    expect(prod.id).toBe(originalId);
  });

  it('removes internal _id from toJSON transform', async () => {
  const prod = await (Product as any).create({ name: 'Json Transform', description: 'desc', price: 2, stock: 2, imageUrl: 'images/x.jpg' });
    const json = (prod as any).toJSON();
    // _id should not be present on serialized output
    expect(json._id).toBeUndefined();
    // but id and timestamps remain
    expect(json.id).toBeDefined();
    expect(json.createdAt).toBeDefined();
    expect(json.updatedAt).toBeDefined();
  });

  it('rejects invalid manual id that is not UUID v4', async () => {
    await expect(
  (Product as any).create({ id: 'not-a-uuid', name: 'Bad ID', description: 'desc', price: 1, stock: 1, imageUrl: 'images/x.jpg' })
    ).rejects.toThrow(/id must be a valid UUID v4/);
  });
});
