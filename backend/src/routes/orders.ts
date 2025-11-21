import { Router, Request, Response } from 'express';
import Order, { OrderItemSnapshot } from '../models/order';
import Product from '../models/product';

type BulkUpdateOp = { updateOne: { filter: Record<string, unknown>; update: Record<string, unknown> } };

const router = Router();

// POST /api/orders
router.post('/orders', async (req: Request, res: Response) => {
  try {
    const { items } = req.body as { items?: Array<{ productId: string; quantity: number }> };
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items array required and must be non-empty' });
    }
    const productIds = items.map(i => i.productId);
    const products = await Product.find({ id: { $in: productIds } }).lean();
    const map = new Map(products.map(p => [p.id, p]));
    for (const line of items) {
      const prod = map.get(line.productId);
      if (!prod) return res.status(400).json({ error: `product ${line.productId} not found` });
      if (!Number.isInteger(line.quantity) || line.quantity < 1) {
        return res.status(400).json({ error: 'quantity must be integer >= 1' });
      }
      if (prod.stock < line.quantity) {
        return res.status(409).json({ error: `insufficient stock for product ${prod.id}` });
      }
    }
    const bulk: BulkUpdateOp[] = products.map(p => {
      const reqItem = items.find(i => i.productId === p.id)!;
      return {
        updateOne: {
          filter: { id: p.id, stock: { $gte: reqItem.quantity } },
          update: { $inc: { stock: -reqItem.quantity } },
        },
      };
    });
    const bulkResult = await Product.bulkWrite(bulk);
    interface BulkWriteResultMinimal { matchedCount?: number }
    const matchedCount = (bulkResult as unknown as BulkWriteResultMinimal).matchedCount ?? 0;
    if (matchedCount !== items.length) {
      return res.status(409).json({ error: 'stock changed concurrently; order aborted' });
    }
    const snapshot = items.map(i => {
      const p = map.get(i.productId)!;
      return { productId: p.id, name: p.name, price: p.price, quantity: i.quantity };
    });
    const order = await Order.create({ items: snapshot as OrderItemSnapshot[] });
    res.status(201).json(order.toJSON());
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[orders.post] error', e);
    res.status(500).json({ error: 'internal error' });
  }
});

// GET /api/orders/:id
router.get('/orders/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ id }).lean();
    if (!order) return res.status(404).json({ error: 'order not found' });
    res.json(order);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[orders.get] error', e);
    res.status(500).json({ error: 'internal error' });
  }
});

export default router;
