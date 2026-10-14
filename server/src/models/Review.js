import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true, default: '' },
    comment: { type: String, trim: true, required: true, maxlength: 2000 },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true },
);

reviewSchema.index({ product: 1, approved: 1, createdAt: -1 });
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

export const Review = mongoose.model('Review', reviewSchema);
