import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4, validate as uuidValidate, version as uuidVersion } from 'uuid';

// Minimal runtime-shape TypeScript types (avoid strict Mongoose generics)
export type ProductDocument = {
  id: string;
  name: string;
  description: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
};

const ProductSchema = new Schema(
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
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [1, 'name cannot be empty'],
      maxlength: [120, 'name too long'],
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: [1, 'description cannot be empty'],
      maxlength: [1000, 'description too long'],
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'price must be >= 0'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc: any, ret: any) => {
        delete ret._id;
        return ret;
      },
    },
  } as any
);

// Unique constraint already applied at path level via `unique: true` above

// Export a permissively-typed model (avoids Mongoose TS generic friction)
export const Product = (mongoose.models.Product as any) || mongoose.model('Product', ProductSchema);

export default Product as any;
