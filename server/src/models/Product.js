import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    publicId: { type: String, default: '' },
    url: { type: String, default: '' },
    alt: { type: String, default: '' },
  },
  { _id: false },
);

const specSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDescription: { type: String, default: '' },
    description: { type: String, default: '' },
    images: [imageSchema],
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: null },
    discount: { type: Number, default: 0, min: 0 },
    sku: { type: String, required: true, unique: true, trim: true },
    category: { type: String, required: true, trim: true },
    size: { type: String, default: '' },
    packSize: { type: Number, default: null },
    stock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 10, min: 0 },
    features: [{ type: String }],
    specifications: [specSchema],
    active: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'INR' },
    dataNotes: { type: String, default: '' },
  },
  { timestamps: true },
);

productSchema.index({ name: 'text', description: 'text', shortDescription: 'text', sku: 'text', category: 'text' });
productSchema.index({ category: 1, active: 1, featured: 1, price: 1, createdAt: -1 });

export const Product = mongoose.model('Product', productSchema);
