import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4, validate as uuidValidate, version as uuidVersion } from 'uuid';
import { roundCurrency } from '../utils/money';

export type OrderItemSnapshot = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

export type OrderDocument = {
  id: string;
  items: OrderItemSnapshot[];
  total: number;
  status: 'submitted';
  createdAt: Date;
  updatedAt: Date;
};

const OrderItemSchema = new Schema<OrderItemSnapshot>(
  {
    productId: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: [0, 'price must be >= 0'] },
    quantity: { type: Number, required: true, min: [1, 'quantity must be >= 1'] },
  },
  { _id: false }
);

const OrderSchema = new Schema<OrderDocument>(
  {
    id: {
      type: String,
      default: () => uuidv4(),
      immutable: true,
      required: true,
      unique: true,
      validate: {
        validator: (v: string) => uuidValidate(v) && uuidVersion(v) === 4,
        message: 'id must be a valid UUID v4',
      },
    },
    items: { type: [OrderItemSchema], required: true, validate: [(arr: OrderItemSnapshot[]) => arr.length > 0, 'items must not be empty'] },
    total: { type: Number, required: true, min: [0, 'total must be >= 0'] },
    status: { type: String, required: true, enum: ['submitted'], default: 'submitted' },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret._id;
        return ret;
      },
    },
  }
);

// Pre-validate hook to compute total once (round half-up to two decimals)
OrderSchema.pre('validate', function computeTotal(this: mongoose.Document & OrderDocument) {
  if (!this.isModified('items')) return; // only recompute if items changed
  const sum = this.items.reduce((acc, it) => acc + it.price * it.quantity, 0);
  this.total = roundCurrency(sum);
});

export const Order = (mongoose.models.Order as mongoose.Model<OrderDocument>) || mongoose.model<OrderDocument>('Order', OrderSchema);
export default Order;
