import { Router, Request, Response, NextFunction } from 'express';
import Product from '../models/product';
import { authAdmin } from '../middleware/authAdmin';

const router = Router();

// GET /api/products
router.get('/products', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, categoryId } = req.query as { search?: string; categoryId?: string };
    const filter: Record<string, unknown> = {};

    if (categoryId && typeof categoryId === 'string' && categoryId.trim()) {
      filter.categoryId = categoryId.trim();
    }

    if (search && typeof search === 'string') {
      const phrase = search.trim();
      if (phrase.length) {
        // Escape regex special chars for literal substring match (case-insensitive)
        const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'i');
        filter.$or = [{ name: regex }, { description: regex }];
      }
    }

    // Use lean for performance and exclude internal _id; cap at 100 (no pagination)
    const products = await Product.find(filter, { _id: 0 }).limit(100).lean().exec();
    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
});

// POST /api/products (admin only)
router.post('/products', authAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, price, imageUrl, stock, categoryId } = req.body || {};
    if (
      typeof name !== 'string' || !name.trim() ||
      typeof description !== 'string' || !description.trim() ||
      typeof price !== 'number' || price < 0 ||
      typeof imageUrl !== 'string' || !imageUrl.trim() ||
      typeof stock !== 'number' || stock < 0
    ) {
      return res.status(400).json({ message: 'invalid product fields' });
    }
    const created = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price,
      imageUrl: imageUrl.trim(),
      stock,
      categoryId: typeof categoryId === 'string' && categoryId.trim() ? categoryId.trim() : undefined,
    });
    res.status(201).json(created.toJSON());
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id (admin only)
router.put('/products/:id', authAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, price, imageUrl, stock, categoryId } = req.body || {};
    if (
      (name && (typeof name !== 'string' || !name.trim())) ||
      (description && (typeof description !== 'string' || !description.trim())) ||
      (price !== undefined && (typeof price !== 'number' || price < 0)) ||
      (imageUrl && (typeof imageUrl !== 'string' || !imageUrl.trim())) ||
      (stock !== undefined && (typeof stock !== 'number' || stock < 0))
    ) {
      return res.status(400).json({ message: 'invalid product fields' });
    }
    const update: Record<string, unknown> = {};
    if (name) update.name = (name as string).trim();
    if (description) update.description = (description as string).trim();
    if (price !== undefined) update.price = price;
    if (imageUrl) update.imageUrl = (imageUrl as string).trim();
    if (stock !== undefined) update.stock = stock;
    if (typeof categoryId === 'string') update.categoryId = categoryId.trim();
    const updated = await Product.findOneAndUpdate({ id: req.params.id }, update, { new: true, runValidators: true }).lean();
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:id (admin only)
router.delete('/products/:id', authAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await Product.findOne({ id: req.params.id }).lean();
    if (!existing) return res.status(404).json({ message: 'Not found' });
    await Product.deleteOne({ id: req.params.id });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
