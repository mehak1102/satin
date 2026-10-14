import mongoose from 'mongoose';
import { z } from 'zod';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Review } from '../models/Review.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parseBody } from '../validators/index.js';

const createBody = z.object({
  productId: z.string().refine((value) => mongoose.isValidObjectId(value), 'Choose a pack.'),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional().default(''),
  comment: z.string().trim().min(10).max(2000),
});

const reviewPatch = z.object({
  approved: z.boolean(),
});

function assertId(id) {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(404, 'That record was not found.');
}

function publicReview(review, { includeApproved = false } = {}) {
  const item = {
    id: review._id,
    rating: review.rating,
    title: review.title || '',
    comment: review.comment,
    createdAt: review.createdAt,
    name: review.user?.name || 'Customer',
  };
  if (includeApproved) item.approved = review.approved;
  return item;
}

async function hasPaidOrder(userId, productId) {
  return Boolean(
    await Order.exists({
      user: userId,
      paymentStatus: 'paid',
      'items.product': productId,
    }),
  );
}

export const listRecent = asyncHandler(async (_req, res) => {
  const reviews = await Review.find({ approved: true })
    .sort({ createdAt: -1 })
    .limit(6)
    .populate('user', 'name')
    .populate('product', 'name slug');
  res.json({
    success: true,
    reviews: reviews
      .filter((review) => review.product?.slug)
      .map((review) => ({
        ...publicReview(review),
        productName: review.product.name,
        productSlug: review.product.slug,
      })),
  });
});

export const listApproved = asyncHandler(async (req, res) => {
  assertId(req.params.productId);
  const reviews = await Review.find({ product: req.params.productId, approved: true })
    .sort({ createdAt: -1 })
    .populate('user', 'name');
  res.json({ success: true, reviews: reviews.map((review) => publicReview(review)) });
});

export const myReview = asyncHandler(async (req, res) => {
  assertId(req.params.productId);
  const [canReview, review] = await Promise.all([
    hasPaidOrder(req.user._id, req.params.productId),
    Review.findOne({ user: req.user._id, product: req.params.productId }).populate('user', 'name'),
  ]);
  res.json({
    success: true,
    canReview,
    review: review ? publicReview(review, { includeApproved: true }) : null,
  });
});

export const createReview = asyncHandler(async (req, res) => {
  const data = parseBody(createBody, req.body);
  const product = await Product.findById(data.productId).select('_id');
  if (!product) throw new ApiError(404, 'That pack was not found.');

  const bought = await hasPaidOrder(req.user._id, product._id);
  if (!bought) throw new ApiError(403, 'You can write about a pack after a paid order.');

  const existing = await Review.findOne({ user: req.user._id, product: product._id });
  if (existing) throw new ApiError(409, 'You have already written about this pack.');

  try {
    const review = await Review.create({
      user: req.user._id,
      product: product._id,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      approved: false,
    });
    review.user = { name: req.user.name };
    res.status(201).json({ success: true, review: publicReview(review, { includeApproved: true }) });
  } catch (error) {
    if (error?.code === 11000) throw new ApiError(409, 'You have already written about this pack.');
    throw error;
  }
});

export const listReviews = asyncHandler(async (_req, res) => {
  const reviews = await Review.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('user', 'name')
    .populate('product', 'name slug');
  res.json({
    success: true,
    reviews: reviews.map((review) => ({
      id: review._id,
      rating: review.rating,
      title: review.title || '',
      comment: review.comment,
      approved: review.approved,
      createdAt: review.createdAt,
      name: review.user?.name || 'Customer',
      product: review.product ? { name: review.product.name, slug: review.product.slug } : null,
    })),
  });
});

export const updateReview = asyncHandler(async (req, res) => {
  assertId(req.params.id);
  const data = parseBody(reviewPatch, req.body);
  const review = await Review.findByIdAndUpdate(req.params.id, { approved: data.approved }, { new: true });
  if (!review) throw new ApiError(404, 'That note was not found.');
  res.json({ success: true, review: { id: review._id, approved: review.approved } });
});

export const deleteReview = asyncHandler(async (req, res) => {
  assertId(req.params.id);
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) throw new ApiError(404, 'That note was not found.');
  res.json({ success: true });
});
