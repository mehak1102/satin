import crypto from 'crypto';
import { env } from '../config/env.js';
import { razorpay } from '../config/razorpay.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { SiteSetting } from '../models/SiteSetting.js';
import { sendMail } from './mail.service.js';
import { notifyOrderPaid, notifyOrderRefunded } from './order-mail.js';
import { ApiError } from '../utils/ApiError.js';

function toPaise(rupees) {
  return Math.round(Number(rupees) * 100);
}

export async function quoteOrder(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new ApiError(400, 'Your cart is empty.');
  }

  const ids = rawItems.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: ids }, active: true });
  const byId = new Map(products.map((product) => [product._id.toString(), product]));

  const lines = [];
  let subtotal = 0;

  for (const item of rawItems) {
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw new ApiError(400, 'Choose a quantity between 1 and 20.');
    }
    const product = byId.get(String(item.productId));
    if (!product) throw new ApiError(400, 'A product in your cart is no longer available.');
    if (product.stock < quantity) {
      throw new ApiError(400, `${product.name} does not have enough stock.`);
    }

    const unitPrice = product.price;
    const lineTotal = Math.round(unitPrice * quantity * 100) / 100;
    subtotal += lineTotal;
    lines.push({
      product: product._id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      image: product.images?.[0]?.url || '',
      unitPrice,
      quantity,
      lineTotal,
    });
  }

  subtotal = Math.round(subtotal * 100) / 100;
  const settings = await SiteSetting.findOne({ key: 'store' }).lean();
  const method = settings?.shipping?.methods?.[0];
  let shipping = 0;
  if (method) {
    const freeAbove = method.freeAbove == null ? null : Number(method.freeAbove);
    shipping = freeAbove != null && subtotal >= freeAbove ? 0 : Number(method.price || 0);
  }
  const tax = Math.round(subtotal * Number(settings?.taxRate || 0) * 100) / 100;
  const discount = 0;
  const total = Math.round((subtotal - discount + shipping + tax) * 100) / 100;

  return { lines, subtotal, discount, shipping, shippingName: method?.name ? String(method.name) : "", tax, total };
}

export async function createRazorpayCheckout({ user, contactEmail, shippingAddress, items }) {
  if (!razorpay) throw new ApiError(503, 'Payments are not configured yet.');

  const quote = await quoteOrder(items);
  const orderNumber = `SAT-${Date.now().toString(36).toUpperCase()}`;
  const order = await Order.create({
    orderNumber,
    user: user._id,
    items: quote.lines,
    shippingAddress,
    contactEmail,
    subtotal: quote.subtotal,
    discount: quote.discount,
    shipping: quote.shipping,
    tax: quote.tax,
    total: quote.total,
    currency: 'INR',
    paymentStatus: 'pending',
    orderStatus: 'pending',
  });

  let razorpayOrder;
  try {
    razorpayOrder = await razorpay.orders.create({
      amount: toPaise(quote.total),
      currency: 'INR',
      receipt: order.orderNumber.slice(0, 40),
      notes: { orderId: order._id.toString(), orderNumber: order.orderNumber },
    });
  } catch (error) {
    // Razorpay's own 401 must not reach the browser, where it reads as a signed-out session.
    await Order.deleteOne({ _id: order._id });
    console.error('Razorpay order failed:', error?.statusCode, error?.error?.description || error?.message);
    throw new ApiError(502, 'Payment could not be started. Please try again shortly.');
  }

  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  return {
    keyId: env.razorpayKeyId,
    orderId: order._id,
    orderNumber: order.orderNumber,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    razorpayOrderId: razorpayOrder.id,
    summary: {
      subtotal: quote.subtotal,
      discount: quote.discount,
      shipping: quote.shipping,
      tax: quote.tax,
      total: quote.total,
    },
  };
}

function signaturesMatch(expected, received) {
  const a = Buffer.from(expected);
  const b = Buffer.from(String(received || ''));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function verifyCheckoutSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  if (!env.razorpayKeySecret) throw new ApiError(503, 'Payments are not configured yet.');
  const expected = crypto
    .createHmac('sha256', env.razorpayKeySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
  if (!signaturesMatch(expected, razorpaySignature)) {
    throw new ApiError(400, 'Payment could not be verified.');
  }
}

export async function markOrderPaid(razorpayOrderId, razorpayPaymentId) {
  const order = await Order.findOne({ razorpayOrderId });
  if (!order) return null;
  if (order.paymentStatus === 'paid') {
    await notifyOrderPaid(order);
    return order;
  }

  order.paymentStatus = 'paid';
  order.orderStatus = 'confirmed';
  order.razorpayPaymentId = razorpayPaymentId || order.razorpayPaymentId;

  if (!order.stockAdjusted) {
    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
      );
    }
    order.stockAdjusted = true;
  }

  await order.save();
  await notifyOrderPaid(order);
  return order;
}

export async function markOrderFailed(razorpayOrderId) {
  const order = await Order.findOne({ razorpayOrderId, paymentStatus: 'pending' });
  if (!order) return null;
  order.paymentStatus = 'failed';
  order.orderStatus = 'cancelled';
  await order.save();
  return order;
}

export async function markOrderRefunded(razorpayOrderId, send = sendMail) {
  const order = await Order.findOne({ razorpayOrderId });
  if (!order) return null;

  if (order.paymentStatus !== 'refunded') {
    if (order.stockAdjusted) {
      for (const item of order.items) {
        await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } });
      }
      order.stockAdjusted = false;
    }

    order.paymentStatus = 'refunded';
    order.orderStatus = 'cancelled';
    await order.save();
  }

  await notifyOrderRefunded(order, send);
  return Order.findById(order._id);
}

export function verifyWebhookSignature(rawBody, signature) {
  if (!env.razorpayWebhookSecret) {
    throw new ApiError(503, 'Payment webhooks are not configured yet.');
  }
  const expected = crypto.createHmac('sha256', env.razorpayWebhookSecret).update(rawBody).digest('hex');
  if (!signaturesMatch(expected, signature)) {
    throw new ApiError(400, 'Invalid webhook signature.');
  }
}
