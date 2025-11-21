import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4, validate as uuidValidate, version as uuidVersion } from 'uuid';

export type CategoryDocument = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  _id?: mongoose.Types.ObjectId; // internal mongoose id
};

const CategorySchema = new Schema(
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
      maxlength: [80, 'name too long'],
      unique: true,
    },
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

// Manual duplicate guard to ensure immediate uniqueness before index build completes.
CategorySchema.pre('save', async function (next) {
  const self = this as mongoose.Document;
  if (!self.isModified('name')) return next();
  try {
    const name = String(self.get('name'));
    const _id = self.get('_id');
    const existing = await Category.findOne({ name, _id: { $ne: _id } }).lean();
    if (existing) return next(new Error('duplicate key: name'));
    return next();
  } catch (err) {
    return next(err as Error);
  }
});

export const Category = (mongoose.models.Category as mongoose.Model<CategoryDocument>) || mongoose.model<CategoryDocument>('Category', CategorySchema);
export default Category;
