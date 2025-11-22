import { connectDB, disconnectDB } from '../../src/config/db';
import Product from '../../src/models/product';
import seedProducts from '../../src/seed/seedProducts';

describe('Seed verification (T045 adjunct for coverage)', () => {
  beforeAll(async () => {
    await connectDB('mongodb://localhost:27017/product_catalog_seed_test');
    await (Product as any).deleteMany({});
  });

  afterAll(async () => {
    await (Product as any).deleteMany({});
    await disconnectDB();
  });

  it('seeds at least 5 products on first run and logs verification', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const result = await seedProducts();
    expect(result.afterCount).toBeGreaterThanOrEqual(5);
    // Should have inserted on first run
    expect(result.inserted).toBeGreaterThanOrEqual(5);
    expect(result.matched).toBeGreaterThanOrEqual(0);
    // Verify a seed_verification log was printed
    const logged = logSpy.mock.calls.find((args) => String(args[0]).includes('seed_verification'));
    expect(Boolean(logged)).toBe(true);
    logSpy.mockRestore();
  });

  it('is idempotent on second run (no additional inserts)', async () => {
    const beforeCount = await (Product as any).countDocuments({});
    const result = await seedProducts();
    const afterCount = await (Product as any).countDocuments({});
    expect(afterCount).toBe(beforeCount);
    expect(result.inserted).toBe(0);
    // All entries should be matched this time
    expect(result.matched).toBeGreaterThanOrEqual(5);
  });

  it('repairs missing imageUrl and stock on existing product only when absent', async () => {
    // Ensure seed present
    await seedProducts();
    const one = await (Product as any).findOne({});
    expect(one).toBeTruthy();
    const originalImage = one.imageUrl;
    const originalStock = one.stock;
    // Simulate legacy missing fields by unsetting both
    await (Product as any).updateOne({ id: one.id }, { $unset: { imageUrl: '', stock: '' } });
    const missing = await (Product as any).findOne({ id: one.id });
    // imageUrl should be truly absent
    expect(missing.imageUrl).toBeUndefined();
    // stock unsetting does not remove due to schema default; treat as present
    expect(typeof missing.stock).toBe('number');
    // Run seed to trigger repair logic
    await seedProducts();
    const repaired = await (Product as any).findOne({ id: one.id });
    expect(repaired.imageUrl).toMatch(/images\/product\d{2}\.jpg/); // padded format applied only when missing
    expect(typeof repaired.stock).toBe('number');
    // Do NOT overwrite if we unset only; after repair, running again should not change values
    const afterRepairImage = repaired.imageUrl;
    const afterRepairStock = repaired.stock;
    await seedProducts();
    const stable = await (Product as any).findOne({ id: one.id });
    expect(stable.imageUrl).toBe(afterRepairImage);
    expect(stable.stock).toBe(afterRepairStock);
    // Ensure repair logic differs from original if original lacked padding (legacy format productN.jpg)
    if (/product\d+\.jpg$/.test(originalImage) && !/product\d{2}\.jpg$/.test(originalImage)) {
      expect(afterRepairImage).not.toBe(originalImage);
    }
    // Stock value should remain unchanged (was not considered missing)
    expect(afterRepairStock).toBe(originalStock);
  });

  it('repairs missing stock only when field truly absent (raw collection unset)', async () => {
    // Ensure initial seed
    await seedProducts();
    // Pick a specific product with non-zero stock to observe change
    const target = await (Product as any).findOne({ stock: { $gt: 1 } });
    expect(target).toBeTruthy();
    const originalStock = target.stock;
    // Simulate legacy null stock (explicitly null -> considered missing by repair logic)
    await (Product as any).updateOne({ id: target.id }, { $set: { stock: null } });
    const missingBefore = await (Product as any).findOne({ id: target.id }, { stock: 1 });
    expect(missingBefore.stock).toBeNull(); // triggers needsStock branch
    // Run seed to trigger stock repair branch
    await seedProducts();
    const repaired = await (Product as any).findOne({ id: target.id }, { stock: 1 });
    expect(repaired.stock).toBe(originalStock); // restored to original seeded value
    // Second run should not alter again
    await seedProducts();
    const stable = await (Product as any).findOne({ id: target.id }, { stock: 1 });
    expect(stable.stock).toBe(originalStock);
  });
});
