import request from 'supertest';
import app from '../../src/app';
import { connectDB, disconnectDB } from '../../src/config/db';
import Product from '../../src/models/product';
import Order from '../../src/models/order';

/**
 * T188: Order PII rejection test (FR-056 / SC-033)
 * Submitting an order with disallowed PII fields must yield 400 validation_error and create no order.
 */

describe('Order PII rejection', () => {
  let productId: string;
  let baselineCount = 0;

  beforeAll(async () => {
    await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/product_catalog_order_pii_test');
    // Create product directly (orders are anonymous) for snapshot inclusion
    const p = await Product.create({
      name: 'PIIProd', description: 'Desc', price: 5, stock: 10, imageUrl: 'http://x/img.png'
    });
    productId = p.id;
    baselineCount = await Order.countDocuments();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  test('rejects order with customerEmail PII field (validation_error)', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        items: [{ productId, quantity: 1 }],
        customerEmail: 'test@example.com'
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('validation_error');
    expect(res.body.message).toMatch(/Disallowed PII field/i);
    const after = await Order.countDocuments();
    expect(after).toBe(baselineCount); // no order created
  });

  test('rejects order with multiple PII fields', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        items: [{ productId, quantity: 1 }],
        creditCard: '4111111111111111',
        ssn: '123-45-6789'
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('validation_error');
    const after = await Order.countDocuments();
    expect(after).toBe(baselineCount); // still no order created
  });

  test('valid order without PII succeeds (201)', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ items: [{ productId, quantity: 2 }] });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    const after = await Order.countDocuments();
    expect(after).toBe(baselineCount + 1);
  });
});
