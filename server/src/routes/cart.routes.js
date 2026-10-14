import mongoose from 'mongoose';
import { Router } from 'express';
import { z } from 'zod';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parseBody } from '../validators/index.js';

const router = Router();

const quantityMessage = 'Choose a quantity between 1 and 20.';

const itemBody = z.object({
  productId: z.string().refine((value) => mongoose.isValidObjectId(value)),
  quantity: z.coerce.number().int().min(1).max(20),
});

const replaceBody = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1),
        quantity: z.coerce.number().int().min(1).max(20),
      }),
    )
    .max(20),
});

const productFields = 'name slug price images stock active';

function clientItems(cart) {
  const items = [];
  for (const entry of cart?.items || []) {
    const product = entry.product;
    if (!product?.active || product.stock < 1) continue;
    items.push({
      id: product._id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url || '',
      stock: product.stock,
      quantity: Math.min(entry.quantity, product.stock, 20),
    });
  }
  return items;
}

async function loadCart(userId) {
  return Cart.findOne({ user: userId }).populate({ path: 'items.product', select: productFields });
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const cart = await loadCart(req.user._id);
    res.json({ success: true, items: clientItems(cart) });
  }),
);

router.put(
  '/',
  asyncHandler(async (req, res) => {
    const data = parseBody(replaceBody, req.body);
    const ids = [...new Set(data.items.map((item) => item.productId))].filter((id) => mongoose.isValidObjectId(id));
    const products = await Product.find({ _id: { $in: ids }, active: true }).select(productFields);
    const byId = new Map(products.map((product) => [product._id.toString(), product]));
    const quantities = new Map();

    for (const item of data.items) {
      const product = byId.get(item.productId);
      if (!product || product.stock < 1) continue;
      const next = Math.min(product.stock, 20, (quantities.get(product._id.toString()) || 0) + item.quantity);
      quantities.set(product._id.toString(), next);
    }

    const items = [...quantities].map(([id, quantity]) => ({ product: id, quantity }));
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items }, $setOnInsert: { user: req.user._id } },
      { upsert: true, returnDocument: 'after' },
    );
    await cart.populate({ path: 'items.product', select: productFields });
    res.json({ success: true, items: clientItems(cart) });
  }),
);

router.post(
  '/items',
  asyncHandler(async (req, res) => {
    const data = parseBody(itemBody, req.body);
    const product = await Product.findOne({ _id: data.productId, active: true });
    if (!product) throw new ApiError(404, 'Product not found.');
    if (product.stock < data.quantity) throw new ApiError(400, 'Not enough stock for that quantity.');

    const cart = (await Cart.findOne({ user: req.user._id })) || new Cart({ user: req.user._id, items: [] });
    const existing = cart.items.find((item) => item.product.toString() === product._id.toString());
    const nextQty = (existing?.quantity || 0) + data.quantity;
    if (nextQty > 20) throw new ApiError(400, quantityMessage);
    if (nextQty > product.stock) throw new ApiError(400, 'Not enough stock for that quantity.');
    if (existing) existing.quantity = nextQty;
    else cart.items.push({ product: product._id, quantity: data.quantity });
    await cart.save();
    res.status(201).json({ success: true, cart: await loadCart(req.user._id) });
  }),
);

router.patch(
  '/items/:productId',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.productId)) throw new ApiError(404, 'Item is not in the cart.');
    const quantity = Number(req.body.quantity);
    if (!Number.isInteger(quantity) || quantity > 20) throw new ApiError(400, quantityMessage);
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) throw new ApiError(404, 'Cart is empty.');
    const item = cart.items.find((entry) => entry.product.toString() === req.params.productId);
    if (!item) throw new ApiError(404, 'Item is not in the cart.');
    if (quantity <= 0) {
      cart.items = cart.items.filter((entry) => entry.product.toString() !== req.params.productId);
    } else {
      const product = await Product.findById(req.params.productId);
      if (!product || quantity > product.stock) throw new ApiError(400, 'Not enough stock for that quantity.');
      item.quantity = quantity;
    }
    await cart.save();
    res.json({ success: true, cart: await loadCart(req.user._id) });
  }),
);

router.delete(
  '/items/:productId',
  asyncHandler(async (req, res) => {
    await Cart.updateOne({ user: req.user._id }, { $pull: { items: { product: req.params.productId } } });
    res.json({ success: true, cart: await loadCart(req.user._id) });
  }),
);

export default router;

