import Product from '../models/product';

export type SeedResult = {
  inserted: number;
  matched: number;
  beforeCount: number;
  afterCount: number;
};

// Stable seed set for idempotency
const SEED_PRODUCTS = [
  {
    id: 'a5f4f5a2-2f1a-4f7b-9c8e-1a2b3c4d5e60',
    name: 'Classic Notebook',
    description: 'A durable, ruled notebook for everyday notes and ideas.',
    price: 7.99,
  },
  {
    id: 'b6e7d8c9-3a2b-4c5d-8e9f-0a1b2c3d4e70',
    name: 'Ballpoint Pen Set',
    description: 'Set of 5 smooth-writing ballpoint pens in assorted colors.',
    price: 4.49,
  },
  {
    id: 'c7d8e9f0-4b3c-5d6e-9f0a-1b2c3d4e5f80',
    name: 'Desk Organizer',
    description: 'Keep your workspace tidy with compartments for essentials.',
    price: 12.99,
  },
  {
    id: 'd8e9f0a1-5c4d-6e7f-0a1b-2c3d4e5f6a90',
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with adjustable DPI.',
    price: 19.99,
  },
  {
    id: 'e9f0a1b2-6d5e-7f80-1b2c-3d4e5f6a7b01',
    name: 'USB-C Cable',
    description: '1m USB-C to USB-C cable supporting fast charging and data.',
    price: 8.49,
  },
] as const;

export async function seedProducts(): Promise<SeedResult> {
  const beforeCount = await Product.countDocuments({});

  let inserted = 0;
  let matched = 0;

  for (const p of SEED_PRODUCTS) {
  const res = await Product.updateOne(
      { id: p.id },
      { $setOnInsert: p },
      { upsert: true }
    );
    // In Mongoose 8, UpdateResult may have upsertedCount
  const upserted = (res as { upsertedCount?: number; upsertedId?: unknown }).upsertedCount === 1 || Boolean((res as { upsertedId?: unknown }).upsertedId);
    if (upserted) inserted += 1;
    else matched += 1;
  }

  const afterCount = await Product.countDocuments({});

  // Seed verification log
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: 'info',
      event: 'seed_verification',
      inserted,
      matched,
      beforeCount,
      afterCount,
      requiredMin: SEED_PRODUCTS.length,
      status: afterCount >= SEED_PRODUCTS.length ? 'ok' : 'insufficient',
    })
  );

  return { inserted, matched, beforeCount, afterCount };
}

export default seedProducts;
