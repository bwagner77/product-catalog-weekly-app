import { Router, Request, Response, NextFunction } from 'express';
import Product from '../models/product';

const router = Router();

// GET /api/products
router.get('/products', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // Use lean for performance and exclude internal _id
    const products = await Product.find({}, { _id: 0 }).lean().exec();
    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
});

export default router;
