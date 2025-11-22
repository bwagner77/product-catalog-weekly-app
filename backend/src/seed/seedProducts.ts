import Product from '../models/product';

// NOTE (T067): Orders are NOT seeded in this phase; order seeding remains out-of-scope.

export type SeedResult = {
  inserted: number;
  matched: number;
  beforeCount: number;
  afterCount: number;
};

// Stable seed set for idempotency (≥20 products) with categoryId, imageUrl, and varied stock (including zeros)
// Category IDs must match those created by seedCategories.ts for referential integrity.
const CATEGORY_IDS = {
  electronics: '11111111-1111-4111-8111-111111111111',
  office: '22222222-2222-4222-8222-222222222222',
  accessories: '33333333-3333-4333-8333-333333333333',
  home: '44444444-4444-4444-8444-444444444444',
  fitness: '55555555-5555-4555-8555-555555555555',
} as const;

const SEED_PRODUCTS = [
  {
    id: 'a5f4f5a2-2f1a-4f7b-9c8e-1a2b3c4d5e60',
    name: 'Classic Notebook',
    description: 'A durable, ruled notebook for everyday notes and ideas.',
    price: 7.99,
    categoryId: CATEGORY_IDS.office,
    stock: 50,
    imageUrl: 'images/product1.jpg',
  },
  {
    id: 'b6e7d8c9-3a2b-4c5d-8e9f-0a1b2c3d4e70',
    name: 'Ballpoint Pen Set',
    description: 'Set of 5 smooth-writing ballpoint pens in assorted colors.',
    price: 4.49,
    categoryId: CATEGORY_IDS.office,
    stock: 0,
    imageUrl: 'images/product2.jpg',
  },
  {
    id: 'c7d8e9f0-4b3c-5d6e-9f0a-1b2c3d4e5f80',
    name: 'Desk Organizer',
    description: 'Keep your workspace tidy with compartments for essentials.',
    price: 12.99,
    categoryId: CATEGORY_IDS.home,
    stock: 25,
    imageUrl: 'images/product3.jpg',
  },
  {
    id: 'd8e9f0a1-5c4d-6e7f-0a1b-2c3d4e5f6a90',
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with adjustable DPI.',
    price: 19.99,
    categoryId: CATEGORY_IDS.electronics,
    stock: 40,
    imageUrl: 'images/product4.jpg',
  },
  {
    id: 'e9f0a1b2-6d5e-7f80-1b2c-3d4e5f6a7b01',
    name: 'USB-C Cable',
    description: '1m USB-C to USB-C cable supporting fast charging and data.',
    price: 8.49,
    categoryId: CATEGORY_IDS.electronics,
    stock: 120,
    imageUrl: 'images/product5.jpg',
  },
  {
    id: 'f0a1b2c3-7e8f-8091-2c3d-4e5f6a7b8c12',
    name: 'Bluetooth Headphones',
    description: 'Wireless on-ear headphones with noise reduction.',
    price: 59.99,
    categoryId: CATEGORY_IDS.electronics,
    stock: 10,
    imageUrl: 'images/product6.jpg',
  },
  {
    id: '0a1b2c3d-8f90-9012-3d4e-5f6a7b8c9d23',
    name: 'Stainless Water Bottle',
    description: 'Insulated bottle keeps drinks cold for 24h.',
    price: 14.99,
    categoryId: CATEGORY_IDS.fitness,
    stock: 0,
    imageUrl: 'images/product7.jpg',
  },
  {
    id: '1b2c3d4e-9f01-0123-4e5f-6a7b8c9d0e34',
    name: 'Yoga Mat',
    description: 'Non-slip surface, 6mm cushioning.',
    price: 21.99,
    categoryId: CATEGORY_IDS.fitness,
    stock: 35,
    imageUrl: 'images/product8.jpg',
  },
  {
    id: '2c3d4e5f-0012-1234-5f6a-7b8c9d0e1f45',
    name: 'LED Desk Lamp',
    description: 'Adjustable brightness with USB charging port.',
    price: 24.99,
    categoryId: CATEGORY_IDS.home,
    stock: 60,
    imageUrl: 'images/product9.jpg',
  },
  {
    id: '3d4e5f6a-1123-2345-6a7b-8c9d0e1f2a56',
    name: 'Cable Organizer',
    description: 'Silicone clips for organizing charging cables.',
    price: 5.99,
    categoryId: CATEGORY_IDS.accessories,
    stock: 200,
    imageUrl: 'images/product10.jpg',
  },
  {
    id: '4e5f6a7b-2234-3456-7b8c-9d0e1f2a3b67',
    name: 'Portable Charger',
    description: '10,000mAh power bank with dual USB output.',
    price: 29.99,
    categoryId: CATEGORY_IDS.electronics,
    stock: 80,
    imageUrl: 'images/product11.jpg',
  },
  {
    id: '5f6a7b8c-3345-4567-8c9d-0e1f2a3b4c78',
    name: 'Noise Reduction Earplugs',
    description: 'Reusable earplugs for focus and quiet.',
    price: 11.49,
    categoryId: CATEGORY_IDS.accessories,
    stock: 0,
    imageUrl: 'images/product12.jpg',
  },
  {
    id: '6a7b8c9d-4456-5678-9d0e-1f2a3b4c5d89',
    name: 'Ergonomic Keyboard',
    description: 'Split design reduces wrist strain.',
    price: 49.99,
    categoryId: CATEGORY_IDS.electronics,
    stock: 15,
    imageUrl: 'images/product13.jpg',
  },
  {
    id: '7b8c9d0e-5567-6789-0e1f-2a3b4c5d6e90',
    name: 'Adjustable Monitor Stand',
    description: 'Raises screen to eye level; includes storage drawer.',
    price: 32.0,
    categoryId: CATEGORY_IDS.office,
    stock: 42,
    imageUrl: 'images/product14.jpg',
  },
  {
    id: '8c9d0e1f-6678-7890-1f2a-3b4c5d6e7f01',
    name: 'Screen Cleaning Kit',
    description: 'Microfiber cloth + gentle cleaning spray.',
    price: 9.5,
    categoryId: CATEGORY_IDS.accessories,
    stock: 100,
    imageUrl: 'images/product15.jpg',
  },
  {
    id: '9d0e1f2a-7789-8901-2a3b-4c5d6e7f8012',
    name: 'Smart LED Strip',
    description: 'Color-changing strip with app control.',
    price: 18.75,
    categoryId: CATEGORY_IDS.home,
    stock: 0,
    imageUrl: 'images/product16.jpg',
  },
  {
    id: '0e1f2a3b-8890-9012-3b4c-5d6e7f8a9123',
    name: 'Multi-Port USB Hub',
    description: 'Adds 4 extra USB 3.0 ports.',
    price: 16.5,
    categoryId: CATEGORY_IDS.electronics,
    stock: 77,
    imageUrl: 'images/product17.jpg',
  },
  {
    id: '1f2a3b4c-9901-0123-4c5d-6e7f8a9b0234',
    name: 'Cable Management Box',
    description: 'Hide power strips and cable clutter.',
    price: 22.5,
    categoryId: CATEGORY_IDS.home,
    stock: 33,
    imageUrl: 'images/product18.jpg',
  },
  {
    id: '2a3b4c5d-0012-1234-5d6e-7f8a9b0c1345',
    name: 'Wireless Presenter',
    description: 'Slide navigation + laser pointer.',
    price: 27.0,
    categoryId: CATEGORY_IDS.office,
    stock: 12,
    imageUrl: 'images/product19.jpg',
  },
  {
    id: '3b4c5d6e-1123-2345-6e7f-8a9b0c1d2456',
    name: 'Portable Tripod',
    description: 'Lightweight adjustable tripod for cameras and phones.',
    price: 23.49,
    categoryId: CATEGORY_IDS.accessories,
    stock: 58,
    imageUrl: 'images/product20.jpg',
  },
] as const;

