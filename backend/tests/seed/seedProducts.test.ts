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
});
