import { Router, Request, Response, NextFunction } from 'express';
import Product from '../models/product';

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

export default router;