export async function seedProducts(): Promise<SeedResult> {
  const beforeCount = await Product.countDocuments({});

  let inserted = 0;
  let matched = 0;

  for (let i = 0; i < SEED_PRODUCTS.length; i += 1) {
    const p = SEED_PRODUCTS[i];
    // Perform upsert identical to original behavior for idempotency & validation consistency.
    const res = await Product.updateOne(
      { id: p.id },
      { $setOnInsert: p },
      { upsert: true }
    );
    const upserted = (res as { upsertedCount?: number; upsertedId?: unknown }).upsertedCount === 1 || Boolean(
      (res as { upsertedId?: unknown }).upsertedId
    );
    if (upserted) {
      inserted += 1;
      continue; // Newly inserted already has imageUrl & stock from seed definition.
    }
    matched += 1;
    // Existing product: patch ONLY missing fields (do not overwrite present values).
    const existing = await Product.findOne({ id: p.id }, { imageUrl: 1, stock: 1 }).lean();
    if (!existing) continue; // Defensive; should not occur since upsert said matched.
    const update: Record<string, unknown> = {};
    const needsImage = !('imageUrl' in existing) || !existing.imageUrl;
    if (needsImage) {
      // Pad image number to two digits for deterministic fallback ONLY when missing.
      const num = String(i + 1).padStart(2, '0');
      update.imageUrl = `images/product${num}.jpg`;
    }
    const needsStock = !('stock' in existing) || existing.stock === undefined || existing.stock === null;
    if (needsStock) {
      update.stock = p.stock;
    }
    if (Object.keys(update).length > 0) {
      await Product.updateOne({ id: p.id }, { $set: update });
    }
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
