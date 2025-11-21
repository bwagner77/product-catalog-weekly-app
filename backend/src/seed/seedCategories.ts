import Category from '../models/category';

export type SeedCategoriesResult = {
  inserted: number;
  matched: number;
  beforeCount: number;
  afterCount: number;
};

// Deterministic category set (≥5) with stable UUIDs referenced by product seeds
const SEED_CATEGORIES = [
  { id: '11111111-1111-4111-8111-111111111111', name: 'Electronics' },
  { id: '22222222-2222-4222-8222-222222222222', name: 'Office' },
  { id: '33333333-3333-4333-8333-333333333333', name: 'Accessories' },
  { id: '44444444-4444-4444-8444-444444444444', name: 'Home' },
  { id: '55555555-5555-4555-8555-555555555555', name: 'Fitness' },
];

export async function seedCategories(): Promise<SeedCategoriesResult> {
  const beforeCount = await Category.countDocuments({});
  let inserted = 0;
  let matched = 0;

  for (const c of SEED_CATEGORIES) {
    const res = await Category.updateOne({ id: c.id }, { $setOnInsert: c }, { upsert: true });
    const upserted = (res as { upsertedCount?: number; upsertedId?: unknown }).upsertedCount === 1 || Boolean(
      (res as { upsertedId?: unknown }).upsertedId
    );
    if (upserted) inserted += 1;
    else matched += 1;
  }

  const afterCount = await Category.countDocuments({});

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: 'info',
      event: 'seed_categories_verification',
      inserted,
      matched,
      beforeCount,
      afterCount,
      requiredMin: SEED_CATEGORIES.length,
      status: afterCount >= SEED_CATEGORIES.length ? 'ok' : 'insufficient',
    })
  );

  return { inserted, matched, beforeCount, afterCount };
}

export default seedCategories;
