import mongoose from 'mongoose';
import { Router } from 'express';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate({ path: 'wishlist', select: '-dataNotes' });
    const items = (user?.wishlist || []).filter(Boolean);
    res.json({ success: true, items });
  }),
);

router.post(
  '/:productId',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.productId)) throw new ApiError(404, 'Product not found.');
    const product = await Product.findOne({ _id: req.params.productId, active: true });
    if (!product) throw new ApiError(404, 'Product not found.');
    await User.updateOne({ _id: req.user._id }, { $addToSet: { wishlist: product._id } });
    res.status(201).json({ success: true });
  }),
);

router.delete(
  '/:productId',
  asyncHandler(async (req, res) => {
    await User.updateOne({ _id: req.user._id }, { $pull: { wishlist: req.params.productId } });
    res.json({ success: true });
  }),
);

export default router;
