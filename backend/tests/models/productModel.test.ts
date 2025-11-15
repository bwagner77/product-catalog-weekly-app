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
    });
    expect(prod.id).toMatch(/[0-9a-fA-F-]{36}/); // basic UUID length/char check
    // Confirm Mongoose validation produced v4 specifically
    const segments = prod.id.split('-');
    expect(segments[2][0]).toBe('4'); // version nibble for UUID v4
    expect(prod.createdAt).toBeInstanceOf(Date);
    expect(prod.updatedAt).toBeInstanceOf(Date);
  });

  it('enforces required fields', async () => {
    // Missing name
  await expect((Product as any).create({ description: 'desc', price: 1.23 })).rejects.toThrow(/name/);
    // Missing description
  await expect((Product as any).create({ name: 'Name', price: 1.23 })).rejects.toThrow(/description/);
    // Missing price
  await expect((Product as any).create({ name: 'Name', description: 'desc' })).rejects.toThrow(/price/);
  });

  it('enforces length constraints on name and description', async () => {
    const longName = 'x'.repeat(121);
  await expect((Product as any).create({ name: longName, description: 'desc', price: 1 })).rejects.toThrow(/name too long/);
    const longDesc = 'y'.repeat(1001);
  await expect((Product as any).create({ name: 'Name', description: longDesc, price: 1 })).rejects.toThrow(/description too long/);
  });

  it('rejects negative price', async () => {
  await expect((Product as any).create({ name: 'Name', description: 'desc', price: -1 })).rejects.toThrow(/price must be >= 0/);
  });

  it('prevents id modification after creation (immutable)', async () => {
    const prod = await (Product as any).create({ name: 'Immutable ID', description: 'desc', price: 1 });
    const originalId = prod.id;
    prod.id = '11111111-1111-4111-8111-111111111111'; // attempt another v4-like id
    // Save should NOT change the id value in database
    await (prod as any).save();
    const fetched = await Product.find({ id: originalId }).limit(1).lean();
    expect(fetched[0].id).toBe(originalId);
  });

  it('removes internal _id from toJSON transform', async () => {
    const prod = await (Product as any).create({ name: 'Json Transform', description: 'desc', price: 2 });
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
      (Product as any).create({ id: 'not-a-uuid', name: 'Bad ID', description: 'desc', price: 1 })
    ).rejects.toThrow(/id must be a valid UUID v4/);
  });
});
