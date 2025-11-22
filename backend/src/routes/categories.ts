import { Router, Request, Response, NextFunction } from 'express';
import Category from '../models/category';
import Product from '../models/product';
import { authAdmin } from '../middleware/authAdmin';
import { validationError, categoryNameConflict, notFound } from '../utils/errors';

const router = Router();

// Legacy environment gating removed; RBAC enforced via authAdmin middleware.

// GET /api/categories
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await Category.find({}).lean();
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

// GET /api/categories/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cat = await Category.findOne({ id: req.params.id }).lean();
    if (!cat) return res.status(404).json(notFound('Category not found'));
    res.json(cat);
  } catch (err) {
    next(err);
  }
});

// POST /api/categories
router.post('/', authAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body || {};
    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json(validationError('Category name required'));
    }
    // Explicit duplicate check to avoid relying solely on background index creation timing.
    const patternCreate = '^' + name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$';
    const existing = await Category.findOne({ name: { $regex: patternCreate, $options: 'i' } }).lean();
    if (existing) {
      return res.status(409).json(categoryNameConflict());
    }
    const created = await Category.create({ name: name.trim() });
    res.status(201).json(created.toJSON());
  } catch (err: unknown) {
    if (err instanceof Error && /E11000/.test(err.message)) {
      return res.status(409).json(categoryNameConflict());
    }
    next(err);
  }
});

// PUT /api/categories/:id
router.put('/:id', authAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body || {};
    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json(validationError('Category name required'));
    }
    const trimmed = name.trim();
    const patternUpdate = '^' + trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$';
    const duplicate = await Category.findOne({ name: { $regex: patternUpdate, $options: 'i' }, id: { $ne: req.params.id } }).lean();
    if (duplicate) {
      return res.status(409).json(categoryNameConflict());
    }
    const updated = await Category.findOneAndUpdate(
      { id: req.params.id },
      { name: trimmed },
      { new: true, runValidators: true }
    ).lean();
    if (!updated) return res.status(404).json(notFound('Category not found'));
    res.json(updated);
  } catch (err: unknown) {
    if (err instanceof Error && /E11000/.test(err.message)) {
      return res.status(409).json(categoryNameConflict());
    }
    next(err);
  }
});

// DELETE /api/categories/:id (guarded)
router.delete('/:id', authAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const existing = await Category.findOne({ id }).lean();
    if (!existing) return res.status(404).json(notFound('Category not found'));
    const productCount = await Product.countDocuments({ categoryId: id });
    if (productCount > 0) {
      return res.status(409).json(validationError('Category has assigned products'));
    }
    await Category.deleteOne({ id });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;