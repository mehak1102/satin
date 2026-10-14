import { Router } from 'express';
import { Order } from '../models/Order.js';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { env } from '../config/env.js';
import { razorpayEnabled } from '../config/razorpay.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parseBody } from '../validators/index.js';
import {
  createRazorpayCheckout,
  markOrderFailed,
  markOrderPaid,
  markOrderRefunded,
  quoteOrder,
  verifyCheckoutSignature,
  verifyWebhookSignature,
} from '../services/payment.service.js';

const router = Router();

const checkoutSchema = z.object({
  contactEmail: z.string().trim().email(),
  shippingAddress: z.object({
    fullName: z.string().trim().min(2).max(80),
    phone: z.string().trim().min(8).max(20),
    line1: z.string().trim().min(3).max(160),
    line2: z.string().trim().max(160).optional().default(''),
    city: z.string().trim().min(2).max(80),
    state: z.string().trim().min(2).max(80),
    postalCode: z.string().trim().min(4).max(12),
    country: z.string().trim().min(2).max(80).optional().default('India'),
  }),
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(20),
});

const verifySchema = z.object({
  razorpayOrderId: z.string().trim().min(1),
  razorpayPaymentId: z.string().trim().min(1),
  razorpaySignature: z.string().trim().min(1),
});

router.get('/config', (_req, res) => {
  res.json({
    success: true,
    provider: 'razorpay',
    keyId: env.razorpayKeyId || '',
    enabled: razorpayEnabled(),
  });
});

router.post(
  '/quote',
  asyncHandler(async (req, res) => {
    const data = parseBody(z.object({ items: checkoutSchema.shape.items }), req.body);
    const quote = await quoteOrder(data.items);
    res.json({ success: true, quote });
  }),
);

router.post(
  '/create-order',
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = parseBody(checkoutSchema, req.body);
    const checkout = await createRazorpayCheckout({
      user: req.user,
      contactEmail: data.contactEmail,
      shippingAddress: data.shippingAddress,
      items: data.items,
    });
    res.status(201).json({ success: true, checkout });
  }),
);

router.post(
  '/verify',
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = parseBody(verifySchema, req.body);
    verifyCheckoutSignature(data);
    const existing = await Order.findOne({ razorpayOrderId: data.razorpayOrderId }).select('user');
    if (!existing || existing.user.toString() !== req.user._id.toString()) {
      throw new ApiError(404, 'Order not found.');
    }
    const order = await markOrderPaid(data.razorpayOrderId, data.razorpayPaymentId);
    res.json({ success: true, order });
  }),
);

router.post(
  '/webhook',
  asyncHandler(async (req, res) => {
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body || {}));
    verifyWebhookSignature(rawBody, req.get('x-razorpay-signature'));

    const event = JSON.parse(rawBody.toString('utf8'));
    const payment = event?.payload?.payment?.entity;
    const refund = event?.payload?.refund?.entity;
    const razorpayOrderId = payment?.order_id || refund?.order_id || '';

    if (event.event === 'payment.captured' && razorpayOrderId) {
      await markOrderPaid(razorpayOrderId, payment.id);
    } else if (event.event === 'payment.failed' && razorpayOrderId) {
      await markOrderFailed(razorpayOrderId);
    } else if ((event.event === 'refund.processed' || event.event === 'refund.created') && razorpayOrderId) {
      await markOrderRefunded(razorpayOrderId);
    }

    res.json({ success: true });
  }),
);

export default router;
