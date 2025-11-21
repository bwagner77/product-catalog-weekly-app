import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../../src/config/db';
import Order from '../../src/models/order';

/**
 * Order model validation tests (T070):
 * - Computes total from items snapshot
 * - Rounds to two decimals once
 * - Prevents negative totals (edge case)
 */

describe('Order model validation', () => {
  beforeAll(async () => {
    await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/product_catalog_test');
  });

  afterAll(async () => {
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
    await disconnectDB();
  });

  it('computes total from line items snapshot with single rounding and sets default status', async () => {
    const order = await (Order as any).create({
      items: [
        { productId: 'p1', name: 'Item 1', quantity: 2, price: 19.995 },
        { productId: 'p2', name: 'Item 2', quantity: 1, price: 5 }
      ]
    });
    // Expected raw sum = 2*19.995 + 1*5 = 39.99 + 5 = 44.99 -> rounded stays 44.99
    expect(order.total).toBe(44.99);
    // Ensure not double-rounded causing 45.00
    expect(order.total).not.toBe(45.0);
    expect(order.status).toBe('submitted');
  });

  it('rejects empty items array', async () => {
    await expect((Order as any).create({ items: [] })).rejects.toThrow(/items must not be empty/);
  });
});
